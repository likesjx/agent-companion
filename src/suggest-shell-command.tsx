import { ActionPanel, Action, Form, Detail, showToast, Toast } from "@raycast/api";
import { useState } from "react";

// Placeholder for AI suggestion
async function getCommandSuggestion(intent: string): Promise<string> {
  // In a real implementation, this would call an AI service (e.g., OpenAI, Gemini)
  // For now, we'll return a simple, predictable command based on the intent.
  if (intent.includes("list")) {
    return "ls -la";
  } else if (intent.includes("git")) {
    return "git status";
  } else {
    return `echo "I'm not sure how to help with that. Try 'list files' or 'git status'."`;
  }
}

export default function Command() {
  const [intent, setIntent] = useState<string>("");
  const [suggestedCommand, setSuggestedCommand] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function handleSubmit() {
    if (!intent) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter your intent",
      });
      return;
    }
    setIsLoading(true);
    const command = await getCommandSuggestion(intent);
    setSuggestedCommand(command);
    setIsLoading(false);
  }

  if (suggestedCommand) {
    return (
      <Detail
        markdown={`
${suggestedCommand}
`}
        actions={
          <ActionPanel>
            <Action.CopyToClipboard content={suggestedCommand} />
            <Action title="Clear Suggestion" onAction={() => setSuggestedCommand("")} />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Get Suggestion" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="intent"
        title="What do you want to do?"
        placeholder="e.g., list all files, check git status..."
        onChange={setIntent}
      />
    </Form>
  );
}
