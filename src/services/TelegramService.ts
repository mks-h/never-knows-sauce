import { Logger } from "@logtape/logtape";

export enum TelegramStrategy {
	Webhook = "Webhook",
	LongPolling = "Long Polling",
}

export class TelegramBotService {
	private offset: number = 0;

	constructor(
		private logger: Logger,
		private token: string,
	) {
		this.logger.info`Constructed Telegram Bot service`;
	}

	protected methodURL(name: string): URL {
		return new URL(name, `https://api.telegram.org/bot${this.token}/`);
	}

	protected async runMethod<T>(
		name: string,
		options: RequestInit,
	): Promise<T> {
		const resp = await fetch(this.methodURL(name), options);

		if (!resp.ok) {
			throw new Error("Response is not OK", {
				cause: resp,
			});
		}

		const value = await resp.json() as MethodResponse<T>;
		if (!value.ok) {
			throw new Error("Telegram's repsonse is not OK", {
				cause: value,
			});
		}

		return value.result;
	}

	protected handleUpdates(updates: TgUpdate[]) {
		this.logger.info`UPDATES: ${updates}`;
	}

	async handleLongPolling() {
		while (true) {
			const updates = await this.getUpdates({
				offset: this.offset ?? undefined,
				timeout: 30000,
			});

			const offset = updates[updates.length - 1]?.update_id;
			if (offset) this.offset = offset + 1;

			this.handleUpdates(updates);
		}
	}

	async handleWebhook(req: Request): Promise<Response> {
		if (req.method !== "POST") {
			return new Response(null, {
				status: 405,
				statusText: "That way's like, not a thing…",
			});
		}

		let updates;
		try {
			updates = await req.json() as TgUpdate[];
		} catch {
			return new Response(null, {
				status: 400,
				statusText: "You typed dumb, it's broke.",
			});
		}

		this.handleUpdates(updates);

		return new Response(null, {
			status: 200,
			statusText: "Kickass!",
		});
	}

	async getMe(): Promise<TgBot> {
		return await this.runMethod<TgBot>("getMe", {
			method: "GET",
		});
	}

	async getUpdates(body?: object): Promise<TgUpdate[]> {
		return await this.runMethod<TgUpdate[]>("getUpdates", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				allowed_updates: ["message"],
				...body,
			}),
		});
	}
}

interface TgUser {
	id: number;
	is_bot: boolean;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
	is_premium?: boolean;
	added_to_attachment_menu?: boolean;
}

interface TgBot extends TgUser {
	can_join_groups?: boolean;
	can_read_all_group_messages?: boolean;
	supports_inline_queries?: boolean;
	can_connect_to_business?: boolean;
	has_main_web_app?: boolean;
}

interface TgChat {
	id: number;
	type: "private" | "group" | "supergroup" | "channel";
	title?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
	is_forum?: boolean;
}

interface TgMessage {
	message_id: number;
	from?: TgUser;
	sender_chat?: TgChat;
	chat: TgChat;
	text?: string;
}

interface TgUpdate {
	update_id: number;
	message: TgMessage;
}

interface MethodResponse<T> {
	ok: boolean;
	result: T;
}
