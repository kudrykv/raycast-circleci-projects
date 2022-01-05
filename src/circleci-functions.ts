import { getPreferenceValues } from "@raycast/api";
import got from "got";


const API_TOKEN = getPreferenceValues()["api-token"];


export const circleCIListProjects = (): Promise<string[]> =>
  got
    .get("https://circleci.com/api/v1.1/me", circleCIHeaders)
    .json()
    .then((json) => (json as { projects: Record<string, unknown> }).projects)
    .then(Object.keys);


export const circleCIListEnvVarsForProject = (uri: string) => {
  const { vcs, full_name } = uriToVCSAndFullName(uri);

  return listEnvVarsForProject({ vcs, full_name });
};


interface ListEnvVarsForProjectParams {
  vcs: string;
  full_name: string;
  next_page?: string;
  acc?: Record<string, string>[];
}

const listEnvVarsForProject = (params: ListEnvVarsForProjectParams): Promise<Record<string, string>[]> => {
  const { vcs, full_name, acc = [], next_page } = params;
  const query = next_page ? `?page-token=${next_page}` : "";

  return got
    .get(`https://circleci.com/api/v2/project/${vcs}/${full_name}/envvar${query}`, circleCIHeaders)
    .json()
    .then(json => json as { items: Record<string, string>[], next_page_token: string })
    .then(({ items, next_page_token }) => {
      if (next_page_token) {
        return listEnvVarsForProject({ vcs, full_name, acc: acc.concat(items), next_page: next_page_token });
      }

      return acc.concat(items);
    });
};


const uriToVCSAndFullName = (uri: string): { vcs: string, full_name: string } => {
  const groups = uri.match(/https?:\/\/(?<host>[^/]+)\/(?<full_name>.+$)/)?.groups;
  if (!groups) {
    throw new Error("Bad URI: " + uri);
  }

  const { host, full_name } = groups;
  const vcs = host === "github.com" ? "gh" : host;

  return { vcs, full_name };
};


const circleCIHeaders = {
  headers: {
    "Circle-Token": API_TOKEN,
    "Accept": "application/json"
  }
};
