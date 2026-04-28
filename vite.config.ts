import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    {
      name: "debug-ingest-forwarder",
      configureServer(server) {
        server.middlewares.use("/__debug_ingest", (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }

          const chunks: Buffer[] = [];
          req.on("data", (c) => chunks.push(c));
          req.on("end", async () => {
            const result: { ok: boolean; parseOk: boolean; appendOk: boolean; forwardOk: boolean; error?: string } = {
              ok: true,
              parseOk: false,
              appendOk: false,
              forwardOk: false,
            };
            let raw = "";
            try {
              raw = Buffer.concat(chunks).toString("utf8");
              // Persist to local workspace log file (NDJSON).
              try {
                const parsed = JSON.parse(raw);
                result.parseOk = true;
                fs.appendFileSync(path.resolve(process.cwd(), "debug-3fc829.log"), JSON.stringify(parsed) + "\n", "utf8");
                result.appendOk = true;
              } catch (e) {
                // Fall back to writing raw line as-is (still NDJSON-ish).
                try {
                  fs.appendFileSync(path.resolve(process.cwd(), "debug-3fc829.log"), String(raw).trim() + "\n", "utf8");
                  result.appendOk = true;
                } catch (e2) {
                  result.error = `append_failed:${(e2 as any)?.message || "unknown"}`;
                }
                if (!result.error) result.error = `parse_failed:${(e as any)?.message || "unknown"}`;
              }
              // Forward to the local debug log collector on the dev host.
              await fetch("http://127.0.0.1:7908/ingest/551beb29-a1a5-4555-a00f-0e435b967cb6", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3fc829" },
                body: raw,
              })
                .then(() => {
                  result.forwardOk = true;
                })
                .catch((e) => {
                  result.error = `forward_failed:${(e as any)?.message || "unknown"}`;
                });
            } catch (e) {
              result.ok = false;
              result.error = `handler_failed:${(e as any)?.message || "unknown"}`;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
          });
        });
      },
    },
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
