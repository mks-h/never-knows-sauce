import mongoose from "npm:mongoose";
import { IInitializable } from "../interfaces/index.ts";
import { Logger } from "@logtape/logtape";
import {
	ApplicationModels,
	ApplicationSchemas,
	ModelType,
} from "../models/index.ts";
import { AppConfig } from "../config/index.ts";
import { IDisposable } from "../interfaces/index.ts";

export class DbClient implements IInitializable, IDisposable {
	isInitialized: boolean;

	private readonly connectionString: string;
	private connection: mongoose.Connection | null;
	private logger: Logger;

	constructor(appConfig: AppConfig, logger: Logger) {
		this.connectionString = appConfig.DbConnectionString;
		this.isInitialized = false;
		this.connection = null;
		this.logger = logger;
	}

	getCollectionModel<T extends ApplicationModels>(
		name: T,
	): mongoose.Model<ModelType<T>> {
		if (!this.isInitialized || !this.connection) {
			throw new Error(
				"Try to get MongoDb collection before client initialization",
			);
		}

		return this.connection.model<ModelType<T>>(name, ApplicationSchemas[name]);
	}

	initialize() {
		if (!this.isInitialized) {
			this.connection = mongoose.createConnection(this.connectionString);
			this.logger.info`MongoDb connection was successfully created.`;
			this.logger.debug`MongoDb connection string: ${this.connectionString}`;
			this.isInitialized = true;
		}
	}

	async dispose() {
		if (this.isInitialized) {
			this.logger.info`MongoDB connection was closed`;
			await this.connection?.close();
		}
	}
}
