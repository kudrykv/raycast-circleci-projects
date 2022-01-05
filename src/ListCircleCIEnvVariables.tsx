import { useEffect, useState } from "react";
import { List, showToast, ToastStyle } from "@raycast/api";
import { circleCIListEnvVarsForProject } from "./circleci-functions";

export interface ListCircleCIEnvVariablesParams {
  uri: string;
  full_name: string;
}

export const ListCircleCIEnvVariables = ({ uri, full_name }: ListCircleCIEnvVariablesParams) => {
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    circleCIListEnvVarsForProject(uri)
      .then(setRecords)
      .then(() => setIsLoading(false))
      .catch(e => showToast(ToastStyle.Failure, e.message));
  }, []);

  return <List isLoading={isLoading} navigationTitle={full_name}>
    {records.map(
      rec => <List.Item key={rec["name"]} title={rec["name"]} subtitle={rec["value"]} />
    )}
  </List>;
};
