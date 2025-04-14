import { Logger } from "@logtape/logtape";
import { AppConfig } from "../config/index.ts";
import { ILocalizationService, LocalizationService } from "./index.ts";
import { IInitializable } from "../interfaces/index.ts";

export interface AppServices {
	LocalizationService: ILocalizationService;
}

const initializeServices = async (services: IInitializable[]) => {
	await Promise.all(
		services.map(async (service) => await service.initialize()),
	);
};

export const getAppServices = async (appConfig: AppConfig, logger: Logger) => {
	const localizationService = new LocalizationService(
		logger,
		appConfig.DefaultLanguage,
	);

	const appServices: AppServices = {
		LocalizationService: localizationService,
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
