import { ActionPanel, Icon, List, OpenInBrowserAction, SubmitFormAction } from "@raycast/api";

export const ListCircleCIProjects = ({
                                       isLoading,
                                       uris,
                                       onReload
                                     }: { isLoading: boolean, uris: string[], onReload: () => void }) =>
  <List isLoading={isLoading}>
    {uris.map(mapURI(onReload))}
  </List>;


const CircleCIItem = ({ name, onReload }: { name: string, onReload: () => void }) =>
  <List.Item
    title={name}
    icon={{source: {light: "icon.png", dark: "icon@dark.png"}}}
    actions={
      <ActionPanel>
        <OpenInBrowserAction url={`https://app.circleci.com/pipelines/github/${name}`} />
        <SubmitFormAction onSubmit={onReload} title="Refresh projects list" icon={Icon.ArrowClockwise} />
      </ActionPanel>
    }
  />;


const mapURI = (onReload: () => void) =>
  (name: string) => {
    const short = name.replace(/^https?:\/\/[^/]+\//, "");

    return <CircleCIItem key={short} name={short} onReload={onReload} />;
  };
