import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocket } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const allowedOrigin = process.env.NEXT_PUBLIC_URL || "*";

  const io = new SocketIOServer(server, {
    cors: {
      origin: dev ? "*" : allowedOrigin,
      methods: ["GET", "POST"],
    },
  });

  setupSocket(io);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  function gracefulShutdown(signal: string) {
    console.log(`\n> Received ${signal}, shutting down gracefully...`);
    io.close(() => {
      server.close(() => {
        process.exit(0);
      });
    });
    setTimeout(() => process.exit(1), 10000);
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
});
