import "jsr:@std/dotenv/load";

export interface AppConfig {
	dbConnectionString: string;
	telegramToken: string;
	defaultLanguage: string;
	isDebug: boolean;
}

export const prepareAppConfig = (): AppConfig => {
	const required = getRequiredVars();
	const optional = getOptionalVars();

	return {
		dbConnectionString: required.DB_CONNECTION_STRING,
		telegramToken: required.TELEGRAM_TOKEN,
		defaultLanguage: optional.DEFAULT_LANGUAGE,
		isDebug: optional.DEBUG === "1",
	};
};

export function getRequiredVars() {
	const requiredVars = [
		"TELEGRAM_TOKEN",
		"DB_CONNECTION_STRING",
	] as const;

	const res: { [key: string]: string } = {};
	for (const key of requiredVars) {
		const env = Deno.env.get(key);
		if (!env) throw new Error(`${key} is required for project startup.`);

		res[key] = env;
	}

	return res as {
		[key in (typeof requiredVars)[number]]: string;
	};
}

function getOptionalVars() {
	const optionalVars = {
		// VARIABLE_NAME: "DEFAULT VALUE"
		DEFAULT_LANGUAGE: "en",
		DEBUG: "0",
	} as const;

	const res: { [key: string]: string } = {};
	for (const key in optionalVars) {
		res[key] = Deno.env.get(key) ??
			optionalVars[key as keyof typeof optionalVars];
	}

	return res as {
		[key in keyof typeof optionalVars]: string;
	};
}
