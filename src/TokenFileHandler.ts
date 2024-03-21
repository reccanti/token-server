import { resolve, parse } from "path";
import { mkdirp } from "mkdirp";
import { EventEmitter } from "events";
import { glob } from "glob";
import { writeFile, readFile } from "fs/promises";
import { Metadata, Tokens } from "./TokenModel";
import { DesignTokens } from "style-dictionary/types/DesignToken";
import chokidar from "chokidar";

/**
 * This handles code responsible for interacting with Token files, such as
 * taking data from a Tokens object and converting it into files, or extracting
 * data from files and turning into a Tokens object
 */

const TOKEN_DIR = resolve(__dirname, "..", "tokens");
const METADATA_DIR = resolve(TOKEN_DIR, "metadata");
const THEMES_DIR = resolve(TOKEN_DIR, "themes");

export class TokenFileHandler extends EventEmitter<{
  themesChanged: [Tokens];
}> {
  private async loadMetadata(): Promise<Metadata | null> {
    const metadataFile = resolve(METADATA_DIR, "metadata.json");
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
    const themeFiles = await glob(resolve(THEMES_DIR, "*.json"));

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
    await Promise.all([mkdirp(METADATA_DIR), mkdirp(THEMES_DIR)]);

    // initialize metadata if it doesn't already exist
    const metadataFile = resolve(METADATA_DIR, "metadata.json");
    const foundFiles = await glob(metadataFile);
    if (!foundFiles.length) {
      const metadata: Metadata = {
        pluginVersion: "0",
        updatedAt: new Date().toISOString(),
      };
      await writeFile(metadataFile, JSON.stringify(metadata, null, 2));
    }

    // have chokidar watch for file changes an emit events
    chokidar.watch(THEMES_DIR).on("all", async () => {
      const newTokens = await this.loadTokensFromFiles();
      this.emit("themesChanged", newTokens);
    });
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
      resolve(METADATA_DIR, "metadata.json"),
      JSON.stringify(metadata, null, 2)
    );
    const writeThemes = Object.keys(tokens.tokens).map((theme) => {
      const themeFile = resolve(THEMES_DIR, `${theme}.json`);
      return writeFile(
        themeFile,
        JSON.stringify(tokens.tokens[theme], null, 2)
      );
    });
    await Promise.all([...writeThemes, writeMetadata]);
  }
}
