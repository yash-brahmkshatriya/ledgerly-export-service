import { parseExpenses } from "@/parser/CustomAppleNotesParser";
import { cwd } from "node:process";

const path = `${cwd()}/io/input.txt`;
const outputPath = `${cwd()}/io`;
parseExpenses(path, outputPath);
