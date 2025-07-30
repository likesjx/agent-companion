import { closeMainWindow, open } from "@raycast/api";

interface CommandProps {
  path: string;
}

export default async function Command(props: { launchContext: CommandProps }) {
  const { path } = props.launchContext;
  await open(path, "iTerm");
  await closeMainWindow();
}
