import { LocalStorage } from "@raycast/api";
import { Settings } from "../types";

const SETTINGS_KEY = "settings";

export async function getSettings(): Promise<Settings> {
  const settings = await LocalStorage.getItem<string>(SETTINGS_KEY);
  return settings
    ? JSON.parse(settings)
    : {
        superclaude_path: "/usr/local/bin/superclaude",
        default_editor: "code",
        recent_projects: [],
        pinned_projects: [],
        scripts: [],
        providers: [],
        tos_acknowledged: [],
        last_clean: "",
      };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await LocalStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
