import { LocalStorage } from "@raycast/api";
import { Session } from "../types";

const SESSIONS_KEY = "sessions";

export async function getSessions(): Promise<Session[]> {
  const sessions = await LocalStorage.getItem<string>(SESSIONS_KEY);
  return sessions ? JSON.parse(sessions) : [];
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await LocalStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function addSession(session: Session): Promise<void> {
  const sessions = await getSessions();
  sessions.push(session);
  await saveSessions(sessions);
}

export async function updateSession(updatedSession: Session): Promise<void> {
  const sessions = await getSessions();
  const sessionIndex = sessions.findIndex((s) => s.id === updatedSession.id);
  if (sessionIndex > -1) {
    sessions[sessionIndex] = updatedSession;
    await saveSessions(sessions);
  }
}
