import { ConflictException, NotFoundException } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import type { PrismaService } from "../prisma/prisma.service";

function prismaDouble() {
  const rows: any[] = [];
  return {
    rows,
    category: {
      findMany: jest.fn(async ({ where, orderBy }: any = {}) => {
        let out = rows.filter((c) => (where?.isActive != null ? c.isActive === where.isActive : true));
        if (orderBy?.sortOrder) {
          out = [...out].sort((a, b) =>
            orderBy.sortOrder === "desc" ? b.sortOrder - a.sortOrder : a.sortOrder - b.sortOrder,
          );
        }
        return out;
      }),
      findFirst: jest.fn(async ({ where, orderBy }: any = {}) => {
        if (orderBy?.sortOrder === "desc") {
          return [...rows].sort((a, b) => b.sortOrder - a.sortOrder)[0] ?? null;
        }
        const not = where?.NOT?.id;
        const match = rows.find(
          (c) =>
            (c.id !== not) &&
            (where?.OR ?? []).some((cond: any) => (cond.name ? c.name === cond.name : c.slug === cond.slug)),
        );
        return match ?? null;
      }),
      findUnique: jest.fn(async ({ where }: any) => rows.find((c) => c.id === where.id) ?? null),
      create: jest.fn(async ({ data }: any) => {
        const c = { id: `cat${rows.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        rows.push(c);
        return c;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const c = rows.find((x) => x.id === where.id);
        Object.assign(c, data, { updatedAt: new Date() });
        return c;
      }),
      delete: jest.fn(async ({ where }: any) => {
        const i = rows.findIndex((c) => c.id === where.id);
        return rows.splice(i, 1)[0];
      }),
    },
  };
}

const makeService = (db: ReturnType<typeof prismaDouble>) =>
  new CategoriesService(db as unknown as PrismaService);

describe("CategoriesService", () => {
  it("derives a slug from the name and appends to the end", async () => {
    const db = prismaDouble();
    db.rows.push({ id: "cat0", name: "Existing", slug: "existing", sortOrder: 0, isActive: true });
    const c = await makeService(db).create({ name: "Pet Care & Walking" });
    expect(c.slug).toBe("pet-care-walking");
    expect(c.sortOrder).toBe(1); // after the existing one
    expect(c.isActive).toBe(true);
  });

  it("honours an explicit slug and order", async () => {
    const db = prismaDouble();
    const c = await makeService(db).create({ name: "Legal", slug: "legal-services", sortOrder: 3, isActive: false });
    expect(c.slug).toBe("legal-services");
    expect(c.sortOrder).toBe(3);
    expect(c.isActive).toBe(false);
  });

  it("rejects a duplicate name or slug", async () => {
    const db = prismaDouble();
    const svc = makeService(db);
    await svc.create({ name: "Cleaning" });
    await expect(svc.create({ name: "Cleaning" })).rejects.toThrow(ConflictException);
    await expect(svc.create({ name: "Different", slug: "cleaning" })).rejects.toThrow(ConflictException);
  });

  it("lists only active categories publicly, in order", async () => {
    const db = prismaDouble();
    db.rows.push(
      { id: "a", name: "B", slug: "b", sortOrder: 1, isActive: true },
      { id: "b", name: "A", slug: "a", sortOrder: 0, isActive: true },
      { id: "c", name: "Hidden", slug: "hidden", sortOrder: 2, isActive: false },
    );
    const list = await makeService(db).listActive();
    expect(list.map((c) => c.name)).toEqual(["A", "B"]);
  });

  it("lists everything for admins", async () => {
    const db = prismaDouble();
    db.rows.push(
      { id: "a", name: "A", slug: "a", sortOrder: 0, isActive: true },
      { id: "c", name: "Hidden", slug: "hidden", sortOrder: 1, isActive: false },
    );
    expect(await makeService(db).listAll()).toHaveLength(2);
  });

  it("renames and reorders, and can deactivate", async () => {
    const db = prismaDouble();
    const svc = makeService(db);
    const c = await svc.create({ name: "Tutor" });
    const up = await svc.update(c.id, { name: "Tutoring & Lessons", sortOrder: 5, isActive: false });
    expect(up.name).toBe("Tutoring & Lessons");
    expect(up.sortOrder).toBe(5);
    expect(up.isActive).toBe(false);
  });

  it("won't rename onto another category's name", async () => {
    const db = prismaDouble();
    const svc = makeService(db);
    await svc.create({ name: "Cleaning" });
    const other = await svc.create({ name: "Repairs" });
    await expect(svc.update(other.id, { name: "Cleaning" })).rejects.toThrow(ConflictException);
  });

  it("404s updating or deleting an unknown category", async () => {
    const svc = makeService(prismaDouble());
    await expect(svc.update("nope", { name: "x" })).rejects.toThrow(NotFoundException);
    await expect(svc.remove("nope")).rejects.toThrow(NotFoundException);
  });

  it("deletes a category", async () => {
    const db = prismaDouble();
    const svc = makeService(db);
    const c = await svc.create({ name: "Temp" });
    await svc.remove(c.id);
    expect(db.rows).toHaveLength(0);
  });
});
