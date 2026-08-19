import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { isSafeSegment } from "./public-storage.service";

export interface StoredFile {
  buffer: Buffer;
  /** Original name, used only to keep a sensible extension. */
  originalName: string;
}

/**
 * Writes ID images and selfies to the SECURED store — a directory OUTSIDE the
 * web root that nginx never serves (FR-F-3, NFR-SEC-2). Foldered by user so a
 * subject's documents sit together (FR-F-2). The container mounts this at
 * /app/secured (see docker-compose); locally it defaults under the repo.
 *
 * A cloud/object-store implementation can replace this behind the same shape.
 */
@Injectable()
export class SecuredStorageService {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = config.get<string>("SECURED_DIR", "./secured");
  }

  /** Saves one file under secured/<userId>/, returns the stored path. */
  async save(userId: string, kind: string, file: StoredFile): Promise<string> {
    const dir = join(this.root, userId);
    await mkdir(dir, { recursive: true });
    const ext = (file.originalName.match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase();
    const name = `${kind}-${randomUUID()}${ext}`;
    const full = join(dir, name);
    await writeFile(full, file.buffer, { mode: 0o600 });
    return full;
  }

  /** Best-effort removal of a user's whole secured folder (used when deleting them). */
  async removeUserDir(userId: string): Promise<void> {
    if (!isSafeSegment(userId)) return;
    await rm(join(this.root, userId), { recursive: true, force: true }).catch(() => undefined);
  }
}
