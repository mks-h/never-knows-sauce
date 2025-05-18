import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import {
	AppConfig,
	AppConfigEnvVariables,
	EnvVariable,
} from "./src/config/index.ts";
import { initLocalazationService } from "./src/services/index.ts";
import { Application } from "./src/app.ts";
import { initDbClient } from "./src/db/DatabaseClient.ts";

const validateEnvironmentVariables = (vars: {
	[key: string]: EnvVariable & { value: string | undefined };
}) => {
	for (const [varName, variable] of Object.entries(vars)) {
		if (variable.required && !variable.value) {
			throw new Error(`${varName} is required for project startup.`);
		}

		if (!variable.value && variable.default) {
			variable.value = variable.default;
		}
	}
};

const prepareAppConfig = (): AppConfig => {
	validateEnvironmentVariables(AppConfigEnvVariables);

	return {
		DbConnectionString: AppConfigEnvVariables.DB_CONNECTION_STRING.value!,
		TelegramToken: AppConfigEnvVariables.TELEGRAM_TOKEN.value!,
		DefaultLanguage: AppConfigEnvVariables.DEFAULT_LANGUAGE.value!,
		IsDebug: AppConfigEnvVariables.DEBUG.value === "1",
	};
};

async function start() {
	try {
		const appConfig = prepareAppConfig();

		await configure({
			sinks: { console: getConsoleSink() },
			loggers: [
				{
					category: "app",
					lowestLevel: appConfig.IsDebug ? "debug" : "info",
					sinks: ["console"],
				},
			],
		});

		const logger = getLogger("app");
		logger.debug`ENV VARIABLES:\n${appConfig}`;

		await using _dbClient = initDbClient(logger, appConfig.DbConnectionString);
		const localizationService = await initLocalazationService(
			logger,
			appConfig.DefaultLanguage,
		);

		const app = new Application(logger, localizationService);

		app.start();
	} catch (error) {
		await configure({
			sinks: { console: getConsoleSink() },
			loggers: [
				{
					category: "service",
					lowestLevel: "fatal",
					sinks: ["console"],
				},
			],
			reset: true,
		});
		const serviceLogger = getLogger("service");
		serviceLogger
			.fatal`Something went wrong during application execution: ${error}`;
	}
}

if (import.meta.main) {
	await start();
}
