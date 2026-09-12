import "dotenv/config";
import { createApp } from "./app.js";
import { logger } from "./shared/logger/logger.js";
import { prisma } from "./prisma/client.js";

const port = Number(process.env.PORT) || 4000;
const app = createApp();

const server = app.listen(port, () => {
  logger.info(
    {
      port,
      nodeEnv: process.env.NODE_ENV || "development",
    },
    `CoWorkFlow API server listening on http://localhost:${port}`
  );
});

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, `Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info("HTTP server closed.");
    try {
      await prisma.$disconnect();
      logger.info("Database connection closed cleanly.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during database disconnection.");
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if hanging
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
