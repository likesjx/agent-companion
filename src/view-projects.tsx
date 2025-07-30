import { Action, ActionPanel, List, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Project } from "../types";
import { getProjects, addProject, updateProject } from "./lib/projects";

async function createNewProject(revalidate: () => void) {
  const newProject: Project = {
    name: `New Project ${Date.now()}`,
    path: `/Users/jaredlikes/code/agent-companion/agent-companion/new-project-${Date.now()}`,
    is_git: false,
    last_active: new Date().toISOString(),
    recent_sessions: [],
    hooks: [],
    pinned: false,
  };
  await addProject(newProject);
  await showToast({
    style: Toast.Style.Success,
    title: "Project Created",
    message: `Added "${newProject.name}" to your projects.`,
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

export default function Command() {
  const { data: projects, isLoading, revalidate } = usePromise(getProjects);

  const pinnedProjects = projects?.filter((p) => p.pinned) || [];
  const unpinnedProjects = projects?.filter((p) => !p.pinned) || [];

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        title="No Projects Found"
        description="Create a new project to get started."
        actions={
          <ActionPanel>
            <Action title="Create New Project" onAction={() => createNewProject(revalidate)} />
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
                <Action.Push
                  title="Open in Terminal"
                  target={{ name: "open-in-terminal", launchContext: { path: project.path } }}
                />
                <Action title="Unpin Project" onAction={() => togglePin(project, revalidate)} />
                <Action title="Create New Project" onAction={() => createNewProject(revalidate)} />
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
                <Action.Push
                  title="Open in Terminal"
                  target={{ name: "open-in-terminal", launchContext: { path: project.path } }}
                />
                <Action title="Pin Project" onAction={() => togglePin(project, revalidate)} />
                <Action title="Create New Project" onAction={() => createNewProject(revalidate)} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
