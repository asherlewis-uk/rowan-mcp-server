"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artifactsRoutes = void 0;
const local_1 = require("../lib/local");
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
const artifactsRoutes = async (app) => {
    app.get("/artifacts/tree", {
        schema: {
            querystring: artifactTreeQuerySchema
        }
    }, async (request) => {
        const recursive = request.query.recursive ?? false;
        const tree = await (0, local_1.listArtifactTree)(request.query.path, recursive);
        return {
            root: (0, local_1.getLocalArtifactsRoot)(),
            path: request.query.path ?? "",
            recursive,
            count: tree.length,
            tree
        };
    });
    app.get("/artifacts/file", {
        schema: {
            querystring: artifactFileQuerySchema
        }
    }, async (request) => {
        const file = await (0, local_1.readArtifactFile)(request.query.path);
        return {
            root: (0, local_1.getLocalArtifactsRoot)(),
            file
        };
    });
    app.post("/artifacts/file", {
        schema: {
            body: artifactFileBodySchema
        }
    }, async (request) => {
        const file = await (0, local_1.writeArtifactFile)(request.body.path, request.body.content);
        return {
            root: (0, local_1.getLocalArtifactsRoot)(),
            file
        };
    });
};
exports.artifactsRoutes = artifactsRoutes;
