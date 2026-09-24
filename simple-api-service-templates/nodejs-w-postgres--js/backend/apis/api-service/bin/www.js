/**
 * Module dependencies.
 */

import http from "http";
import app from "../src/app.js";
import { logger } from "../src/logger.js";

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `pipe ${port}` : `port ${port}`;

  if (error.code === "EACCES") {
    logger.fatal({ err: error, port }, `${bind} requires elevated privileges`);
  } else if (error.code === "EADDRINUSE") {
    logger.fatal({ err: error, port }, `${bind} is already in use`);
  } else {
    logger.fatal({ err: error, port }, `${bind} failed to listen`);
  }
  process.exit(1);
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "5000");
app.set("port", port);

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const address = server.address();
  logger.info(
    typeof address === "string" ? { address } : { port: address?.port },
    "listening",
  );
};

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
