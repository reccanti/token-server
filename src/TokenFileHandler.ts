import { resolve, parse } from "path";
import { mkdirp } from "mkdirp";
import { EventEmitter } from "events";
import { glob } from "glob";
import { writeFile, readFile } from "fs/promises";
import { Metadata, Tokens } from "./TokenModel";
import { DesignTokens } from "style-dictionary/types/DesignToken";
import chokidar, { FSWatcher } from "chokidar";
// import { inspect } from "util";

/**
 * This handles code responsible for interacting with Token files, such as
 * taking data from a Tokens object and converting it into files, or extracting
 * data from files and turning into a Tokens object
 */

export const DEFAULT_TOKEN_DIR = resolve(process.cwd(), "tokens");
// export const DEFAULT_METADATA_DIR = resolve(DEFAULT_TOKEN_DIR, "metadata");
// export const DEFAULT_THEMES_DIR = resolve(DEFAULT_TOKEN_DIR, "themes");

interface Settings {
  tokenDir: string;
}

export class TokenFileHandler extends EventEmitter<{
  themesChanged: [Tokens];
}> {
  public readonly tokenDir: string;
  public readonly metadataDir: string;
  public readonly themesDir: string;

  private watchProcess: FSWatcher;

  constructor(settings: Partial<Settings> = {}) {
    super();
    this.tokenDir = settings.tokenDir || DEFAULT_TOKEN_DIR;
    this.metadataDir = resolve(this.tokenDir, "metadata");
    this.themesDir = resolve(this.tokenDir, "themes");
  }

  private async loadMetadata(): Promise<Metadata | null> {
    const metadataFile = resolve(this.metadataDir, "metadata.json");
    const foundFiles = await glob(metadataFile);
    if (foundFiles.length !== 1) {
      console.error(`metadata file not found at ${metadataFile}`);
      return null;
    } else {
      const contents = await readFile(metadataFile, "utf8");
      try {
        const json = JSON.parse(contents);
        return json;
      } catch {
        console.error(`Error parsing metadata file ${metadataFile}`);
        return null;
      }
    }
  }

  private async loadThemes(): Promise<DesignTokens> {
    const themeFiles = await glob(resolve(this.themesDir, "*.json"));

    let loadedTokens: DesignTokens = {};
    for (const themeFile of themeFiles) {
      try {
        const fileContents = await readFile(themeFile, "utf8");
        const json = JSON.parse(fileContents);
        const theme = parse(themeFile).name;
        loadedTokens = {
          ...loadedTokens,
          [theme]: { ...json },
        };
      } catch (err) {
        console.error(`Error processing theme file ${themeFile}, skipping...`);
      }
    }

    return loadedTokens;
  }

  async initializeFileStructure() {
    // initialize theme directories if they don't exist
    await Promise.all([mkdirp(this.metadataDir), mkdirp(this.themesDir)]);

    // initialize metadata if it doesn't already exist
    const metadataFile = resolve(this.metadataDir, "metadata.json");
    const foundFiles = await glob(metadataFile);
    if (!foundFiles.length) {
      const metadata: Metadata = {
        pluginVersion: "0",
        updatedAt: new Date().toISOString(),
      };
      await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
    }
  }

  async watch() {
    // have chokidar watch for file changes an emit events
    this.watchProcess = chokidar.watch(this.themesDir).on("all", async () => {
      const newTokens = await this.loadTokensFromFiles();
      this.emit("themesChanged", newTokens);
    });
  }

  close() {
    if (this.watchProcess) {
      this.watchProcess.close();
    }
  }

  async loadTokensFromFiles(): Promise<Tokens> {
    const metadata = await this.loadMetadata();
    if (!metadata) {
      throw Error(
        "Unable to load metadata. Token directory was not set up properly"
      );
    }
    const themes = await this.loadThemes();
    const tokens = new Tokens(themes, metadata);
    return tokens;
  }

  async saveTokensToFiles(tokens: Tokens) {
    // write the theme data abnd metadata to the correct files
    const metadata = tokens.metadata;
    const writeMetadata = writeFile(
      resolve(this.metadataDir, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );

    await writeMetadata;

    const themes = Object.keys(tokens.tokens);
    for (const theme of themes) {
      const themeFile = resolve(this.themesDir, `${theme}.json`);
      await writeFile(themeFile, JSON.stringify(tokens.tokens[theme], null, 2));
    }
  }
}

const handler = new TokenFileHandler();
