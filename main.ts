import { Application } from "./app.ts";
import { EnvVariable } from "./config/AppConfig.ts";
import { AppConfig, AppConfigEnvVariables } from "./config/index.ts";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { getAppServices } from "./services/index.ts";

const validateEnvironmentVariables = (vars: {
  [key: string]: EnvVariable & { value: string | undefined };
}) => {
  Object.keys(vars).forEach((varName) => {
    const variable = vars[varName];

    if (variable.required && !variable.value) {
      throw new Error(
        `${varName} is required for project startup. Please check your '.env' file.`,
      );
    }

    if (!variable.value && !!variable.default) {
      vars[varName].value = variable.default;
    }
  });
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

    const services = await getAppServices(appConfig, logger);

    const app = new Application(
      appConfig,
      logger,
      services.LocalizationService,
    );

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
