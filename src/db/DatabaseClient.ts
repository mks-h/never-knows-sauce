import mongoose, { Schema } from "npm:mongoose";
import { Logger } from "@logtape/logtape";
import { AppConfig } from "../config/index.ts";

export class DbClient {
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

	getCollectionModel<T>(
		name: string,
		schema: Schema,
	): mongoose.Model<T> {
		if (!this.isInitialized || !this.connection) {
			throw new Error(
				"Try to get MongoDb collection before client initialization",
			);
		}

		return this.connection.model<T>(name, schema);
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
