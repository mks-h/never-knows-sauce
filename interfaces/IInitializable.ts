export interface IInitializable {
	initialize(): Promise<void>;
	isInitialized: boolean;
}
