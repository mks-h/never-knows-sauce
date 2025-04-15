import { Application } from "../app.ts";
import { AppConfig } from "../config/AppConfig.ts";
import { ILocalizationService } from "./LocalizationService.ts";
import { DbClient } from "../db/index.ts";
import { SeedService } from "./index.ts";
import { Logger } from "@logtape/logtape";

export interface AppServices {
	//application
	logger: Logger;
	appConfig: AppConfig;
	application: Application;
	dbClient: DbClient;

	//services
	localizationService: ILocalizationService;
	seedService: SeedService;
}
