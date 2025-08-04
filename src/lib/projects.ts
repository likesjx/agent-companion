import { LocalStorage, showToast, Toast } from "@raycast/api";
import { Project } from "../types";

const PROJECTS_KEY = "projects";

export async function getProjects(): Promise<Project[]> {
  const projects = await LocalStorage.getItem<string>(PROJECTS_KEY);
  return projects ? JSON.parse(projects) : [];
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await LocalStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export async function addProject(project: Project): Promise<void> {
  const projects = await getProjects();
  projects.push(project);
  await saveProjects(projects);
}

export async function updateProject(updatedProject: Project): Promise<void> {
  const projects = await getProjects();
  const projectIndex = projects.findIndex((p) => p.path === updatedProject.path);
  if (projectIndex > -1) {
    projects[projectIndex] = updatedProject;
    await saveProjects(projects);
  }
}

export async function removeProject(projectPath: string): Promise<void> {
  const projects = await getProjects();
  const updatedProjects = projects.filter((p) => p.path !== projectPath);
  await saveProjects(updatedProjects);
}

export async function handleUpdateProject(
  originalPath: string,
  updatedProject: Partial<Project>,
) {
  const projects = await getProjects();
  const projectIndex = projects.findIndex((p) => p.path === originalPath);

  if (projectIndex === -1) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Project not found",
    });
    return;
  }

  const existingProject = projects[projectIndex];
  const newProject = { ...existingProject, ...updatedProject };

  // If the path is changed, we need to remove the old project and add a new one
  if (originalPath !== newProject.path) {
    await removeProject(originalPath);
    await addProject(newProject);
  } else {
    await updateProject(newProject as Project);
  }

  await showToast({
    style: Toast.Style.Success,
    title: "Project Updated",
    message: `Updated "${newProject.name}".`,
  });
}
