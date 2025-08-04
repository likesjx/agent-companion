import { Form, ActionPanel, Action, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import * as React from "react";
import { Project } from "../types";
import { getSuperClaudeInfo } from "../lib/superclaude";

interface ProjectSettingsFormProps {
  project: Project;
  onSubmit: (values: { superclaude_commands: string[] }) => Promise<void>;
}

export default function ProjectSettingsForm({ project, onSubmit }: ProjectSettingsFormProps) {
  const { pop } = useNavigation();
  const { data: superClaudeInfo, isLoading } = usePromise(getSuperClaudeInfo);

  async function handleSubmit(values: { superclaude_commands: string[] }) {
    await onSubmit(values);
    pop();
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Project Settings" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Title>Manage {project.name}</Form.Title>
      <Form.Description>
        Enable and configure SuperClaude commands for this project.
      </Form.Description>
      <Form.TagPicker
        id="superclaude_commands"
        title="SuperClaude Commands"
        defaultValue={project.superclaude_commands || []}
      >
        {superClaudeInfo?.commands_exposed.map((command) => (
          <Form.TagPicker.Item key={command} value={command} title={command} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
