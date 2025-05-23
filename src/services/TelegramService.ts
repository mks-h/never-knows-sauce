import { Logger } from "@logtape/logtape";
import { TelegramApiClient, TgBot, TgUpdate } from "./TelegramApiClient.ts";
import { TelegramChatUI } from "./TelegramChatUI.ts";
import { LocalizationService } from "./LocalizationService.ts";
import { AppConfig } from "../config/AppConfig.ts";

export enum TelegramStrategy {
	Webhook = "Webhook",
	LongPolling = "Long Polling",
}

export class TelegramBotService {
	private client: TelegramApiClient;
	private chatUI: TelegramChatUI;
	private offset: number = 0;

	constructor(
		private logger: Logger,
		token: string,
		l10n: LocalizationService,
		appConfig: AppConfig,
	) {
		this.client = new TelegramApiClient(logger.getChild("api"), token);
		this.chatUI = new TelegramChatUI(
			logger.getChild("chat-ui"),
			this.client,
			l10n,
			appConfig,
		);
		this.logger.info`Constructed Telegram Bot service`;
	}

	protected handleUpdates(updates: TgUpdate[]) {
		this.logger.info`UPDATES: ${updates}`;
		for (const update of updates) {
			this.chatUI.handleUpdate(update.message);
		}
	}

	async handleLongPolling() {
		while (true) {
			const updates = await this.client.getUpdates({
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

	async identifyBot(): Promise<TgBot> {
		return await this.client.getMe();
	}
}
