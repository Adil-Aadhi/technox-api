const path = require("path");
const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// Allow frontend (React on Vercel) to call API
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Health check for Render
server.get("/healthz", (_req, res) => res.json({ ok: true }));

// Mount all API routes under /api
server.use("/api", router);

// 👇 Must come AFTER router
server.get("/api", (req, res) => {
  const db = router.db; // lowdb instance
  res.json({
    endpoints: Object.keys(db.data) // show top-level keys from db.json
  });
});

// Optional: also show endpoints at root /
server.get("/", (req, res) => {
  const db = router.db;
  res.json({
    endpoints: Object.keys(db.data).map((c) => `/api/${c}`)
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`✅ JSON Server running on port ${port}`);
});
