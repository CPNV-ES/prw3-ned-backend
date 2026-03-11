import { prisma } from "../utils/prisma";

export interface Project {
    id: number;
    title: string;
    summary: string;
    demo_url: string;
    repository_url: string;
    image_url: string;
    author_id: number;
}

async function getAll(): Promise<Project[]> {
    return prisma.projects.findMany();
}

async function getById(projectId: number): Promise<Project | null> {
    return prisma.projects.findUnique({
        where: { id: projectId }
    });
}

async function create(project: Omit<Project, "id">): Promise<Project> {
    return prisma.projects.create({
        data: project
    });
}

async function update(projectId: number, project: Omit<Project, "id">): Promise<Project> {
    return prisma.projects.update({
        where: { id: projectId },
        data: project
    });
}

async function destroy(projectId: number): Promise<void> {
    await prisma.projects.delete({
        where: { id: projectId }
    });
}

export const projectsService = {
    getAll,
    getById,
    create,
    update,
    destroy
};