import { Logger } from "@logtape/logtape";
import { AppConfig } from "../config/index.ts";
import { ISeedService, LocalizationService, SeedService } from "./index.ts";
import { IInitializable } from "../interfaces/index.ts";
import { asClass, asValue, createContainer } from "npm:awilix";
import { Application } from "../app.ts";
import { DbClient } from "../db/index.ts";

const initializeServices = async (services: IInitializable[]) => {
	await Promise.all(
		services.map(async (service) => await service.initialize()),
	);
};

export const getAppServices = async (appConfig: AppConfig, logger: Logger) => {
	const diContainer = createContainer({
		injectionMode: "PROXY",
	});

	//Database client should be initialized before container setup
	const dbClient = new DbClient(appConfig, logger);
	await dbClient.initialize();

	diContainer.register({
		//application
		logger: asValue(logger),
		appConfig: asValue(appConfig),
		application: asClass(Application).singleton(),
		dbClient: asValue(dbClient),

		//services
		localizationService: asClass(LocalizationService),
		seedService: asClass(SeedService),
	});

	logger.info`Services was successfully created.`;

	const serviceNames = Object.keys(diContainer.cradle);

	const servicesToInitialize: IInitializable[] = serviceNames.reduce(
		(acc, next) => {
			if (diContainer.cradle[next].initialize) {
				return [...acc, diContainer.cradle[next]];
			}

			return acc;
		},
		new Array<IInitializable>(),
	);

	await initializeServices(servicesToInitialize);

	const seedService: ISeedService = diContainer.cradle["seedService"];

	await seedService.seed();

	logger.info`Db seeding completed`;

	logger.debug`Services ${
		servicesToInitialize
			.map((service) => service.constructor.name)
			.join(", ")
	} was successfully initialized`;

	return diContainer;
};
