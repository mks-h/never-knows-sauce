import { Logger } from "@logtape/logtape";
import { fetchHikkaMedia } from "../providers/HikkaProvider.ts";
import { TelegramApiClient, TgMessage } from "./TelegramApiClient.ts";
import { fetchAniListMedia } from "../providers/AniListProvider.ts";
import { ProviderResponse } from "../providers/ProviderResponse.ts";
import { LocalizationService } from "./LocalizationService.ts";

type FetchedInfo = {
	hikka?: ProviderResponse;
	anilist?: ProviderResponse;
};

export class TelegramChatUI {
	constructor(
		private logger: Logger,
		private client: TelegramApiClient,
		private l10n: LocalizationService,
	) {}

	protected async fetchInformation(
		name: string,
	): Promise<FetchedInfo> {
		const hikka = await fetchHikkaMedia(name, "anime");

		if (hikka[0]?.title.romaji) {
			name = hikka[0].title.romaji;
		}

		const anilist = await fetchAniListMedia(name, "anime");

		this.logger.debug`FOUND HIKKA: ${hikka}`;
		this.logger.debug`FOUND ANILIST: ${anilist}`;

		return { hikka: hikka[0], anilist: anilist[0] };
	}

	protected presentInformation(
		info: FetchedInfo,
	): string {
		if (!info.hikka && !info.anilist) {
			return this.l10n.getTranslation("source.not.found");
		}

		const title = info.hikka?.title.ukrainian ??
			info.hikka?.title.english ?? info.anilist?.title.english ??
			info.hikka?.title.romaji ?? info.anilist?.title.romaji ??
			info.hikka?.title.native ?? info.anilist?.title.native;

		let msg = `<a href="${info.hikka?.url ?? info.anilist?.url}">${title}</a>`;

		if (info.hikka && info.anilist) {
			msg += ` | <a href="${info.anilist.url}">AL</a>`;
		}

		this.logger.debug`REPLY: ${msg}`;
		return msg;
	}

	protected handleCommand(text: string): string {
		this.logger.debug`COMMAND: ${text}`;
		text = text.trim();

		if (text === "/start") {
			return this.l10n.getTranslation("command.start.message");
		} else return `<i>${this.l10n.getTranslation("command.unrecognized")}</i>`;
	}

	async handleUpdate(message: TgMessage) {
		this.logger.debug`MESSAGE: ${message}`;

		const msg = new MessageFacts(message);

		if (msg.isNotFromUser || !msg.isPrivate) {
			return;
		}

		if (!message.text) return;

		let text: string;
		if (msg.isCommand) {
			text = this.handleCommand(message.text);
		} else {
			const info = await this.fetchInformation(message.text);
			text = this.presentInformation(info);
		}

		await this.client.sendMessage({
			chat_id: message.chat.id,
			text,
			parse_mode: "HTML",
			reply_parameters: {
				message_id: message.message_id,
				allow_sending_without_reply: false,
			},
		});
	}
}

class MessageFacts {
	constructor(
		readonly message: TgMessage,
	) {}

	get isNotFromUser(): boolean {
		return !this.message.from || this.message.from.is_bot;
	}

	get isPrivate(): boolean {
		return this.message.chat.type === "private";
	}

	get isCommand(): boolean {
		return !!this.message.entities?.find((v) => v.type === "bot_command");
	}
}
