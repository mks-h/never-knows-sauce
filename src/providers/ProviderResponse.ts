import { AppConfig } from "../config/AppConfig.ts";

export interface ProviderResponse {
	title: { [key in AppConfig["preferredWriting"]]?: string };
	synonyms: string[];
	url: string;
}
