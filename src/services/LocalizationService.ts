import { Logger } from "@logtape/logtape";
import { AppServices, BaseLocalizationService } from "./index.ts";
import { LocalizationEntry } from "../models/index.ts";
import { Model } from "npm:mongoose";

export interface ILocalizationService {
	getTranslation(
		key: string,
		templateValues?: { [key: string]: string },
		locale?: string,
	): Promise<string>;
}

export class LocalizationService extends BaseLocalizationService
	implements ILocalizationService {
	private readonly logger: Logger;
	private readonly defaultLanguage: string;
	private readonly localizationEntry: Model<LocalizationEntry>;

	constructor({ logger, appConfig, dbClient }: AppServices) {
		super();
		this.logger = logger;
		this.defaultLanguage = appConfig.DefaultLanguage;
		this.localizationEntry = dbClient.getCollectionModel("LocalizationEntry");
	}

	async getTranslation(
		key: string,
		templateValues?: { [key: string]: string },
		locale?: string,
	): Promise<string> {
		locale = locale || this.defaultLanguage;

		let targetLocalization = await this.getTranslationFromDb(key, locale);

		if (!targetLocalization && locale !== this.defaultLanguage) {
			this.logger
				.debug`Try to get empty key '${key}' for '${locale}' locale. Attempt to get key from default '${this.defaultLanguage}' locale.`;

			targetLocalization = await this.getTranslationFromDb(
				key,
				this.defaultLanguage,
			);
		}

		if (!targetLocalization) {
			this.logger
				.warn`Try to get empty key '${key}' for '${this.defaultLanguage}' locale`;
			return "";
		}

		return this.applyTemplateValuesToLocalization(
			targetLocalization.localization,
			templateValues,
		);
	}

	private async getTranslationFromDb(key: string, locale: string) {
		return await this.localizationEntry.findOne({
			$and: [
				{
					path: {
						$eq: key,
					},
				},
				{
					locale: {
						$eq: locale,
					},
				},
			],
		});
	}
}
