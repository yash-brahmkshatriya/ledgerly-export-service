import * as fs from "fs";
import { parseExpenses } from "#/parser/CustomAppleNotesParser.js";
import { getIODirPath } from "#/utils/io.js";
import { StructuredExpense } from "./model/SharedSchema.js";
import { notionExporter } from "./export/NotionExporter.js";

const path = `${getIODirPath()}/input.txt`;
const outputPath = `${getIODirPath()}`;

const parsedExpenses: StructuredExpense[] = parseExpenses(
  fs.readFileSync(path, "utf8"),
  "y",
  outputPath,
);

notionExporter(parsedExpenses);
