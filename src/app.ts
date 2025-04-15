import { Logger } from "@logtape/logtape";
import { AppServices, ILocalizationService } from "./services/index.ts";

export class Application {
	private readonly logger: Logger;
	private readonly localizationService: ILocalizationService;

	constructor({ logger, localizationService }: AppServices) {
		this.logger = logger;
		this.localizationService = localizationService;
	}

	public async start() {
		//TODO: app initialization
		this.logger.info`Application has been started.`;

		this.logger.info`${await this.localizationService.getTranslation(
			"hello.world",
		)}`;
		this.logger.info`${await this.localizationService.getTranslation(
			"hello.world",
			{},
			"en",
		)}`;
		this.logger.info`${await this.localizationService.getTranslation(
			"hello.world",
			{},
			"ua",
		)}`;

		// templates

		this.logger.info`${await this.localizationService.getTranslation(
			"greetings",
		)}`;
		this.logger.info`${await this.localizationService.getTranslation(
			"greetings",
			{ userName: "Maksym" },
			"en",
		)}`;
		this.logger.info`${await this.localizationService.getTranslation(
			"greetings",
			{ userName: "Максим" },
			"ua",
		)}`;
	}
}
