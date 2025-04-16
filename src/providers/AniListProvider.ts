import { ProviderResponse } from "./ProviderResponse.ts";

const aniListApiUrl = "https://graphql.anilist.co";
const aniListUrl = "https://anilist.co";

const searchQuery = `
  query (
    $page: Int = 1
    $id: Int
    $type: MediaType
    $search: String
    $sort: [MediaSort] = [POPULARITY_DESC, SCORE_DESC]
  ) {
    Page(page: $page, perPage: 10) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        id: $id
        type: $type
        search: $search
        sort: $sort
      ) {
        id
        title {
          english
          romaji
          native
        }
        synonyms
      }
    }
  }
`;

function generateUrlFromAniListMedia(mediaId: number, type: "anime" | "manga") {
  return `${aniListUrl}/${type}/${mediaId}`;
}

export const fetchAniListMedia = async (
  query: string,
  type: "anime" | "manga"
): Promise<ProviderResponse[]> => {
  const response: {
    data: {
      Page: {
        media: {
          id: number;
          title: { english: string; romaji: string; native: string };
          synonyms: string[];
        }[];
      };
    };
  } = await fetch(aniListApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: {
        page: 1,
        search: query,
        sort: "SEARCH_MATCH",
        type: type.toUpperCase(),
      },
    }),
  }).then((response) => response.json());

  return response.data.Page.media.map((x) => ({
    title: x.title,
    url: generateUrlFromAniListMedia(x.id, type),
    synonyms: x.synonyms || [],
  }));
};
