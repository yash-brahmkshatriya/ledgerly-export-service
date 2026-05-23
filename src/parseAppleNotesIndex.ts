import * as fs from "fs";
import { parseExpenses } from "#/parser/CustomAppleNotesParser.js";
import { getIODirPath } from "#/utils/io.js";

const path = `${getIODirPath()}/input.txt`;
const outputPath = `${getIODirPath()}`;

parseExpenses(fs.readFileSync(path, "utf8"), "y", outputPath);
