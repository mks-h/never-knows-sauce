import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { initLocalazationService } from "./src/services/LocalizationService.ts";
import { Application } from "./src/app.ts";
import { initDbClient } from "./src/db/DatabaseClient.ts";
import { prepareAppConfig } from "./src/config/AppConfig.ts";

async function start() {
	try {
		const appConfig = prepareAppConfig();

		await configure({
			sinks: { console: getConsoleSink() },
			loggers: [
				{
					category: "app",
					lowestLevel: appConfig.isDebug ? "debug" : "info",
					sinks: ["console"],
				},
			],
		});

		const logger = getLogger("app");
		logger.debug`ENV VARIABLES: ${appConfig}`;

		await using _dbClient = initDbClient(logger, appConfig.dbConnectionString);
		const localizationService = await initLocalazationService(
			logger,
			appConfig.defaultLanguage,
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
