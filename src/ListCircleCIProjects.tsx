import { ActionPanel, Icon, List, OpenInBrowserAction, PushAction, SubmitFormAction } from "@raycast/api";
import { ListCircleCIEnvVariables } from "./ListCircleCIEnvVariables";
import { ListCircleCIProjectPipelines } from "./ListCircleCIProjectPipelines";
import { uriToLongerSlug } from "./utils";

export interface ListCircleCIProjectsParams {
  isLoading: boolean;
  uris: string[];
  onReload: () => void;
}

export const ListCircleCIProjects = ({ isLoading, uris, onReload }: ListCircleCIProjectsParams) =>
  <List isLoading={isLoading}>
    {uris.map(mapURI(onReload))}
  </List>;


interface CircleCIItemParams {
  uri: string;
  name: string;
  onReload: () => void;
}

const CircleCIItem = ({ uri, name, onReload }: CircleCIItemParams) =>
  <List.Item
    title={name}
    icon={{ source: { light: "icon.png", dark: "icon@dark.jpg" } }}
    actions={<CircleCIItemActions uri={uri} name={name} onReload={onReload} />}
  />;


const CircleCIItemActions = ({ uri, name, onReload }: CircleCIItemParams) =>
  <ActionPanel>
    <OpenInBrowserAction url={`https://app.circleci.com/pipelines/github/${name}`} />
    <SubmitFormAction onSubmit={onReload} title="Refresh projects list" icon={Icon.ArrowClockwise} />
    <PushAction
      title={"List environment variables"}
      icon={Icon.Dot}
      shortcut={{ key: "e", modifiers: ["cmd", "shift"] }}
      target={<ListCircleCIEnvVariables uri={uri} full_name={name} />}
    />
    <PushAction
      title={"List pipelines"}
      icon={Icon.Binoculars}
      shortcut={{ key: "p", modifiers: ["cmd", "shift"] }}
      target={<ListCircleCIProjectPipelines full_name={name} uri={uri} />}
    />
    <OpenInBrowserAction
      title="Project Settings"
      icon={Icon.Gear}
      url={"https://app.circleci.com/settings/project/" + uriToLongerSlug(uri)}
      shortcut={{key: "s", modifiers: ["cmd", "shift"]}}
    />
  </ActionPanel>;


const mapURI = (onReload: () => void) =>
  (uri: string) => {
    const name = uri.replace(/^https?:\/\/[^/]+\//, "");

    return <CircleCIItem key={name} uri={uri} name={name} onReload={onReload} />;
  };
