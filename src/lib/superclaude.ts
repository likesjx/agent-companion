import { run_shell_command } from "@raycast/api";
import { SuperClaude } from "../types";

export async function getSuperClaudeInfo(): Promise<SuperClaude> {
  const superclaude: SuperClaude = {
    cli_path: "",
    detected: false,
    commands_exposed: [],
    project_actions: [],
  };

  try {
    // Check if superclaude is installed and get its path
    const { stdout: cliPath } = await run_shell_command("which superclaude");
    superclaude.cli_path = cliPath.trim();
    superclaude.detected = true;
  } catch {
    // superclaude is not found in PATH
    return superclaude;
  }

  try {
    // Get the list of commands from the help output
    const { stdout: helpOutput } = await run_shell_command(`${superclaude.cli_path} --help`);

    // A simple parser to extract commands. This might need adjustment based on the actual --help output format.
    const commandRegex = /^\s*([a-z]+)\s+\w/gm;
    let match;
    const commands = [];
    while ((match = commandRegex.exec(helpOutput)) !== null) {
      commands.push(match[1]);
    }
    superclaude.commands_exposed = commands;
  } catch (error) {
    // Failed to get commands, but it was detected. Leave commands_exposed empty.
    console.error("Failed to get SuperClaude commands:", error);
  }

  return superclaude;
}
