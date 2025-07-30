export interface Project {
  name: string;
  path: string;
  is_git: boolean;
  last_active: string;
  recent_sessions: string[];
  hooks: string[];
  pinned: boolean;
}

export interface Script {
  id: string;
  name: string;
  path: string;
  language: "python" | "bash" | "node" | "other";
  description: string;
  tags: string[];
  associated_projects: string[];
  last_edited: string;
  pinned: boolean;
}

export interface Session {
  id: string;
  directory: string;
  repo: string;
  provider: "Gemini" | "Claude" | "SuperClaude" | "OpenRouter";
  history: string[];
  memory: Record<string, unknown>;
  active: boolean;
}

export interface SuperClaude {
  cli_path: string;
  detected: boolean;
  commands_exposed: string[];
  project_actions: string[];
}

export interface Settings {
  superclaude_path: string;
  default_editor: string;
  recent_projects: string[];
  pinned_projects: string[];
  scripts: Script[];
  providers: {
    name: string;
    api: string;
  }[];
  tos_acknowledged: string[];
  last_clean: string;
}
