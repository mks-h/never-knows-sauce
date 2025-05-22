import { Logger } from "@logtape/logtape";
import { LocalizationService } from "./services/LocalizationService.ts";
import {
	TelegramBotService,
	TelegramStrategy,
} from "./services/TelegramService.ts";
import { AppConfig } from "./config/AppConfig.ts";

export class Application {
	constructor(
		private readonly logger: Logger,
		private readonly l10n: LocalizationService,
		private readonly appConfig: AppConfig,
	) {}

	public async start(): Promise<void> {
		this.logger.info`Application has been started.`;

		this.logger.info`${this.l10n.getTranslation("hello.world")}`;
		this.logger.info`${this.l10n.getTranslation("hello.world", {}, "en")}`;
		this.logger.info`${this.l10n.getTranslation("hello.world", {}, "ua")}`;

		const tgService = new TelegramBotService(
			this.logger.getChild("telegram-bot-service"),
			this.appConfig.telegramToken,
			this.l10n,
		);

		const me = await tgService.identifyBot();
		this.logger.info`Connected Telegram bot information: ${me}`;

		switch (this.appConfig.telegramStrategy) {
			case TelegramStrategy.Webhook: {
				this.logger.info`Starting Telegram Bot with Webhook strategy`;

				Deno.serve(tgService.handleWebhook);
				break;
			}
			case TelegramStrategy.LongPolling: {
				this.logger.info`Starting Telegram Bot with Long Polling strategy`;

				tgService.handleLongPolling();
				break;
			}
			default: {
				throw new Error(
					`The value of telegram strategy is erroneous: ${this.appConfig.telegramStrategy}`,
				);
			}
		}
	}
}
