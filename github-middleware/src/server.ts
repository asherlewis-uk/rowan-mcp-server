import "dotenv/config";
import { buildApp } from "./app";
import { loadConfig } from "./config";

async function start() {
  const config = loadConfig();
  const app = buildApp(config);

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
  } catch (error) {
    app.log.error({ err: error }, "failed to start server");
    process.exit(1);
  }
}

void start();
