import { Model } from "npm:mongoose";
import { AppServices } from "./index.ts";
import { LocalizationEntry } from "../models/index.ts";
import { Logger } from "@logtape/logtape";
import { getLocalizationsFromFiles, Locales } from "../i18n/i18n.ts";
import { AppConfig } from "../config/index.ts";

export interface ISeedService {
	seed(): Promise<void> | void;
}

export class SeedService implements ISeedService {
	private logger: Logger;
	private localizationEntryModel: Model<LocalizationEntry>;
	private appConfig: AppConfig;

	constructor({ dbClient, logger, appConfig }: AppServices) {
		this.localizationEntryModel = dbClient.getCollectionModel(
			"LocalizationEntry",
		);
		this.logger = logger;
		this.appConfig = appConfig;
	}

	async seed(): Promise<void> {
		await this.seedLocalizations();
	}

	private async seedLocalizations() {
		await this.localizationEntryModel.deleteMany({});

		const localizations: Locales = await getLocalizationsFromFiles();

		this.logger.debug`App found next localizations: ${
			Object.keys(
				localizations,
			).join(", ")
		}`;

		if (!localizations[this.appConfig.DefaultLanguage]) {
			throw new Error(
				`Localization config does not contain the provided default language '${this.appConfig.DefaultLanguage}'`,
			);
		}

		const localizationModels = Object.entries(localizations).reduce(
			(acc, [locale, data]) => {
				return [
					...acc,
					...Object.entries(data).map(([path, localization]) => ({
						path,
						localization,
						locale,
					})),
				];
			},
			new Array<Partial<LocalizationEntry>>(),
		);

		await this.localizationEntryModel.insertMany(localizationModels);

		this.logger.info`Localizations was successfully seeded.`;
	}
}
