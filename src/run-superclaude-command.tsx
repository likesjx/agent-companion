import { closeMainWindow, exec } from "@raycast/api";

interface CommandProps {
  command: string;
}

export default async function Command(props: { launchContext: CommandProps }) {
  const { command } = props.launchContext;
  await exec(`superclaude ${command}`);
  await closeMainWindow();
}
