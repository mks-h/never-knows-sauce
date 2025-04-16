import { Logger } from "@logtape/logtape";
import { AppConfig } from "../config/index.ts";
import { LocalizationService } from "./index.ts";
import { DbClient } from "../db/index.ts";

export interface AppServices {
	LocalizationService: LocalizationService;
	DbClient: DbClient;
}

const initializeServices = async (
	services: {
		initialize: () => Promise<void>;
	}[],
) => {
	await Promise.all(
		services.map(async (service) => await service.initialize()),
	);
};

export const getAppServices = async (appConfig: AppConfig, logger: Logger) => {
	const localizationService = new LocalizationService(
		logger,
		appConfig.DefaultLanguage,
	);

	const dbClient = new DbClient(appConfig, logger);

	const appServices: AppServices = {
		LocalizationService: localizationService,
		DbClient: dbClient,
	};

	logger.info`Services was successfully created.`;

	const servicesToInitialize = Object.values(appServices).filter(
		(service) => "initialize" in service,
	);

	await initializeServices(servicesToInitialize);

	logger.debug`Services ${
		servicesToInitialize
			.map((service) => service.constructor.name)
			.join(",")
	} was successfully initialized`;

	return appServices;
};
