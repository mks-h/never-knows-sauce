import { ProviderResponse } from "./ProviderResponse.ts";

const hikkaApiUrl = "https://api.hikka.io";

const hikkaUrl = "https://hikka.io";

export const fetchHikkaMedia = async (
  query: string,
  type: "anime" | "manga" | "novel"
): Promise<ProviderResponse[]> => {
  const response: {
    list: {
      slug: string;
      title_en?: string;
      title_ua?: string;

      //anime only
      title_ja?: string;

      //manga, novel only
      title_original?: string;
    }[];
  } = await fetch(`${hikkaApiUrl}/${type}?size=10`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  }).then((response) => response.json());

  return response.list.map((x) => ({
    title: {
      native: x.title_original || x.title_ja || "",
      romaji: x.title_ja || x.title_original,
      english: x.title_en,
      ukrainian: x.title_ua,
    },
    url: `${hikkaUrl}/${type}/${x.slug}`,
    synonyms: [],
  }));
};
