import 'jsr:@std/dotenv/load';

export const getEnvironmentVariable = (name: string): string | undefined =>
	Deno.env.get(name);

export interface AppConfig {
	TelegramToken: string;
	DbConnectionString: string;
	DefaultLanguage: string;
	IsDebug: boolean;
}

export interface EnvVariable {
	required: boolean;
	default?: string;
}

export const AppConfigEnvVariables = {
	TELEGRAM_TOKEN: {
		required: true,
		value: getEnvironmentVariable('TELEGRAM_TOKEN'),
	},
	DB_CONNECTION_STRING: {
		required: true,
		value: getEnvironmentVariable('DB_CONNECTION_STRING'),
	},
	DEFAULT_LANGUAGE: {
		required: false,
		default: 'en',
		value: getEnvironmentVariable('DEFAULT_LANGUAGE'),
	},
	DEBUG: {
		required: false,
		default: '0',
		value: getEnvironmentVariable('DEBUG'),
	},
};

