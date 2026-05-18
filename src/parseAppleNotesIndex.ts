import * as fs from "fs";
import { parseExpenses } from "#/parser/CustomAppleNotesParser.js";
import { cwd } from "node:process";

const path = `${cwd()}/io/input.txt`;
const outputPath = `${cwd()}/io`;
parseExpenses(fs.readFileSync(path, "utf8"), "y", outputPath);
