import "jsr:@std/dotenv/load";
import { TelegramStrategy } from "../services/TelegramService.ts";

export interface AppConfig {
	dbConnectionString: string;
	telegramToken: string;
	telegramStrategy: TelegramStrategy;
	defaultLanguage: string;
	isDebug: boolean;
}

export const prepareAppConfig = (): AppConfig => {
	const required = getRequiredVars();
	const optional = getOptionalVars();

	return {
		dbConnectionString: required.DB_CONNECTION_STRING,
		telegramToken: required.TELEGRAM_TOKEN,
		telegramStrategy: validateTelegramStrategy(required.TELEGRAM_STRATEGY),
		defaultLanguage: optional.DEFAULT_LANGUAGE,
		isDebug: optional.DEBUG === "1",
	};
};

export function getRequiredVars() {
	const requiredVars = [
		"TELEGRAM_TOKEN",
		"TELEGRAM_STRATEGY",
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

function validateTelegramStrategy(value: string) {
	switch (value) {
		case "webhook":
			return TelegramStrategy.Webhook;
		case "longpolling":
			return TelegramStrategy.LongPolling;
		default:
			throw new Error(
				`The specified telegram strategy is not expected: ${value}`,
			);
	}
}
