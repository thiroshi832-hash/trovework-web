import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export interface StoredFile {
  buffer: Buffer;
  /** Original name, used only to keep a sensible extension. */
  originalName: string;
}

/**
 * Writes PUBLIC assets — profile photos — to a directory nginx serves directly
 * (unlike the secured store, which it never serves). The container mounts this
 * at /app/storage (see docker-compose); nginx aliases /uploads/ to the same
 * host volume. `save` returns the public URL path, which is what we persist and
 * the browser requests — never a filesystem path.
 *
 * A cloud/object-store implementation can replace this behind the same shape.
 */
@Injectable()
export class PublicStorageService {
  private readonly root: string;
  private readonly urlBase: string;

  constructor(config: ConfigService) {
    this.root = config.get<string>("PUBLIC_DIR", "./storage");
    // No trailing slash; save() joins with one.
    this.urlBase = (config.get<string>("PUBLIC_URL_BASE", "/uploads") ?? "/uploads").replace(/\/+$/, "");
  }

  /** Saves under storage/<userId>/, returns the public URL path (/uploads/...). */
  async save(userId: string, kind: string, file: StoredFile): Promise<string> {
    const dir = join(this.root, userId);
    await mkdir(dir, { recursive: true });
    const ext = (file.originalName.match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase();
    const name = `${kind}-${randomUUID()}${ext}`;
    // World-readable: these are public assets served straight off disk.
    await writeFile(join(dir, name), file.buffer, { mode: 0o644 });
    return `${this.urlBase}/${userId}/${name}`;
  }

  /** Best-effort delete of a previously stored asset by its public URL path. */
  async remove(urlPath: string): Promise<void> {
    if (!urlPath.startsWith(`${this.urlBase}/`)) return;
    const relative = urlPath.slice(this.urlBase.length + 1);
    // Guard against path traversal before touching the filesystem.
    if (relative.includes("..")) return;
    await rm(join(this.root, relative), { force: true }).catch(() => undefined);
  }
}
