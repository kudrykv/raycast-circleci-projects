import { ActionPanel, Icon, List, OpenInBrowserAction, PushAction, SubmitFormAction } from "@raycast/api";
import { ListCircleCIEnvVariables } from "./ListCircleCIEnvVariables";
import { ListCircleCIProjectPipelines } from "./ListCircleCIProjectPipelines";

export interface ListCircleCIProjectsParams {
  isLoading: boolean;
  uris: string[];
  onReload: () => void;
  onListAllEnvs: (uri: string) => Promise<Record<string, string>[]>;
}

export const ListCircleCIProjects = ({ isLoading, uris, onReload, onListAllEnvs }: ListCircleCIProjectsParams) =>
  <List isLoading={isLoading}>
    {uris.map(mapURI(onReload, onListAllEnvs))}
  </List>;


interface CircleCIItemParams {
  uri: string;
  name: string;
  onReload: () => void;
  onListAllEnvs: (uri: string) => Promise<Record<string, string>[]>;
}

const CircleCIItem = ({ uri, name, onReload, onListAllEnvs }: CircleCIItemParams) =>
  <List.Item
    title={name}
    icon={{ source: { light: "icon.png", dark: "icon@dark.jpg" } }}
    actions={<CircleCIItemActions uri={uri} name={name} onReload={onReload} onListAllEnvs={onListAllEnvs} />}
  />;


const CircleCIItemActions = ({uri, name, onReload, onListAllEnvs}: CircleCIItemParams) =>
  <ActionPanel>
    <OpenInBrowserAction url={`https://app.circleci.com/pipelines/github/${name}`} />
    <SubmitFormAction onSubmit={onReload} title="Refresh projects list" icon={Icon.ArrowClockwise} />
    <PushAction
      title={"List environment variables"}
      icon={Icon.Dot}
      shortcut={{ key: "e", modifiers: ["cmd", "shift"] }}
      target={<ListCircleCIEnvVariables uri={uri} full_name={name} onListAllEnvs={onListAllEnvs} />}
    />
    <PushAction
      title={"List pipelines"}
      icon={Icon.Binoculars}
      shortcut={{key: "p", modifiers: ["cmd", "shift"]}}
      target={<ListCircleCIProjectPipelines full_name={name} uri={uri} />}
    />
  </ActionPanel>


const mapURI = (onReload: () => void, onListAllEnvs: (uri: string) => Promise<Record<string, string>[]>) =>
  (uri: string) => {
    const name = uri.replace(/^https?:\/\/[^/]+\//, "");

    return <CircleCIItem key={name} uri={uri} name={name} onReload={onReload} onListAllEnvs={onListAllEnvs} />;
  };
