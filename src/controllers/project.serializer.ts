import type { Comment, Project } from "../services/projects.service";

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

export function serializeComment(comment: Comment) {
  return comment;
}
