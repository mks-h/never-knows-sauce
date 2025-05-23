import { Logger } from "@logtape/logtape";
import { getLocalizationsFromFiles, Locales } from "../i18n/i18n.ts";

export async function initLocalazationService(
	logger: Logger,
	defaultLanguage: string,
): Promise<LocalizationService> {
	logger = logger.getChild("localization-service");

	const localizations = await getLocalizationsFromFiles();

	logger.debug`App found next localizations: ${
		Object.keys(
			localizations,
		).join(", ")
	}`;

	if (!localizations[defaultLanguage]) {
		throw new Error(
			`Localization config does not contain the provided default language '${defaultLanguage}'`,
		);
	}

	logger.info`Localization service was successfully initialized.`;
	return new LocalizationService(logger, defaultLanguage, localizations);
}

export class LocalizationService {
	constructor(
		private readonly logger: Logger,
		private readonly defaultLanguage: string,
		private localizations: Locales,
	) {}

	getTranslation(
		key: string,
		templateValues?: { [key: string]: string },
		locale?: string,
	): string {
		locale = locale || this.defaultLanguage;

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
