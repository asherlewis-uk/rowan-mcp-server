import { FastifyPluginAsync } from "fastify";
import { listArtifactTree, readArtifactFile, writeArtifactFile, getLocalArtifactsRoot } from "../lib/local";

interface ArtifactTreeQuery {
  path?: string;
  recursive?: boolean;
}

interface ArtifactFileQuery {
  path: string;
}

interface ArtifactFileBody {
  path: string;
  content: string;
}

const artifactTreeQuerySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    path: { type: "string", minLength: 1 },
    recursive: { type: "boolean", default: false }
  }
};

const artifactFileQuerySchema = {
  type: "object",
  additionalProperties: false,
  required: ["path"],
  properties: {
    path: { type: "string", minLength: 1 }
  }
};

const artifactFileBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["path", "content"],
  properties: {
    path: { type: "string", minLength: 1 },
    content: { type: "string" }
  }
};

export const artifactsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: ArtifactTreeQuery }>("/artifacts/tree", {
    schema: {
      querystring: artifactTreeQuerySchema
    }
  }, async (request) => {
    const recursive = request.query.recursive ?? false;
    const tree = await listArtifactTree(request.query.path, recursive);

    return {
      root: getLocalArtifactsRoot(),
      path: request.query.path ?? "",
      recursive,
      count: tree.length,
      tree
    };
  });

  app.get<{ Querystring: ArtifactFileQuery }>("/artifacts/file", {
    schema: {
      querystring: artifactFileQuerySchema
    }
  }, async (request) => {
    const file = await readArtifactFile(request.query.path);

    return {
      root: getLocalArtifactsRoot(),
      file
    };
  });

  app.post<{ Body: ArtifactFileBody }>("/artifacts/file", {
    schema: {
      body: artifactFileBodySchema
    }
  }, async (request) => {
    const file = await writeArtifactFile(request.body.path, request.body.content);

    return {
      root: getLocalArtifactsRoot(),
      file
    };
  });
};
