import { useEffect, useState } from "react";
import { List, showToast, ToastStyle } from "@raycast/api";

export interface ListCircleCIEnvVariablesParams {
  uri: string;
  full_name: string;
  onListAllEnvs: (uri: string) => Promise<Record<string, string>[]>;
}

export const ListCircleCIEnvVariables = ({ uri, full_name, onListAllEnvs }: ListCircleCIEnvVariablesParams) => {
  const [records, setRecords] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onListAllEnvs(uri)
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
