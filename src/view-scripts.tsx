import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Script } from "../types";
import { getScripts, addScript, updateScript } from "./lib/scripts";
async function createNewScript(revalidate: () => void) {
  const newScript: Script = {
    id: `new-script-${Date.now()}`,
    name: `New Script ${Date.now()}`,
    path: `/Users/jaredlikes/code/agent-companion/agent-companion/new-script-${Date.now()}.sh`,
    language: "bash",
    description: "A new script",
    tags: [],
    associated_projects: [],
    last_edited: new Date().toISOString(),
    pinned: false,
  };
  await addScript(newScript);
  await showToast({
    style: Toast.Style.Success,
    title: "Script Created",
    message: `Added "${newScript.name}" to your scripts.`,
  });
  revalidate();
}
async function togglePin(script: Script, revalidate: () => void) {
  const updatedScript = { ...script, pinned: !script.pinned };
  await updateScript(updatedScript);
  await showToast({ style: Toast.Style.Success, title: script.pinned ? "Script Unpinned" : "Script Pinned" });
  revalidate();
}
export default function Command() {
  const { data: scripts, isLoading, revalidate } = usePromise(getScripts);
  const pinnedScripts = scripts?.filter((s) => s.pinned) || [];
  const unpinnedScripts = scripts?.filter((s) => !s.pinned) || [];
  return (
    <List isLoading={isLoading}>
      {" "}
      <List.EmptyView
        title="No Scripts Found"
        description="Create a new script to get started."
        actions={
          <ActionPanel>
            {" "}
            <Action title="Create New Script" onAction={() => createNewScript(revalidate)} />{" "}
          </ActionPanel>
        }
      />{" "}
      <List.Section title="Pinned Scripts">
        {" "}
        {pinnedScripts.map((script) => (
          <List.Item
            key={script.id}
            title={script.name}
            subtitle={script.path}
            actions={
              <ActionPanel>
                {" "}
                <Action title="Unpin Script" onAction={() => togglePin(script, revalidate)} />{" "}
                <Action title="Create New Script" onAction={() => createNewScript(revalidate)} />{" "}
              </ActionPanel>
            }
          />
        ))}{" "}
      </List.Section>{" "}
      <List.Section title="All Scripts">
        {" "}
        {unpinnedScripts.map((script) => (
          <List.Item
            key={script.id}
            title={script.name}
            subtitle={script.path}
            actions={
              <ActionPanel>
                {" "}
                <Action title="Pin Script" onAction={() => togglePin(script, revalidate)} />{" "}
                <Action title="Create New Script" onAction={() => createNewScript(revalidate)} />{" "}
              </ActionPanel>
            }
          />
        ))}{" "}
      </List.Section>{" "}
    </List>
  );
}
