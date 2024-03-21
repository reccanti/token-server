import { resolve } from "path";
import StyleDictionary, { DesignTokens } from "style-dictionary";
import { mkdirp } from "mkdirp";
import { writeFile, readFile } from "fs/promises";
import { inspect } from "util";
import { glob } from "glob";

interface Metadata {
  pluginVersion: string;
  updatedAt: string;
}

// const TEMP_DIR = process.env.TMPDIR || process.env.TMP || process.env.TEMP;
const TOKENS_DIR = resolve(__dirname, "..", "tokens");
const METADATA_DIR = resolve(TOKENS_DIR, "metadata");
const THEMES_DIR = resolve(TOKENS_DIR, "themes");

const dictionary = StyleDictionary.extend({
  source: [resolve(TOKENS_DIR, "**/*.json")],
  platforms: {
    json: {
      format: "json",
    },
  },
});

export class Tokens {
  private _metadata: Metadata;
  private _tokens: DesignTokens;

  public get tokens() {
    return this._tokens;
  }

  public get metadata(): Readonly<Metadata> {
    return this._metadata;
  }

  async initialize() {
    // Create theme and metadata directories if they don't already exist
    await Promise.all([mkdirp(METADATA_DIR), mkdirp(THEMES_DIR)]);

    // fetch all theme data and combine it from the themes directory
    const themeFiles = await glob(resolve(THEMES_DIR, "*.json"));

    let loadedTokens: DesignTokens = {};
    for (const themeFile of themeFiles) {
      try {
        const fileContents = await readFile(themeFile, "utf8");
        const json = JSON.parse(fileContents);
        loadedTokens = { ...loadedTokens, ...json };
      } catch (err) {
        console.error(`Error processing theme file ${themeFile}, skipping...`);
      }
    }
    this._tokens = loadedTokens;

    // load the metadata
    const metadataFiles = await glob(resolve(METADATA_DIR, "*.json"));
    if (!metadataFiles.length) {
      this._metadata = {
        pluginVersion: "",
        updatedAt: new Date().toISOString(),
      };

      await writeFile(
        resolve(METADATA_DIR, "metadata.json"),
        JSON.stringify(this._metadata, null, 2)
      );
    } else {
      let loadedMetadata: Partial<Metadata> = {};
      for (const metadataFile of metadataFiles) {
        try {
          const fileContents = await readFile(metadataFile, "utf8");
          const json = JSON.parse(fileContents);
          loadedMetadata = { ...loadedMetadata, ...json };
        } catch (err) {
          console.error(
            `Error processing metadata file ${metadataFile}, skipping...`
          );
        }
      }

      console.log(loadedMetadata);

      this._metadata = loadedMetadata as Metadata;
    }
  }

  async create(metadata: Metadata) {
    this._tokens = {};
    this._metadata = metadata;
    await this.writeTempFiles();
  }

  async update(tokens: DesignTokens, metadata: Metadata) {
    this._tokens = tokens;
    this._metadata = metadata;
    await this.writeTempFiles();
  }

  private async writeTempFiles() {
    // create the temp directory if it doesn't exist
    const tokensDir = TOKENS_DIR;
    await mkdirp(tokensDir);

    // split the token data into separate theme files
    const themes = Object.keys(this._tokens);

    const writeFiles = themes.map((theme) =>
      writeFile(
        resolve(tokensDir, "themes", `${theme}.json`),
        JSON.stringify(this.tokens[theme], null, 2)
      )
    );

    const writeMetadata = writeFile(
      resolve(tokensDir, "metadata", "metadata.json"),
      JSON.stringify(this.metadata, null, 2)
    );

    await Promise.all([...writeFiles, writeMetadata]);

    const out = dictionary.exportPlatform("json");
    console.log(inspect(out, true, 10, true));
  }
}
