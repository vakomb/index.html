/**
 * Zero-config JSON datastore for settings and orders.
 *
 * Writes are serialised through an in-process queue and committed atomically
 * (write temp file → rename). This is ideal for local development and
 * single-instance hosting. For serverless/multi-instance deployments, swap
 * this module for a database (Postgres, Supabase…) — the exported functions
 * are the only contract the rest of the app depends on.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "./config";
import type { Order, Settings } from "./types";

interface Db {
  settings: Settings;
  orders: Order[];
}

const DATA_DIR = path.resolve(process.cwd(), config.dataDir);
const DB_FILE = path.join(DATA_DIR, "db.json");

const initialDb = (): Db => ({
  settings: { markup: config.pricing.defaultMarkup, updatedAt: new Date().toISOString() },
  orders: [],
});

let queue: Promise<unknown> = Promise.resolve();

async function readDb(): Promise<Db> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Db>;
    return { ...initialDb(), ...parsed, settings: { ...initialDb().settings, ...parsed.settings } };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return initialDb();
    throw err;
  }
}

async function writeDb(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

/** Runs a read-modify-write transaction exclusively. */
function transact<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

/* ───────────────────────────── Settings ───────────────────────────── */

export async function getSettings(): Promise<Settings> {
  return (await readDb()).settings;
}

export function updateMarkup(markup: number): Promise<Settings> {
  return transact((db) => {
    db.settings = { markup, updatedAt: new Date().toISOString() };
    return db.settings;
  });
}

/* ────────────────────────────── Orders ────────────────────────────── */

export async function listOrders(): Promise<Order[]> {
  const db = await readDb();
  return [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | null> {
  return (await readDb()).orders.find((o) => o.id === id) ?? null;
}

export function insertOrder(order: Order): Promise<Order> {
  return transact((db) => {
    db.orders.push(order);
    return order;
  });
}

export function mutateOrder(id: string, fn: (order: Order) => void): Promise<Order | null> {
  return transact((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return null;
    fn(order);
    return order;
  });
}
