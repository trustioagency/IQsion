import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import router from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load env from local file (Maint/server/env)
try {
  const __dirnameLocal = path.dirname(new URL(import.meta.url).pathname);
  const candidates = [
    path.resolve(__dirnameLocal, "env"),
    path.resolve(process.cwd(), "server", "env"),
    path.resolve(process.cwd(), "Maint", "server", "env"),
  ];
  for (const p of candidates) {
    const result = dotenv.config({ path: p });
    if (!result.error) break;
  }
} catch (e) {
  // ignore if not found
}

const app = express();
// Allow dev frontend origins with credentials
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (like curl/postman) with no Origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});



app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  // throw err; // Kaldırıldı: Sunucu hata sonrası kapanmasın
});

import http from "http";
const httpServer = http.createServer(app);

// Router'ı Vite middleware'inden ÖNCE ekle ki /api istekleri catch-all tarafından yakalanmasın
app.use(router);

// In local development we run frontend on a separate Vite dev server (5173).
// Enable embedded Vite only when explicitly requested via EMBED_VITE=1.
const EMBED_VITE = process.env.EMBED_VITE === '1';
if (EMBED_VITE) {
  log('Embedding Vite dev middleware inside Express (EMBED_VITE=1)');
  setupVite(app, httpServer);
} else if (app.get("env") !== "development") {
  // Only serve static in production builds
  serveStatic(app);
} else {
  log('Vite middleware is disabled in development. Run frontend with: npm run dev');
}

const PORT = Number(process.env.PORT) || 5001;
httpServer.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});
