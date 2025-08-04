import { run_shell_command } from "@raycast/api";
import { SuperClaude } from "../types";
import { getSettings } from "./settings";

export async function getSuperClaudeInfo(): Promise<SuperClaude> {
  const { superclaude_path } = await getSettings();

  const superclaude: SuperClaude = {
    cli_path: superclaude_path,
    detected: false,
    commands_exposed: [],
    project_actions: [],
  };

  if (!superclaude_path) {
    return superclaude;
  }

  try {
    // First, check if the path is valid and executable
    await run_shell_command(`test -x "${superclaude_path}"`);
    superclaude.detected = true;
  } catch (error) {
    console.error(`SuperClaude path not executable: ${superclaude_path}`);
    return superclaude;
  }

  try {
    // Get the list of commands from the help output
    const { stdout: helpOutput } = await run_shell_command(`"${superclaude_path}" --help`);

    // A simple parser to extract commands. This might need adjustment based on the actual --help output format.
    const commandRegex = /^\s*([a-z]+)\s+\w/gm;
    let match;
    const commands = [];
    while ((match = commandRegex.exec(helpOutput)) !== null) {
      commands.push(match[1]);
    }
    superclaude.commands_exposed = commands;
  } catch (error) {
    console.error("Failed to get SuperClaude commands:", error);
  }

  return superclaude;
}