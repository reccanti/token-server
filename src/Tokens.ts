import { resolve } from "path";
import StyleDictionary, { DesignTokens } from "style-dictionary";
import { mkdirp } from "mkdirp";
import { writeFile } from "fs/promises";

interface Metadata {
  pluginVersion: string;
  updatedAt: string;
}

// const TEMP_DIR = process.env.TMPDIR || process.env.TMP || process.env.TEMP;
const TEMP_DIR = resolve(__dirname, "..", "temp");

console.log(TEMP_DIR);

export class Tokens {
  private _metadata: Metadata;
  private _tokens: DesignTokens;

  public get tokens() {
    return this._tokens;
  }

  public get metadata(): Readonly<Metadata> {
    return this._metadata;
  }

  constructor() {}

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
    const tokensDir = resolve(TEMP_DIR, "tokens");
    await mkdirp(tokensDir);

    // split the token data into separate theme files
    const themes = Object.keys(this._tokens);

    const writeFiles = themes.map((theme) =>
      writeFile(
        resolve(tokensDir, `${theme}.json`),
        JSON.stringify(this.tokens[theme], null, 2)
      )
    );

    const writeMetadata = writeFile(
      resolve(tokensDir, "metadata.json"),
      JSON.stringify(this.metadata, null, 2)
    );

    await Promise.all([...writeFiles, writeMetadata]);
  }
}
