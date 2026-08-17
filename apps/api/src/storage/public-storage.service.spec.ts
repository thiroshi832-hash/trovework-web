import { ConfigService } from "@nestjs/config";
import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PublicStorageService } from "./public-storage.service";

function makeService(root: string) {
  const cfg: Record<string, string> = { PUBLIC_DIR: root, PUBLIC_URL_BASE: "/uploads" };
  const config = { get: (k: string, d?: string) => cfg[k] ?? d } as unknown as ConfigService;
  return new PublicStorageService(config);
}

describe("PublicStorageService", () => {
  it("saves under <userId>/ and returns a public URL path", async () => {
    const root = await mkdtemp(join(tmpdir(), "trovework-pub-"));
    const svc = makeService(root);

    const url = await svc.save("u1", "photo", { buffer: Buffer.from("img"), originalName: "me.JPG" });
    expect(url).toMatch(/^\/uploads\/u1\/photo-[0-9a-f-]+\.jpg$/); // lowercased extension
    const files = await readdir(join(root, "u1"));
    expect(files).toHaveLength(1);
    expect(await readFile(join(root, "u1", files[0]), "utf8")).toBe("img");
  });

  it("removes a stored asset by its URL path", async () => {
    const root = await mkdtemp(join(tmpdir(), "trovework-pub-"));
    const svc = makeService(root);
    const url = await svc.save("u1", "photo", { buffer: Buffer.from("x"), originalName: "a.png" });
    await svc.remove(url);
    expect(await readdir(join(root, "u1"))).toHaveLength(0);
  });

  it("refuses to delete outside the store (path traversal)", async () => {
    const root = await mkdtemp(join(tmpdir(), "trovework-pub-"));
    const outside = join(root, "secret.txt");
    await writeFile(outside, "keep me");
    const svc = makeService(root);

    // A crafted URL that tries to climb out must be a no-op.
    await svc.remove("/uploads/../secret.txt");
    expect(await readFile(outside, "utf8")).toBe("keep me");
  });

  it("ignores a URL that isn't under the public base", async () => {
    const svc = makeService(await mkdtemp(join(tmpdir(), "trovework-pub-")));
    await expect(svc.remove("/secured/u1/id-front.jpg")).resolves.toBeUndefined();
  });
});
