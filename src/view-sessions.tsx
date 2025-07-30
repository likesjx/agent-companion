import { Action, ActionPanel, List, showToast, Toast, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Session } from "../types";
import { getSessions, addSession, updateSession } from "./lib/sessions";
async function createNewSession(revalidate: () => void) {
  const newSession: Session = {
    id: `new-session-${Date.now()}`,
    directory: `/Users/jaredlikes/code/agent-companion/agent-companion/new-session-${Date.now()}`,
    repo: "",
    provider: "Gemini",
    history: [],
    memory: {},
    active: true,
  };
  await addSession(newSession);
  await showToast({
    style: Toast.Style.Success,
    title: "Session Created",
    message: `Added a new session to your list.`,
  });
  revalidate();
}
async function toggleSessionStatus(session: Session, revalidate: () => void) {
  const updatedSession = { ...session, active: !session.active };
  await updateSession(updatedSession);
  await showToast({ style: Toast.Style.Success, title: session.active ? "Session Stopped" : "Session Resumed" });
  revalidate();
}
export default function Command() {
  const { data: sessions, isLoading, revalidate } = usePromise(getSessions);
  return (
    <List isLoading={isLoading}>
      {" "}
      <List.EmptyView
        title="No Sessions Found"
        description="Create a new session to get started."
        actions={
          <ActionPanel>
            {" "}
            <Action title="Create New Session" onAction={() => createNewSession(revalidate)} />{" "}
          </ActionPanel>
        }
      />{" "}
      {sessions?.map((session) => (
        <List.Item
          key={session.id}
          title={session.id}
          subtitle={session.directory}
          icon={session.active ? Icon.Play : Icon.Stop}
          actions={
            <ActionPanel>
              {" "}
              {session.active ? (
                <Action title="Stop Session" onAction={() => toggleSessionStatus(session, revalidate)} />
              ) : (
                <Action title="Resume Session" onAction={() => toggleSessionStatus(session, revalidate)} />
              )}{" "}
              <Action title="Create New Session" onAction={() => createNewSession(revalidate)} />{" "}
            </ActionPanel>
          }
        />
      ))}{" "}
    </List>
  );
}
