import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { circleCIPipelines, circleCIWorkflows, PipelineItem } from "./circleci-functions";

interface Params {
  full_name: string;
  uri: string;
}

export const ListCircleCIProjectPipelines = ({ full_name, uri }: Params) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);

  useEffect(() => {
    let cachePipelines: PipelineItem[];

    circleCIPipelines(uri)
      .then(list => cachePipelines = list)
      .then(pipelines => cachePipelines = pipelines)
      .then(setPipelines)
      .then(() => Promise.all(cachePipelines.map(({ id }) => circleCIWorkflows({ id }).then(list => list.pop()))))
      .then(workflows => cachePipelines.forEach((p, i) => p.workflow = workflows[i]))
      .then(() => setIsLoading(false));
  }, []);

  return <List isLoading={isLoading} navigationTitle={full_name}>
    {Object.entries(pipelines.reduce((acc, val) => {
      const date = new Date(val.created_at).toLocaleDateString();

      (acc[date] = acc[date] || []).push(val);

      return acc;
    }, {} as Record<string, PipelineItem[]>))
      .sort(([l], [r]) => new Date(l).getTime() - new Date(r).getTime())
      .reverse()
      .map(([date, entries]) => <List.Section key={date} title={date}>
        {entries.map(item => <List.Item
          key={item.id}
          icon={iconForPipelines(item.workflow?.status || item.state)}
          accessoryIcon={item.trigger.actor.avatar_url || "gearshape-16"}
          title={item.workflow?.status || "No status"}
          subtitle={item.vcs.tag || item.vcs.branch || ""}
          accessoryTitle={item.workflow?.name || "No workflow"}
          keywords={[item.vcs.branch || item.vcs.tag || ""]}
        />)}
      </List.Section>)}
  </List>;
};

const iconForPipelines = (status: string | undefined) => {
  switch (status) {
    case "success":
      return "✅";
    case "failed":
      return "❌";
    case "canceled":
      return "⏹";
    case "created":
      return "🏷";
    default:
      return "😱";
  }
};
