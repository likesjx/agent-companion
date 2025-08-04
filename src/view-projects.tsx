import {
  Action,
  ActionPanel,
  List,
  showToast,
  Toast,
  closeMainWindow,
  Form,
  useNavigation,
  Icon,
  environment,
} from "@raycast/api";
import { exec } from "child_process";
import { usePromise } from "@raycast/utils";
import * as fs from "fs";
import * as path from "path";
import { Project, Session } from "../types";
import { getProjects, addProject, updateProject, removeProject, handleUpdateProject } from "./lib/projects";
import { ProjectSettings } from "./components/ProjectSettings";
import { addSession } from "./lib/sessions";
import { homedir } from "os";



async function addProjectFromPath(
  pathValue: string,
  agent: string,
  editor: string,
  revalidate: () => void,
  pop: () => void,
) {
  try {
    const stats = fs.statSync(pathValue);

    if (!stats.isDirectory()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Not a folder",
        message: "Please provide a path to a folder, not a file.",
      });
      return;
    }

    const projects = await getProjects();
    if (projects.some((p) => p.path === pathValue)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Project already exists",
      });
      return;
    }

    const isGit = fs.existsSync(path.join(pathValue, ".git"));

    const newProject: Project = {
      name: path.basename(pathValue),
      path: pathValue,
      is_git: isGit,
      last_active: new Date().toISOString(),
      recent_sessions: [],
      hooks: [],
      pinned: false,
      agent: agent as Project["agent"],
      editor: editor as Project["editor"],
    };

    await addProject(newProject);
    await showToast({
      style: Toast.Style.Success,
      title: "Project Added",
      message: `Added "${newProject.name}" to your projects.`,
    });
    revalidate();
    pop(); // Close the form
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to add project",
      message: error instanceof Error ? error.message : "The specified path does not exist.",
    });
  }
}

async function handleRemoveProject(project: Project, revalidate: () => void) {
  await removeProject(project.path);
  await showToast({
    style: Toast.Style.Success,
    title: "Project Removed",
    message: `Removed "${project.name}" from your projects.`,
  });
  revalidate();
}

async function togglePin(project: Project, revalidate: () => void) {
  const updatedProject = { ...project, pinned: !project.pinned };
  await updateProject(updatedProject);
  await showToast({
    style: Toast.Style.Success,
    title: project.pinned ? "Project Unpinned" : "Project Pinned",
  });
  revalidate();
}





async function startNewSession(project: Project, revalidate: () => void) {
  const newSession: Session = {
    id: `session-${Date.now()}`,
    projectId: project.path,
    startTime: new Date().toISOString(),
    active: true,
    agent: project.agent || "None",
  };

  await addSession(newSession);

  const updatedProject = {
    ...project,
    last_active: new Date().toISOString(),
    recent_sessions: [...project.recent_sessions, newSession.id],
  };

  await updateProject(updatedProject);
  revalidate();

  const scriptPath = path.join(environment.assetsPath, "start-session.sh");
  const agent = project.agent || "";
  const editor = project.editor || "";

  exec(`sh "${scriptPath}" "${project.path}" "${agent}" "${editor}"`, (error, stdout, stderr) => {
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
    if (error) {
      console.error("exec error:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Start Session",
        message: `Error: ${error.message}\nStderr: ${stderr}\nStdout: ${stdout}`,
      });
      return;
    }
    if (stderr) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to Start Session",
        message: `Stderr: ${stderr}\nStdout: ${stdout}`,
      });
      return;
    }
    closeMainWindow();
  });
}

function AddProjectForm({ revalidate }: { revalidate: () => void }) {
  const { pop } = useNavigation();

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Add Project"
            onSubmit={(values) => addProjectFromPath(values.path, values.agent, values.editor, revalidate, pop)}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="path"
        title="Project Path"
        placeholder="e.g., /Users/jared/code/my-project"
        defaultValue={`${homedir()}/`}
      />
      <Form.Dropdown id="agent" title="Code Agent">
        <Form.Dropdown.Item value="" title="None" />
        <Form.Dropdown.Item value="Gemini" title="Gemini" />
        <Form.Dropdown.Item value="Claude" title="Claude" />
        <Form.Dropdown.Item value="OpenRouter" title="OpenRouter" />
        <Form.Dropdown.Item value="Claude Code Router" title="Claude Code Router" />
      </Form.Dropdown>
      <Form.Dropdown id="editor" title="Editor">
        <Form.Dropdown.Item value="Ghostty" title="Ghostty (Terminal Only)" />
        <Form.Dropdown.Item value="VSCode" title="Visual Studio Code" />
        <Form.Dropdown.Item value="Cursor" title="Cursor" />
      </Form.Dropdown>
    </Form>
  );
}

export default function Command() {
  const { data: projects, isLoading, revalidate } = usePromise(getProjects);
  const { pop } = useNavigation();

  const pinnedProjects = projects?.filter((p) => p.pinned) || [];
  const unpinnedProjects = projects?.filter((p) => !p.pinned) || [];

  async function handleManageProjectSubmit(project: Project, values: { superclaude_commands: string[] }) {
    const updatedProject = { ...project, ...values };
    await handleUpdateProject(project.path, updatedProject);
    revalidate();
  }

  return (
    <List
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.Push title="Add New Project" icon={Icon.Plus} target={<AddProjectForm revalidate={revalidate} />} />
        </ActionPanel>
      }
    >
      <List.EmptyView
        title="No Projects Found"
        description="Add a project to get started."
        actions={
          <ActionPanel>
            <Action.Push title="Add New Project" icon={Icon.Plus} target={<AddProjectForm revalidate={revalidate} />} />
          </ActionPanel>
        }
      />
      <List.Section title="Pinned Projects">
        {pinnedProjects.map((project) => (
          <List.Item
            key={project.path}
            title={project.name}
            subtitle={project.path}
            actions={
              <ActionPanel>
                <Action title="Start New Session" onAction={() => startNewSession(project, revalidate)} />
                <Action.Push
                  title="Manage Project"
                  icon={Icon.Pencil}
                  target={<ProjectSettings project={project} onSubmit={(values) => handleManageProjectSubmit(project, values)} />}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                />
                <Action
                  title={project.pinned ? "Unpin Project" : "Pin Project"}
                  onAction={() => togglePin(project, revalidate)}
                />
                <Action.Push
                  title="Add New Project"
                  icon={Icon.Plus}
                  target={<AddProjectForm revalidate={revalidate} />}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                />
                <Action
                  title="Remove Project"
                  style={Action.Style.Destructive}
                  onAction={() => handleRemoveProject(project, revalidate)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "x" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      <List.Section title="All Projects">
        {unpinnedProjects.map((project) => (
          <List.Item
            key={project.path}
            title={project.name}
            subtitle={project.path}
            actions={
              <ActionPanel>
                <Action title="Start New Session" onAction={() => startNewSession(project, revalidate)} />
                <Action.Push
                  title="Manage Project"
                  icon={Icon.Pencil}
                  target={<ProjectSettings project={project} onSubmit={(values) => handleManageProjectSubmit(project, values)} />}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                />
                <Action
                  title={project.pinned ? "Unpin Project" : "Pin Project"}
                  onAction={() => togglePin(project, revalidate)}
                />
                <Action.Push
                  title="Add New Project"
                  icon={Icon.Plus}
                  target={<AddProjectForm revalidate={revalidate} />}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                />
                <Action
                  title="Remove Project"
                  style={Action.Style.Destructive}
                  onAction={() => handleRemoveProject(project, revalidate)}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "x" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
