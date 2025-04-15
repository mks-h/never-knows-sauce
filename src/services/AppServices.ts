import { Logger } from "https://jsr.io/@logtape/logtape/0.9.0/logger.ts";
import { Application } from "../app.ts";
import { AppConfig } from "../config/AppConfig.ts";
import { ILocalizationService } from "./LocalizationService.ts";
import { DbClient } from "../db/index.ts";
import { SeedService } from "./index.ts";

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
