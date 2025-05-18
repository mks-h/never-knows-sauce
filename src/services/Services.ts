import { Logger } from "@logtape/logtape";
import { AppConfig } from "../config/index.ts";
import { initLocalazationService, LocalizationService } from "./index.ts";
import { DbClient, initDbClient } from "../db/index.ts";

export interface AppServices {
	LocalizationService: LocalizationService;
	DbClient: DbClient;
}

export const getAppServices = async (appConfig: AppConfig, logger: Logger) => {
	const localizationService = await initLocalazationService(
		logger,
		appConfig.DefaultLanguage,
	);

	const dbClient = initDbClient(logger, appConfig.DbConnectionString);

	const appServices: AppServices = {
		LocalizationService: localizationService,
		DbClient: dbClient,
	};

	return appServices;
};
