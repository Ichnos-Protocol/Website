import { join } from "path";
import { fileURLToPath } from "url";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();
vi.mock("fs", () => ({
  default: {
    existsSync: mockExistsSync,
    readdirSync: mockReaddirSync,
    readFileSync: mockReadFileSync,
  },
}));

const mockQuery = vi.fn();
const mockConnect = vi.fn();
const mockEnd = vi.fn();
const mockClientConstructor = vi.fn(function () {
  this.connect = mockConnect;
  this.query = mockQuery;
  this.end = mockEnd;
});
vi.mock("pg", () => ({ default: { Client: mockClientConstructor } }));

const { runMigrations, isMainModule } = await import("./runMigrations.js");
const clientsBuiltAtImport = mockClientConstructor.mock.calls.length;

const DB_URL = "postgresql://u:p@localhost/db";
const INSERT_SQL =
  "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING";

/**
 * Fake database. `initial` is what the first read of schema_migrations sees
 * (null = table absent); `recordedInLock` is what the in-lock re-check sees.
 */
function fakeDb({ initial = null, recordedInLock = [], tablePresent }) {
  const state = { tablePresent: tablePresent ?? initial !== null };
  mockQuery.mockImplementation(async (sql, params) => {
    if (sql === "SELECT filename FROM schema_migrations") {
      if (initial === null) {
        throw Object.assign(new Error("missing"), { code: "42P01" });
      }
      return { rows: initial.map((filename) => ({ filename })) };
    }
    if (sql.includes("to_regclass")) {
      return { rows: [{ present: state.tablePresent }] };
    }
    if (sql.startsWith("SELECT 1 FROM schema_migrations")) {
      return { rows: recordedInLock.includes(params[0]) ? [{ one: 1 }] : [] };
    }
    if (sql.startsWith("SQL:000")) state.tablePresent = true;
    return { rows: [] };
  });
}

function sqlCalls() {
  return mockQuery.mock.calls.map(([sql]) => sql);
}

function logLines() {
  return console.log.mock.calls.map(([line]) => line);
}

describe("runMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue([
      "002_b.sql",
      "000_a.sql",
      "README.md",
      "001_c.sql",
    ]);
    mockReadFileSync.mockImplementation(
      (path) => `SQL:${path.split(/[\\/]/).pop()}`,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("constructs no client on import", () => {
    expect(clientsBuiltAtImport).toBe(0);
  });

  it("applies files in sorted order with the existing log lines", async () => {
    fakeDb({ initial: null });

    await runMigrations(DB_URL);

    const fileSql = sqlCalls().filter((sql) => sql.startsWith("SQL:"));
    expect(fileSql).toEqual([
      "SQL:000_a.sql",
      "SQL:001_c.sql",
      "SQL:002_b.sql",
    ]);
    expect(logLines()).toEqual([
      "[migration] applying: 000_a.sql",
      "[migration] applying: 001_c.sql",
      "[migration] applying: 002_b.sql",
      "[migration] done",
    ]);
    expect(mockEnd).toHaveBeenCalledTimes(1);
  });

  it("takes pg_advisory_xact_lock right after BEGIN and never a session lock", async () => {
    fakeDb({ initial: ["000_a.sql", "001_c.sql"] });

    await runMigrations(DB_URL);

    const calls = sqlCalls();
    const begin = calls.indexOf("BEGIN");
    expect(begin).toBeGreaterThan(-1);
    expect(calls[begin + 1]).toBe("SELECT pg_advisory_xact_lock($1::bigint)");
    expect(mockQuery.mock.calls[begin + 1][1]).toEqual([expect.any(Number)]);
    expect(calls.some((sql) => /pg_advisory_lock\(/.test(sql))).toBe(false);
    expect(calls.some((sql) => /pg_advisory_unlock/.test(sql))).toBe(false);
  });

  it("skips a file another runner recorded after the first read", async () => {
    fakeDb({
      initial: ["000_a.sql", "001_c.sql"],
      recordedInLock: ["002_b.sql"],
    });

    await runMigrations(DB_URL);

    const calls = sqlCalls();
    expect(calls).not.toContain("SQL:002_b.sql");
    expect(calls).not.toContain(INSERT_SQL);
    expect(calls).toContain("COMMIT");
    expect(logLines()).toEqual([
      "[migration] skipping: 000_a.sql",
      "[migration] skipping: 001_c.sql",
      "[migration] applying: 002_b.sql",
      "[migration] skipping: 002_b.sql",
      "[migration] done",
    ]);
  });

  it("lets 000 apply and record when schema_migrations does not exist yet", async () => {
    mockReaddirSync.mockReturnValue(["000_a.sql"]);
    fakeDb({ initial: null, tablePresent: false });

    await runMigrations(DB_URL);

    const calls = sqlCalls();
    expect(calls).toContain("SQL:000_a.sql");
    expect(
      calls.some((sql) => sql.startsWith("SELECT 1 FROM schema_migrations")),
    ).toBe(false);
    expect(mockQuery).toHaveBeenCalledWith(INSERT_SQL, ["000_a.sql"]);
  });

  it("rejects when the migrations directory is missing", async () => {
    mockExistsSync.mockReturnValue(false);

    await expect(() => runMigrations(DB_URL)).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining("migrations directory not found"),
      }),
    );
    expect(mockClientConstructor).not.toHaveBeenCalled();
  });

  it("rejects when the directory holds no .sql files", async () => {
    mockReaddirSync.mockReturnValue(["README.md"]);

    await expect(() => runMigrations(DB_URL)).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining("no .sql migration files found"),
      }),
    );
  });

  it("forwards the ssl option to the client config", async () => {
    fakeDb({ initial: ["000_a.sql", "001_c.sql", "002_b.sql"] });
    const ssl = { rejectUnauthorized: false };

    await runMigrations(DB_URL, { ssl });

    expect(mockClientConstructor).toHaveBeenCalledWith({
      connectionString: DB_URL,
      ssl,
    });
  });

  it("builds the CLI client config unchanged when no options are given", async () => {
    fakeDb({ initial: ["000_a.sql", "001_c.sql", "002_b.sql"] });

    await runMigrations(DB_URL);

    expect(mockClientConstructor).toHaveBeenCalledWith({
      connectionString: DB_URL,
    });
  });
});

describe("isMainModule", () => {
  const moduleUrl = new URL("./runMigrations.js", import.meta.url).href;

  it("is true for the module's own resolved path", () => {
    expect(isMainModule(fileURLToPath(moduleUrl), moduleUrl)).toBe(true);
  });

  it("is false for a same-basename path in another directory", () => {
    const otherDir = fileURLToPath(new URL("./helpers/", import.meta.url));
    const other = join(otherDir, "runMigrations.js");
    expect(isMainModule(other, moduleUrl)).toBe(false);
  });

  it("is false when there is no argv path", () => {
    expect(isMainModule(undefined, moduleUrl)).toBe(false);
  });
});
