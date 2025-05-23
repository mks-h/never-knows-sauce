import { Logger } from "@logtape/logtape";
import { fetchHikkaMedia } from "../providers/HikkaProvider.ts";
import { TelegramApiClient, TgMessage } from "./TelegramApiClient.ts";
import { fetchAniListMedia } from "../providers/AniListProvider.ts";
import { ProviderResponse } from "../providers/ProviderResponse.ts";
import { LocalizationService } from "./LocalizationService.ts";
import { AppConfig } from "../config/AppConfig.ts";

const Writings = ["english", "romaji", "native", "ukrainian"] as const;
const Sources = ["hikka", "anilist"] as const;

type FetchedInfo = { [key in (typeof Sources)[number]]?: ProviderResponse };

export class TelegramChatUI {
	constructor(
		private logger: Logger,
		private client: TelegramApiClient,
		private l10n: LocalizationService,
		private appConfig: AppConfig,
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

		const { hikka, anilist } = info;

		const { result: title } = fallback(
			this.appConfig.preferredWriting,
			Writings,
			(writing) => {
				switch (writing) {
					case "ukrainian":
						return hikka?.title.ukrainian;
					case "english":
						return hikka?.title.english ?? anilist?.title.english;
					case "romaji":
						return hikka?.title.romaji ?? anilist?.title.romaji;
					case "native":
						return hikka?.title.native ?? anilist?.title.native;
				}
			},
		);

		const { result: url, leftovers: otherSources } = fallback(
			this.appConfig.preferredSource,
			Sources,
			(source) => {
				return info[source]?.url;
			},
		);

		let msg = `<b><a href="${url}">${title}</a></b>`;

		for (const source of otherSources) {
			if (info[source]) {
				msg += ` • <a href="${info[source].url}">${mapSourceName(source)}</a>`;
			}
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

function fallback<T, U>(
	preferred: T,
	options: readonly T[],
	cb: (value: T[][number]) => U | undefined,
): {
	result: U | undefined;
	leftovers: T[][number][];
} {
	const queue = options.slice();
	let res;
	do {
		res = cb(preferred);
		const preferredIndex = queue.findIndex((v) => v === preferred);
		if (preferredIndex > -1) {
			queue.splice(preferredIndex, 1);
		}

		if (!queue[0]) break;
		else preferred = queue[0];
	} while (!res && queue.length !== 0);
	return { result: res, leftovers: queue };
}

function mapSourceName(source: (typeof Sources)[number]): string {
	switch (source) {
		case "hikka":
			return "Hikka";
		case "anilist":
			return "AniList";
	}
}
