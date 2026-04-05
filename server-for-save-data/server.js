/**
 * Small Express server: persist paid orders as JSON files only.
 * Payment/Stripe runs on the payment gateway; this service is save-order + list/delete only.
 */
const path = require("path");
const fs = require("fs/promises");
const http = require("http");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT) || 5002;
const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

/** Next may be opened as localhost or 127.0.0.1 — those are different origins for CORS. */
function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (origin === clientUrl) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedCorsOrigin(origin));
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    // axios sends Cache-Control on GET /orders — preflight must allow it
    allowedHeaders: ["Content-Type", "Cache-Control"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Order save API (JSON files under data/orders)",
    endpoints: ["POST /save-order", "GET /orders", "DELETE /orders/:orderId"],
  });
});

const ORDERS_DIR = path.join(__dirname, "data", "orders");

function safeOrderFilename(id) {
  if (typeof id !== "string" || !id.trim()) return `ord_${Date.now()}.json`;
  const base = id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
  return `${base}.json`;
}

/** Persist full order payload from the frontend as JSON (no DB). */
app.post("/save-order", async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "Expected a JSON object body" });
    }
    if (typeof body.id !== "string" || !body.id.trim()) {
      return res.status(400).json({ error: "Field id (string) is required" });
    }
    if (!Array.isArray(body.entries)) {
      return res.status(400).json({ error: "Field entries (array) is required" });
    }

    const payload = {
      ...body,
      serverReceivedAt: new Date().toISOString(),
    };

    await fs.mkdir(ORDERS_DIR, { recursive: true });
    const fileName = safeOrderFilename(body.id);
    const filePath = path.join(ORDERS_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
    console.log("[save-order] saved", filePath);

    return res.status(201).json({ ok: true, file: fileName });
  } catch (err) {
    console.error("save-order error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to save order" });
  }
});

/** List all orders saved as JSON under data/orders/ (newest paidAt first). */
app.get("/orders", async (req, res) => {
  try {
    await fs.mkdir(ORDERS_DIR, { recursive: true });
    const names = await fs.readdir(ORDERS_DIR);
    const jsonFiles = names.filter((n) => n.endsWith(".json"));
    const orders = [];

    for (const name of jsonFiles) {
      try {
        const raw = await fs.readFile(path.join(ORDERS_DIR, name), "utf8");
        const obj = JSON.parse(raw);
        if (
          obj &&
          typeof obj === "object" &&
          !Array.isArray(obj) &&
          typeof obj.id === "string" &&
          Array.isArray(obj.entries)
        ) {
          orders.push(obj);
        }
      } catch (e) {
        console.warn("[GET /orders] skip file", name, e.message);
      }
    }

    orders.sort((a, b) => (Number(b.paidAt) || 0) - (Number(a.paidAt) || 0));
    return res.json({ orders });
  } catch (err) {
    console.error("GET /orders error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to list orders" });
  }
});

/** Delete one order JSON file by id (matches save-order filename or scans files). */
app.delete("/orders/:orderId", async (req, res) => {
  try {
    const rawId = req.params.orderId;
    const orderId =
      typeof rawId === "string" && rawId.trim() ? decodeURIComponent(rawId.trim()) : "";
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    await fs.mkdir(ORDERS_DIR, { recursive: true });
    const primaryPath = path.join(ORDERS_DIR, safeOrderFilename(orderId));

    try {
      await fs.unlink(primaryPath);
      console.log("[DELETE /orders] removed", primaryPath);
      return res.json({ ok: true, file: path.basename(primaryPath) });
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.error("DELETE /orders unlink primary:", e.message);
        return res.status(500).json({ error: e.message || "Failed to delete order file" });
      }
    }

    const names = await fs.readdir(ORDERS_DIR);
    for (const name of names) {
      if (!name.endsWith(".json")) continue;
      const full = path.join(ORDERS_DIR, name);
      try {
        const raw = await fs.readFile(full, "utf8");
        const obj = JSON.parse(raw);
        if (obj && typeof obj === "object" && obj.id === orderId) {
          await fs.unlink(full);
          console.log("[DELETE /orders] removed (scan)", full);
          return res.json({ ok: true, file: name });
        }
      } catch (e) {
        console.warn("[DELETE /orders] skip", name, e.message);
      }
    }

    return res.status(404).json({ error: "Order not found" });
  } catch (err) {
    console.error("DELETE /orders error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to delete order" });
  }
});

const MAX_PORT_TRIES = 20;
const server = http.createServer(app);

function listenFrom(p, triesLeft) {
  const onError = (err) => {
    server.removeListener("error", onError);
    if (err.code === "EADDRINUSE" && triesLeft > 0) {
      console.warn(`Port ${p} is already in use, trying ${p + 1}…`);
      server.close(() => listenFrom(p + 1, triesLeft - 1));
    } else if (err.code === "EADDRINUSE") {
      console.error(
        `Could not bind a port after ${MAX_PORT_TRIES} attempts from ${port}. ` +
          "Stop the other process using this range or set PORT in .env to a free port " +
          "(e.g. PORT=5001)."
      );
      process.exit(1);
    } else {
      console.error(err);
      process.exit(1);
    }
  };
  server.once("error", onError);
  server.listen(p, () => {
    server.removeListener("error", onError);
    console.log(`Order save server running on http://localhost:${p}`);
  });
}

listenFrom(port, MAX_PORT_TRIES);
