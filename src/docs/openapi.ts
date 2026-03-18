const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "PRW3 - Demo Deck API",
        version: "1.0.0",
    },
    tags: [
        {
            name: "Health",
        },
        {
            name: "Projects",
        },
    ],
    paths: {
        "/api/health": {
            get: {
                tags: ["Health"],
                summary: "Check API health status",
                responses: {
                    "200": {
                        description: "API is healthy",
                    },
                },
            },
        },
        "/api/projects": {
            get: {
                tags: ["Projects"],
                summary: "Get all projects",
                responses: {
                    "200": {
                        description: "List of projects",
                    },
                },
            },
            post: {
                tags: ["Projects"],
                summary: "Create a new project",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    summary: { type: "string" },
                                    demo_url: { type: "string" },
                                    repository_url: { type: "string" },
                                    image_url: { type: "string" },
                                    author_id: { type: "integer" },
                                    tags: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                        },
                                    },
                                },
                                required: [
                                    "title",
                                    "summary",
                                    "demo_url",
                                    "repository_url",
                                    "image_url",
                                    "author_id",
                                    "tags",
                                ],
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Project created successfully",
                    },
                    "400": {
                        description: "Missing required fields",
                    },
                },
            },
        },
        "/api/projects/{id}": {
            get: {
                tags: ["Projects"],
                summary: "Get a project by ID",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                        type: "integer",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Project details",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
            },
            put: {
                tags: ["Projects"],
                summary: "Update a project",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                        type: "integer",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    summary: { type: "string" },
                                    demo_url: { type: "string" },
                                    repository_url: { type: "string" },
                                    image_url: { type: "string" },
                                    author_id: { type: "integer" },
                                    tags: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                        },
                                    },
                                },
                                required: [
                                    "title",
                                    "summary",
                                    "demo_url",
                                    "repository_url",
                                    "image_url",
                                    "author_id",
                                    "tags",
                                ],
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Project updated successfully",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
            },
            delete: {
                tags: ["Projects"],
                summary: "Delete a project",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                        type: "integer",
                        },
                    },
                ],
                responses: {
                    "204": {
                        description: "Project deleted successfully",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
        },
        },
        "/api/projects/{id}/like": {
            post: {
                tags: ["Projects"],
                summary: "Like a project",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                        type: "integer",
                        },
                    },
                ],
                responses: {
                    "200": {
                        description: "Project liked successfully",
                    },
                    "404": {
                        description: "Project not found",
                    },
                },
            },
        },
    },
};

export default openApiSpec;
