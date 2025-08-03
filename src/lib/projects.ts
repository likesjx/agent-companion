import { LocalStorage } from "@raycast/api";
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
