import { Logger } from "@logtape/logtape";

export class TelegramApiClient {
	constructor(
		private logger: Logger,
		private token: string,
	) {
		this.logger.info`Constructed Telegram API client`;
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

	async sendMessage(body: object) {
		return await this.runMethod<TgMessage>("sendMessage", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...body,
			}),
		});
	}
}

export interface TgUser {
	id: number;
	is_bot: boolean;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
	is_premium?: boolean;
	added_to_attachment_menu?: boolean;
}

export interface TgBot extends TgUser {
	can_join_groups?: boolean;
	can_read_all_group_messages?: boolean;
	supports_inline_queries?: boolean;
	can_connect_to_business?: boolean;
	has_main_web_app?: boolean;
}

export interface TgChat {
	id: number;
	type: "private" | "group" | "supergroup" | "channel";
	title?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
	is_forum?: boolean;
}

export interface TgMessageEntity {
	type:
		| "mention"
		| "hashtag"
		| "cashtag"
		| "bot_command"
		| "url"
		| "email"
		| "phone_number"
		| "bold"
		| "italic"
		| "underline"
		| "strikethrough"
		| "spoiler"
		| "blockqoute"
		| "expandable_blockqoute"
		| "code"
		| "pre"
		| "text_link"
		| "text_mention"
		| "custom_emoji";
	offset: number;
	length: number;
	url?: string;
	user?: TgUser;
	language?: string;
	custom_emoji_id?: string;
}

export interface TgMessage {
	message_id: number;
	from?: TgUser;
	sender_chat?: TgChat;
	chat: TgChat;
	text?: string;
	entities?: TgMessageEntity[];
}

export interface TgUpdate {
	update_id: number;
	message: TgMessage;
}

export interface MethodResponse<T> {
	ok: boolean;
	result: T;
}
