import * as fs from "fs";
import { StructuredExpense, Split, Status } from "#/model/SharedSchema.js";
import { isEmpty } from "#/utils/common.js";
import { cwd } from "process";

// --- Main Runner ---

/**
 * Parses raw text and optionally writes to a JSON file.
 */
export const parseExpenses = (
  rawInput: string,
  myShortName: string = "y",
  optionalOutputPath?: string,
): StructuredExpense[] => {
  const outputPath = optionalOutputPath ?? `${cwd()}/io`;
  const lines = rawInput
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let lastDate = "";

  const skippedExpenses: string[] = [];

  const results = lines.reduce((acc: StructuredExpense[], line) => {
    if (isDateLine(line)) {
      lastDate = line;
      return acc;
    }

    if (lastDate) {
      const parsedExpense = parseLine(line, lastDate, myShortName);
      if (parsedExpense != null) {
        acc.push(parsedExpense);
      } else {
        skippedExpenses.push(`${lastDate} -> ${line}`);
      }
    }
    return acc;
  }, []);

  const outputFileName = `output.json`;
  const skippedFileName = `skipped.txt`;

  console.log(`Saving parsed expenses at ${outputPath}/${outputFileName}`);
  fs.writeFileSync(
    `${outputPath}/${outputFileName}`,
    JSON.stringify(results, null, 2),
  );

  console.log(`Saving skipped expenses at ${outputPath}/${skippedFileName}`);
  fs.writeFileSync(
    `${outputPath}/${skippedFileName}`,
    skippedExpenses.join("\n"),
  );

  return results;
};

// --- Logic Functions ---

const isDateLine = (line: string): boolean =>
  /^\d{1,2}\s[a-zA-Z]{3}/.test(line);

const formatTimestamp = (dateStr: string): string => {
  const currentYear = new Date().getFullYear();
  const hasYear = /\d{4}$/.test(dateStr);
  const finalDateStr = hasYear ? dateStr : `${dateStr} ${currentYear}`;

  const d = new Date(finalDateStr);

  // Extract local components to maintain "Local Midnight"
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  // Return as ISO format but pinned to 00:00:00.000Z to satisfy the equality check
  // This represents "Midnight on this date" as a standardized string
  return `${year}-${month}-${day}T00:00:00.000Z`;
};

const parseSplitString = (splitStr: string, total: number): Split => {
  const split: Split = {};
  if (splitStr.includes("(")) {
    const regex = /([a-zA-Z])\((\d+(\.\d+)?)\)/g;
    let match;
    while ((match = regex.exec(splitStr)) !== null) {
      const char = match[1];
      const val = parseFloat(match[2]);
      split[char] = (split[char] || 0) + val;
    }
  } else {
    const chars = splitStr.split("");
    const share = total / chars.length;
    chars.forEach((char) => {
      split[char] = (split[char] || 0) + share;
    });
  }
  return split;
};

const parseLine = (
  line: string,
  dateStr: string,
  myShortName: string,
): StructuredExpense | null => {
  const parts = line.split("-").map((s) => s.trim());
  const isValidExpense = validate(parts);

  const [amountStr, title, paidBy, splitStr, categoryRaw, description] = parts;

  const totalAmount = parseFloat(amountStr);
  const category = categoryRaw || "";

  let status: Status = isValidExpense ? "PROCESSED" : "UNPROCESSED";
  let splitObj: Split = {};

  if (!isValidExpense) return null;

  if (splitStr.includes("?")) {
    status = "UNPROCESSED";
  } else {
    splitObj = parseSplitString(splitStr, totalAmount);
    const sum = Object.values(splitObj).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - totalAmount) > 0.01) {
      status = "UNPROCESSED";
    }
  }

  return {
    expenseTimestamp: formatTimestamp(dateStr),
    title,
    amount: splitObj[myShortName] || 0,
    category,
    tags: [],
    description: description || "",
    split: splitObj,
    paymentSource: paidBy,
    status,
    trainingStatus: "PENDING",
    metadata: { rawSplit: splitStr, totalAmount },
  };
};

// Helper functions
const validate = (parts: string[]): boolean => {
  const [amountStr, title, paidBy, splitStr] = parts;
  if (
    isEmpty(amountStr) ||
    isEmpty(title) ||
    isEmpty(paidBy) ||
    isEmpty(splitStr)
  )
    return false;

  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return false;

  return true;
};

// --- Example Usage ---
/*
const rawData = `
24 Apr
145 - Movie - y - y - movie1 - Entertainment
1000 - Aloo - y - yny - - Food
500 - ABC - u - y(45)h(55)u(400) - play - Hobbies
200 - Coffee - y - y?n - starbucks
`;

const data = parseExpenses(rawData, "y", "output.json");

*/
