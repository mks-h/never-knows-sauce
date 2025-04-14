export class BaseLocalizationService {
	public applyTemplateValuesToLocalization(
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
