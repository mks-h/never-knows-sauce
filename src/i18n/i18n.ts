import { readdir, readFile } from "node:fs/promises";

export interface Locales {
	//key - language code
	[key: string]: {
		[key: string]: string;
	};
}

export const getLocalizationsFromFiles = async () => {
	const dirPath = `${import.meta.dirname}/localizations/`;
	const files = await readdir(dirPath);

	const promises = files.map(async (filename) => {
		const localeName = filename.replace(".json", "");

		const localeStrings = await readFile(`${dirPath}${filename}`, "utf-8");

		return {
			locale: localeName,
			data: JSON.parse(localeStrings),
		};
	});

	const data = await Promise.all(promises);

	return data.reduce((acc, next) => {
		return { ...acc, [next.locale]: next.data };
	}, {});
};
