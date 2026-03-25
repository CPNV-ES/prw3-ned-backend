const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "PRW3 - Demo Deck API",
    version: "1.0.0",
    description: "API documentation for the Demo Deck backend.",
  },
  tags: [
    { name: "Health" },
    { name: "Projects" },
    { name: "Users" },
    { name: "Sessions" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      HealthStatus: {
        type: "object",
        properties: {
          status: {
            type: "string",
            example: "ok",
          },
          uptime: {
            type: "number",
            example: 123.45,
          },
        },
        required: ["status", "uptime"],
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "Demo Deck" },
          summary: {
            type: "string",
            example: "A showcase platform for student projects.",
          },
          demo_url: {
            type: "string",
            format: "uri",
            example: "https://demo.example.com",
          },
          repository_url: {
            type: "string",
            format: "uri",
            example: "https://github.com/example/demo-deck",
          },
          image_url: {
            type: "string",
            format: "uri",
            example: "http://localhost:3000/storages/projects/demo.webp",
          },
          likes: { type: "integer", example: 3 },
          created_at: {
            type: "string",
            format: "date-time",
            example: "2026-03-18T11:09:25.000Z",
          },
          author_id: { type: "integer", example: 2 },
        },
        required: [
          "id",
          "title",
          "summary",
          "demo_url",
          "repository_url",
          "image_url",
          "likes",
          "created_at",
          "author_id",
        ],
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Jane Doe" },
          username: { type: "string", example: "jane" },
        },
        required: ["id", "name", "username"],
      },
      SessionUser: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Jane Doe" },
          username: { type: "string", example: "jane" },
        },
        required: ["id", "name", "username"],
      },
      Session: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
          },
          expiresAt: {
            type: "string",
            format: "date-time",
            example: "2026-03-25T10:00:00.000Z",
          },
          user: {
            $ref: "#/components/schemas/SessionUser",
          },
        },
        required: ["token", "expiresAt", "user"],
      },
      CurrentSession: {
        type: "object",
        properties: {
          expiresAt: {
            type: "string",
            format: "date-time",
            example: "2026-03-25T10:00:00.000Z",
          },
          user: {
            $ref: "#/components/schemas/SessionUser",
          },
        },
        required: ["expiresAt", "user"],
      },
      CreateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Jane Doe" },
          username: { type: "string", example: "jane" },
          password: {
            type: "string",
            format: "password",
            example: "super-secret-password",
          },
        },
        required: ["name", "username", "password"],
      },
      CreateSessionRequest: {
        type: "object",
        properties: {
          username: { type: "string", example: "jane" },
          password: {
            type: "string",
            format: "password",
            example: "super-secret-password",
          },
        },
        required: ["username", "password"],
      },
      ProjectMultipartRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "Demo Deck" },
          summary: {
            type: "string",
            example: "A showcase platform for student projects.",
          },
          demo_url: {
            type: "string",
            format: "uri",
            example: "https://demo.example.com",
          },
          repository_url: {
            type: "string",
            format: "uri",
            example: "https://github.com/example/demo-deck",
          },
          image: {
            type: "string",
            format: "binary",
            description:
              "Optional project image. Accepted types: jpg, png, webp.",
          },
        },
      },
      ErrorMessage: {
        type: "object",
        properties: {
          message: { type: "string", example: "Invalid username or password" },
        },
        required: ["message"],
      },
      ErrorError: {
        type: "object",
        properties: {
          error: { type: "string", example: "Missing required fields" },
        },
        required: ["error"],
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health status",
        responses: {
          "200": {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthStatus",
                },
              },
            },
          },
        },
      },
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        summary: "List projects",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "name",
            in: "query",
            schema: { type: "string" },
            description: "Filter projects by title substring.",
          },
          {
            name: "tags",
            in: "query",
            schema: { type: "string" },
            description: "Comma-separated tag names.",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["date", "likes"],
            },
            description: "Sort field.",
          },
          {
            name: "order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
            },
            description: "Sort direction. Defaults to desc when sortBy is set.",
          },
        ],
        responses: {
          "200": {
            description: "List of projects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Project",
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Create a new project",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                allOf: [
                  {
                    $ref: "#/components/schemas/ProjectMultipartRequest",
                  },
                  {
                    type: "object",
                    required: [
                      "title",
                      "summary",
                      "demo_url",
                      "repository_url",
                    ],
                  },
                ],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Project",
                },
              },
            },
          },
          "400": {
            description: "Missing required fields or invalid upload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a project by ID",
        security: [{ bearerAuth: [] }],
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
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Project",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "404": {
            description: "Project not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Projects"],
        summary: "Update a project",
        security: [{ bearerAuth: [] }],
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
            "multipart/form-data": {
              schema: {
                $ref: "#/components/schemas/ProjectMultipartRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Project updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Project",
                },
              },
            },
          },
          "400": {
            description: "Invalid upload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "403": {
            description: "Authenticated user does not own the project",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "404": {
            description: "Project not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        security: [{ bearerAuth: [] }],
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
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "403": {
            description: "Authenticated user does not own the project",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "404": {
            description: "Project not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
        },
      },
    },
    "/api/projects/{id}/like": {
      post: {
        tags: ["Projects"],
        summary: "Like a project",
        security: [{ bearerAuth: [] }],
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
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Project",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "404": {
            description: "Project not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorError",
                },
              },
            },
          },
        },
      },
    },
    "/api/projects/{id}/comments": {
      get: {
        tags: ["Projects"],
        summary: "Get all comments of a project",
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
            description: "List of comments of this project",
          },
        },
      },
      post: {
        tags: ["Projects"],
        summary: "Post a comment on a project",
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
                  content: { type: "string" },
                },
                required: ["content"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Project commented successfully",
          },
          "404": {
            description: "Project not found",
          },
        },
      },
    },
    "/api/users": {
      post: {
        tags: ["Users"],
        summary: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUserRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "400": {
            description: "Name, username, and password are required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "409": {
            description: "Username already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              minimum: 1,
              default: 10,
            },
          },
        ],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid pagination parameters",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get a user by ID",
        security: [{ bearerAuth: [] }],
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
            description: "User details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "400": {
            description: "Invalid user ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User not found" },
                  },
                  required: ["message"],
                },
              },
            },
          },
        },
      },
    },
    "/api/sessions": {
      get: {
        tags: ["Sessions"],
        summary: "Get the current session",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current session details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CurrentSession",
                },
              },
            },
          },
          "401": {
            description: "Missing, invalid, expired, or revoked token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Sessions"],
        summary: "Create a session",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateSessionRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Session created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Session",
                },
              },
            },
          },
          "400": {
            description: "Username and password are required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
          "401": {
            description: "Invalid username or password",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Sessions"],
        summary: "Delete the current session",
        security: [{ bearerAuth: [] }],
        responses: {
          "204": {
            description: "Session deleted successfully",
          },
          "401": {
            description:
              "Missing or invalid authorization header, or invalid token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorMessage",
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export default openApiSpec;
