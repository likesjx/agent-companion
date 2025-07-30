import { ActionPanel, Action, Form, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getSettings, saveSettings } from "./lib/settings";
import { Settings } from "../types";
export default function Command() {
  const { data: settings, isLoading, revalidate } = usePromise(getSettings);
  async function handleSubmit(values: Settings) {
    await saveSettings(values);
    await showToast({ style: Toast.Style.Success, title: "Settings Saved" });
    revalidate();
  }
  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          {" "}
          <Action.SubmitForm title="Save Settings" onSubmit={handleSubmit} />{" "}
        </ActionPanel>
      }
    >
      {" "}
      <Form.TextField
        id="superclaude_path"
        title="SuperClaude Path"
        placeholder="/usr/local/bin/superclaude"
        defaultValue={settings?.superclaude_path}
      />{" "}
      <Form.Separator />{" "}
      <Form.TagPicker id="tos_acknowledged" title="Acknowledged ToS" defaultValue={settings?.tos_acknowledged}>
        {" "}
        <Form.TagPicker.Item value="superclaude" title="SuperClaude" />{" "}
        <Form.TagPicker.Item value="gemini" title="Gemini" /> <Form.TagPicker.Item value="claude" title="Claude" />{" "}
      </Form.TagPicker>{" "}
    </Form>
  );
}
