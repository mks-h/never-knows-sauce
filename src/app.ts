import { Logger } from "@logtape/logtape";
import { LocalizationService } from "./services/LocalizationService.ts";

export class Application {
	private readonly logger: Logger;
	private readonly localizationService: LocalizationService;

	constructor(
		logger: Logger,
		localizationService: LocalizationService,
	) {
		this.logger = logger;
		this.localizationService = localizationService;
	}

	public start(): void {
		//TODO: app initialization
		this.logger.info`Application has been started.`;

		this.logger.info`${this.localizationService.getTranslation("hello.world")}`;
		this.logger.info`${
			this.localizationService.getTranslation(
				"hello.world",
				{},
				"en",
			)
		}`;
		this.logger.info`${
			this.localizationService.getTranslation(
				"hello.world",
				{},
				"ua",
			)
		}`;

		// templates

		this.logger.info`${this.localizationService.getTranslation("greetings")}`;
		this.logger.info`${
			this.localizationService.getTranslation(
				"greetings",
				{ userName: "Maksym" },
				"en",
			)
		}`;
		this.logger.info`${
			this.localizationService.getTranslation(
				"greetings",
				{ userName: "Максим" },
				"ua",
			)
		}`;
	}
}
