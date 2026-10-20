import { beforeAll, describe, expect, it } from "vitest";
import { signSession, verifySession } from "../session";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";
});

describe("session JWT", () => {
  it("firma y verifica el id de usuario", async () => {
    const t = await signSession("user-123");
    expect(await verifySession(t)).toBe("user-123");
  });
  it("rechaza tokens inválidos o vacíos", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("abc.def.ghi")).toBeNull();
  });
  it("rechaza un token firmado con otro secreto", async () => {
    const t = await signSession("user-123");
    process.env.SESSION_SECRET = "otro-secreto-otro-secreto-otro-secreto-99";
    expect(await verifySession(t)).toBeNull();
    process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-1234";
  });
});
