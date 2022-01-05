import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { circleCIPipelines, PipelineItem } from "./circleci-functions";

interface Params {
  full_name: string;
  uri: string;
}

export const ListCircleCIProjectPipelines = ({ full_name, uri }: Params) => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<PipelineItem[]>([]);

  useEffect(() => {
    circleCIPipelines(uri)
      .then(setItems)
      .then(() => setIsLoading(false));
  }, []);

  return <List isLoading={isLoading} navigationTitle={full_name}>
    {items.map(item => <List.Item
      key={item.id}
      title={item.vcs.tag || item.vcs.branch || 'Oh no'}
      accessoryTitle={new Date(item.created_at).toLocaleDateString()}
    />)}
  </List>;
};
