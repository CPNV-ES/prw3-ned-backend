import type { Project } from "../services/projects.service";

export function serializeProject(project: Project) {
  const { author_id: authorId, author_name: authorName, ...rest } = project;

  return {
    ...rest,
    author: {
      id: authorId,
      name: authorName,
    },
  };
}
