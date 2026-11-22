import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./config/db.js";
import Admin from "./models/Admin.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contacts.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "contact-management-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(422).json({ message: "Validation failed.", errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message])) });
  res.status(500).json({ message: "An unexpected server error occurred." });
});

async function seedAdmin() {
  const name = process.env.ADMIN_NAME || "Administrator";
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before starting.");
  const existing = await Admin.findOne({ email });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await Admin.create({ name, email, password: hashedPassword });
    console.log(`Initial administrator created: ${email}`);
  } else {
    console.log(`Administrator account ready: ${email}`);
  }
}

const port = Number(process.env.PORT) || 5000;
connectDatabase()
  .then(seedAdmin)
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch(error => { console.error("Startup failed:", error.message); process.exit(1); });
