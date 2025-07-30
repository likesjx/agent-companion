import { List, ActionPanel, Action } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getSuperClaudeInfo } from "./lib/superclaude";

export default function Command() {
  const { data: superclaude, isLoading } = usePromise(getSuperClaudeInfo);

  return (
    <List isLoading={isLoading}>
      <List.Section title="SuperClaude Status">
        <List.Item
          title={superclaude?.detected ? "SuperClaude Detected" : "SuperClaude Not Detected"}
          subtitle={superclaude?.detected ? superclaude.cli_path : "Please install SuperClaude CLI"}
        />
      </List.Section>
      {superclaude?.detected && (
        <List.Section title="Available Commands">
          {superclaude.commands_exposed.map((command) => (
            <List.Item
              key={command}
              title={command}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Run Command"
                    target={{ name: "run-superclaude-command", launchContext: { command: command } }}
                  />
                  <Action.CopyToClipboard content={command} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
