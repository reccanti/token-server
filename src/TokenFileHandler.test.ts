import mock from "mock-fs";
import { existsSync } from "fs";
import { resolve } from "path";
import { readFile, readdir } from "fs/promises";
import { DEFAULT_TOKEN_DIR, TokenFileHandler } from "./TokenFileHandler";

describe("TokenFileHandler", () => {
  beforeEach(() => {
    mock({}, { createCwd: true, createTmp: true });
  });

  afterEach(() => {
    mock.restore();
  });

  it("correctly initializes the tokens directory in the default location", async () => {
    const handler = new TokenFileHandler();
    await handler.initializeFileStructure();

    const cwd = await readdir(process.cwd(), { recursive: true });
    const tokenDir = await readdir(DEFAULT_TOKEN_DIR, { recursive: true });

    console.log(cwd);
    console.log(tokenDir);

    // console.log(mock.getMockRoot());
    // console.log(DEFAULT_TOKEN_DIR);
    // console.log(process.cwd());

    // expect the file structure to be initialized correctly
    expect(existsSync(DEFAULT_TOKEN_DIR)).toBe(true);
    expect(existsSync(handler.themesDir)).toBe(true);
    expect(existsSync(handler.metadataDir)).toBe(true);

    // expect the metadata file to be initialized correctly
    const metadataStr = await readFile(
      resolve(handler.metadataDir, "metadata.json"),
      "utf8"
    );
    const metadata = JSON.parse(metadataStr);
    expect(typeof metadata.pluginVersion).toBe("string");
    expect(typeof metadata.updatedAt).toBe("string");
  });

  it("lets you customize the location of the tokens directory", async () => {
    const testDir = "customTokenDirectory";
    const handler = new TokenFileHandler({ tokenDir: testDir });
    await handler.initializeFileStructure();

    // expect the file structure to be initialized correctly
    expect(existsSync(DEFAULT_TOKEN_DIR)).toBe(false);
    expect(existsSync(testDir)).toBe(true);
    expect(existsSync(handler.themesDir)).toBe(true);
    expect(existsSync(handler.metadataDir)).toBe(true);

    // expect the metadata file to be initialized correctly
    const metadataStr = await readFile(
      resolve(handler.metadataDir, "metadata.json"),
      "utf8"
    );
    const metadata = JSON.parse(metadataStr);
    expect(typeof metadata.pluginVersion).toBe("string");
    expect(typeof metadata.updatedAt).toBe("string");
  });
});
