"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const config_1 = require("./config");
async function start() {
    const config = (0, config_1.loadConfig)();
    const app = (0, app_1.buildApp)(config);
    try {
        await app.listen({
            host: "0.0.0.0",
            port: config.port
        });
        const shutdown = async () => {
            app.log.info("shutting down");
            await app.close();
            process.exit(0);
        };
        process.once("SIGINT", shutdown);
        process.once("SIGTERM", shutdown);
    }
    catch (error) {
        app.log.error({ err: error }, "failed to start server");
        process.exit(1);
    }
}
void start();
