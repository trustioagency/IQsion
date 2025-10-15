import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
// import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  // ensure Vite root is the repository root so imports like /src/main.tsx resolve
  const repoRoot = path.resolve(import.meta.dirname, '..', '..');

  // Do NOT load the project's TS config file directly here (that triggers ESM/require errors).
  // Instead provide the important runtime resolve aliases inline so the middleware can
  // resolve imports like '@/components/..' without bundling the config file.
  const vite = await createViteServer({
    root: repoRoot,
    configFile: false,
    resolve: {
      alias: {
        react: path.resolve(repoRoot, 'node_modules/react'),
        'react-dom': path.resolve(repoRoot, 'node_modules/react-dom'),
        '@': path.resolve(repoRoot, 'src'),
        '@/components': path.resolve(repoRoot, 'src/components'),
        '@/lib': path.resolve(repoRoot, 'src/lib'),
      },
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("/", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // try multiple likely locations for the client index.html
      const candidates = [
        path.resolve(import.meta.dirname, "..", "client", "index.html"),
        path.resolve(import.meta.dirname, "..", "..", "index.html"),
        path.resolve(import.meta.dirname, "..", "..", "client", "index.html"),
      ];

      let clientTemplate: string | undefined;
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          clientTemplate = c;
          break;
        }
      }

      if (!clientTemplate) {
        throw new Error(
          `Could not find client index.html. Looked for: ${candidates.join(", ")}`,
        );
      }

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
