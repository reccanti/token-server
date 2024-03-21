import { DesignTokens } from "style-dictionary";

export interface Metadata {
  pluginVersion: string;
  updatedAt: string;
}

export class Tokens {
  tokens: DesignTokens;
  metadata: Metadata;

  constructor(tokens: DesignTokens, metadata: Metadata) {
    this.tokens = tokens;
    this.metadata = metadata;
  }
}
