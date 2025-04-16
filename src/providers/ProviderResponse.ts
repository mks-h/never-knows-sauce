export interface ProviderResponse {
	title: {
		romaji?: string;
		english?: string;
		ukrainian?: string;
		native: string;
	};
	synonyms: string[];
	url: string;
}
