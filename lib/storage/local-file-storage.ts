import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { fileStorageConfig } from "../../config/file-storage.ts";

export type FileStorage = { put(key: string, data: Uint8Array): Promise<void>; get(key: string): Promise<Uint8Array>; delete(key: string): Promise<void>; createKey(scope: string): string };

function root() { if (process.env.NODE_ENV === "production") throw new Error("A production file storage adapter must be configured."); return path.resolve(/*turbopackIgnore: true*/ fileStorageConfig.root ?? path.join(os.tmpdir(), "e-auction-storage")); }
function target(key: string) { const resolved = path.resolve(root(), key); if (!resolved.startsWith(`${root()}${path.sep}`)) throw new Error("Invalid storage key."); return resolved; }

export const localFileStorage: FileStorage = {
  createKey(scope) { return `${scope}/${randomUUID()}`; },
  async put(key, data) { const destination = target(key); await fs.mkdir(path.dirname(destination), { recursive: true }); await fs.writeFile(destination, data, { flag: "wx" }); },
  async get(key) { return fs.readFile(target(key)); },
  async delete(key) { await fs.rm(target(key), { force: false }); },
};
