import express, { type Request, Response, NextFunction } from "express";
// reload hint: touching this file triggers tsx watch to reload env
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cors from "cors";
import router from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load env from file(s). In production we also try .env.production so Cloud Run
// builds that include the file (or local prod simulation) still populate process.env
// even if env vars were not set via deploy flags.
try {
  const __dirnameLocal = path.dirname(new URL(import.meta.url).pathname);
  const candidates = [
    // Explicit production file variants (root + Maint/) – loaded first so later local overrides can replace if needed
    path.resolve(process.cwd(), ".env.production"),
    path.resolve(process.cwd(), "Maint", ".env.production"),
    // Existing dev/local locations
    path.resolve(__dirnameLocal, "env"),
    path.resolve(process.cwd(), "server", "env"),
    path.resolve(process.cwd(), "Maint", "server", "env"),
  ];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const result = dotenv.config({ path: p });
      if (!result.error) {
        // Keep loading remaining candidates (allow layered overrides) instead of break
      }
    } catch {}
  }
  // Helpful debug log (only non-production) if critical OAuth vars missing.
  if (process.env.NODE_ENV !== 'production') {
    const missing: string[] = [];
    for (const k of ["GOOGLE_CLIENT_ID","GOOGLE_ADS_CLIENT_ID","SHOPIFY_API_KEY"]) {
      if (!process.env[k]) missing.push(k);
    }
    if (missing.length) {
      console.warn("[ENV LOAD] Missing expected variables:", missing.join(", "));
      console.warn("[ENV LOAD] Checked paths:", candidates.filter(p => fs.existsSync(p)));
    }
  }
} catch (e) {
  // ignore if not found / permission issues
}

const app = express();
// Allow dev + configurable production origins (comma separated in CORS_ORIGINS)
const corsEnv = process.env.CORS_ORIGINS || "";
const dynamicOrigins = corsEnv
  .split(/[,\s]+/)
  .map(o => o.trim())
  .filter(o => !!o);
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...dynamicOrigins,
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

// Basit sağlık kontrolü
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// API sağlık kontrolü (Hosting rewrite ile kolay test için)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, path: '/api/health', time: new Date().toISOString() });
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
    // In Cloud Run, we serve API-only by default. Use SERVE_STATIC=1 to enable static serving.
    if (process.env.SERVE_STATIC === '1') {
      serveStatic(app);
    } else {
      log('Static file serving disabled (SERVE_STATIC!=1).');
    }
} else {
  log('Vite middleware is disabled in development. Run frontend with: npm run dev');
}

const PORT = Number(process.env.PORT) || 5001;
httpServer.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});
