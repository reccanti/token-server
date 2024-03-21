/**
 * When we receive an update from Tokens Studio for Figma, we need to do the
 * following:
 *
 * 1. Split the response into individual themes and metadata
 * 2. Save the output to a temp directory
 * 3. Run StyleDictionary on the temp directory and save the output to the
 *    "tokens" directory
 */
