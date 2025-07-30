import { LocalStorage } from "@raycast/api";
import { Script } from "../types";

const SCRIPTS_KEY = "scripts";

export async function getScripts(): Promise<Script[]> {
  const scripts = await LocalStorage.getItem<string>(SCRIPTS_KEY);
  return scripts ? JSON.parse(scripts) : [];
}

export async function saveScripts(scripts: Script[]): Promise<void> {
  await LocalStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
}

export async function addScript(script: Script): Promise<void> {
  const scripts = await getScripts();
  scripts.push(script);
  await saveScripts(scripts);
}

export async function updateScript(updatedScript: Script): Promise<void> {
  const scripts = await getScripts();
  const scriptIndex = scripts.findIndex((s) => s.id === updatedScript.id);
  if (scriptIndex > -1) {
    scripts[scriptIndex] = updatedScript;
    await saveScripts(scripts);
  }
}
