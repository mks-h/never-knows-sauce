import { Logger } from "@logtape/logtape";
import { getLocalizationsFromFiles, Locales } from "../i18n/i18n.ts";

export class LocalizationService {
	public isInitialized: boolean;

	private readonly logger: Logger;
	private readonly defaultLanguage: string;
	private localizations?: Locales;

	constructor(logger: Logger, defaultLanguage: string) {
		this.logger = logger;
		this.isInitialized = false;
		this.defaultLanguage = defaultLanguage;
	}

	public async initialize(): Promise<void> {
		this.localizations = await getLocalizationsFromFiles();

		this.logger.debug`App found next localizations: ${
			Object.keys(
				this.localizations,
			).join(", ")
		}`;

		if (!this.localizations[this.defaultLanguage]) {
			throw new Error(
				`Localization config does not contain the provided default language '${this.defaultLanguage}'`,
			);
		}

		this.isInitialized = true;

		this.logger.info`Localization service was successfully initialized.`;
	}

	getTranslation(
		key: string,
		templateValues?: { [key: string]: string },
		locale?: string,
	): string {
		locale = locale || this.defaultLanguage;
		if (!this.isInitialized) {
			this.logger
				.warn`Try to get localization before service initialization. An empty result are returned`;

			return "";
		}

		let targetLocalization = this.localizations?.[locale]?.[key] || "";

		if (!targetLocalization && locale !== this.defaultLanguage) {
			this.logger
				.debug`Try to get empty key '${key}' for '${locale}' locale. Attempt to get key from default '${this.defaultLanguage}' locale.`;

			targetLocalization = this.localizations?.[this.defaultLanguage]?.[key] ||
				"";
		}

		if (!targetLocalization) {
			this.logger
				.warn`Try to get empty key '${key}' for '${this.defaultLanguage}' locale`;
			return "";
		}

		return this.applyTemplateValuesToLocalization(
			targetLocalization,
			templateValues,
		);
	}

	applyTemplateValuesToLocalization(
		localization: string,
		templateValues?: { [key: string]: string },
	): string {
		if (!templateValues) {
			return localization;
		}

		let result = localization;

		Object.entries(templateValues).forEach(([key, value]) => {
			result = result.replaceAll(`{{${key}}}`, value);
		});

		return result;
	}
}
