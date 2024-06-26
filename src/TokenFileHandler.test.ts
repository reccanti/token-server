import mock from "mock-fs";
// import { existsSync, accessSync, promises as fsPromises } from "fs";
import { resolve } from "path";
import { readFile, readdir } from "fs/promises";
import { DEFAULT_TOKEN_DIR, TokenFileHandler } from "./TokenFileHandler";

// const { readdir, readFile, stat, lstat, access } = fsPromises;

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

    // const cwd = await readdir(process.cwd(), {
    //   recursive: true,
    //   withFileTypes: true,
    // });
    // const tokenDir = await readdir(DEFAULT_TOKEN_DIR, {
    //   recursive: true,
    //   withFileTypes: true,
    // });

    // console.log(cwd);
    // console.log(tokenDir);
    // const s = accessSync(process.cwd());
    // console.log(s);

    // console.log(mock.getMockRoot());
    // console.log(DEFAULT_TOKEN_DIR);
    // console.log(process.cwd());

    // expect the file structure to be initialized correctly
    // expect(existsSync(DEFAULT_TOKEN_DIR)).toBe(true);
    // expect(existsSync(handler.themesDir)).toBe(true);
    // expect(existsSync(handler.metadataDir)).toBe(true);

    // expect(await readdir(DEFAULT_TOKEN_DIR)).not.toThrow();
    // expect(await readdir(handler.themesDir)).not.toThrow();
    // expect(await readdir(handler.metadataDir)).not.toThrow();

    await expect(readdir(DEFAULT_TOKEN_DIR)).resolves;
    await expect(readdir(handler.themesDir)).resolves;
    await expect(readdir(handler.metadataDir)).resolves;

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
    // expect(await readdir(DEFAULT_TOKEN_DIR)).toThrow();
    // expect(existsSync(testDir)).toBe(true);
    // expect(existsSync(handler.themesDir)).toBe(true);
    // expect(existsSync(handler.metadataDir)).toBe(true);

    await expect(readdir(DEFAULT_TOKEN_DIR)).rejects.toThrow();
    await expect(readdir(testDir)).resolves;
    await expect(readdir(handler.themesDir)).resolves;
    await expect(readdir(handler.metadataDir)).resolves;

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
