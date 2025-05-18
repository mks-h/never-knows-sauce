import mongoose, { Schema } from "npm:mongoose";
import { Logger } from "@logtape/logtape";

export function initDbClient(logger: Logger, connectionString: string) {
	logger = logger.getChild("db-client");

	const connection = mongoose.createConnection(connectionString);
	logger.info`MongoDb connection was successfully created.`;
	logger.debug`MongoDb connection string: ${connectionString}`;

	return new DbClient(logger, connection);
}

export class DbClient implements AsyncDisposable {
	constructor(
		private logger: Logger,
		private connection: mongoose.Connection,
	) {}

	getCollectionModel<T>(
		name: string,
		schema: Schema,
	): mongoose.Model<T> {
		return this.connection.model<T>(name, schema);
	}

	async [Symbol.asyncDispose]() {
		this.logger.info`MongoDB connection was closed`;
		await this.connection.close();
	}
}
