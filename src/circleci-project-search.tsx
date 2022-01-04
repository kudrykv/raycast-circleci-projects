import { getLocalStorageItem, getPreferenceValues, setLocalStorageItem, showToast, ToastStyle } from "@raycast/api";
import { useEffect, useState } from "react";
import got from "got";
import { ListCircleCIProjects } from "./ListCircleCIProjects";


const Command = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projectURIs, setProjectURIs] = useState<string[]>([]);

  let temp: string[] = [];
  const restore = (list: string[]) => {
    setProjectURIs(list);
    setIsLoading(false);
  };

  const reload = () => Promise.resolve()
    .then(() => setIsLoading(true))
    .then(() => temp = projectURIs)
    .then(() => setProjectURIs([]))
    .then(() => pullProjectsFromCircleCI())
    .then(list => cacheIfPulled({ list, cache: false }))
    .then(setProjectURIs)
    .then(() => setIsLoading(false))
    .catch(showErrorRestoreList(temp, restore));

  useEffect(() => {
    getCircleCIProjectFromCache()
      .then(pullIfNoCircleCIProjectsWereFound)
      .then(cacheIfPulled)
      .then(setProjectURIs)
      .then(() => setIsLoading(false))
      .catch(showErrorRestoreList(temp, restore));
  }, []);

  return <ListCircleCIProjects isLoading={isLoading} uris={projectURIs} onReload={reload} />;
};

// noinspection JSUnusedGlobalSymbols
export default Command;


const circleCIHeaders = {
  headers: {
    "Circle-Token": getPreferenceValues()["api-token"],
    "Accept": "application/json"
  }
};


const KEY_PROJECT_URIS = "project-uris";


const getCircleCIProjectFromCache = (): Promise<string[]> =>
  getLocalStorageItem(KEY_PROJECT_URIS)
    .then(serialized => {
      if (!serialized || typeof serialized !== "string") {
        return [];
      }

      const parsed = JSON.parse(serialized) as string[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed;
    });


const pullProjectsFromCircleCI = () => got
  .get("https://circleci.com/api/v1.1/me", circleCIHeaders)
  .json()
  .then((json) => (json as { projects: Record<string, unknown> }).projects)
  .then(Object.keys);


const pullIfNoCircleCIProjectsWereFound = (list: string[]): Promise<{ list: string[], cache: boolean }> =>
  new Promise(resolve => {
    if (list.length > 0) {
      return resolve({ list, cache: true });
    }

    return pullProjectsFromCircleCI()
      .then(list => resolve({ list, cache: false }));
  });


const cacheIfPulled = ({ list, cache }: { list: string[], cache: boolean }) =>
  cache
    ? list
    : setLocalStorageItem(KEY_PROJECT_URIS, JSON.stringify(list)).then(() => list);


const showErrorRestoreList =
  (list: string[], restore: (list: string[]) => void) =>
    (e: Error) => {
      showToast(ToastStyle.Failure, e.message);
      restore(list);
    };
