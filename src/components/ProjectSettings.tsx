import { Action, ActionPanel, Form } from "@raycast/api";
import * as React from "react";
import { Project } from "../types";

interface ProjectSettingsProps {
  project: Project;
  onSubmit: (values: { superclaude_commands: string[] }) => void;
}

export function ProjectSettings({ project, onSubmit }: ProjectSettingsProps) {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Settings" onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.Title>Manage {project.name}</Form.Title>
      <Form.TagPicker id="superclaude_commands" title="SuperClaude Commands" defaultValue={project.superclaude_commands}>
        <Form.TagPicker.Item value="lint" title="Lint" />
        <Form.TagPicker.Item value="test" title="Test" />
      </Form.TagPicker>
    </Form>
  );
}