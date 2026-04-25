import { describe, it, expect, vi } from "vitest";
import { notionExportPreProcessor } from "@/transformer/NotionDataTransformer";
import { NotionExpenseRecord } from "@/model/NotionExpenseRecord";

describe("notionExportPreProcessor", () => {
  it("should return an empty array if input items array is empty", () => {
    const result = notionExportPreProcessor([]);
    expect(result).toEqual([]);
  });

  it("should correctly transform an array of NotionExpenseRecord into Notion API compatible payloads", () => {
    const mockRecords: NotionExpenseRecord[] = [
      {
        Name: "Coffee",
        Amount: 5.5,
        Type: "Food & Beverage",
        Date: new Date("2023-10-14T08:30:00.000Z"),
        Notes: "Morning coffee",
        "Created at": new Date("2023-10-15T12:00:00.000Z"),
      },
    ];

    const result = notionExportPreProcessor(mockRecords);

    expect(result).toEqual([
      {
        Name: { title: [{ text: { content: "Coffee" } }] },
        Amount: { number: 5.5 },
        Type: { select: { name: "Food & Beverage" } },
        Date: { date: { start: "2023-10-14T08:30:00.000Z" } },
        Notes: { rich_text: [{ text: { content: "Morning coffee" } }] },
        "Created at": { date: { start: "2023-10-15T12:00:00.000Z" } },
      },
    ]);
  });

  it("should fallback to DEFAULT_NOTION_SCHEMA for unknown mapped fields", () => {
    const mockRecords = [
      { UnknownField: "Some random data" },
    ] as unknown as NotionExpenseRecord[];
    const result = notionExportPreProcessor(mockRecords);

    expect(result).toEqual([
      {
        UnknownField: {
          rich_text: [{ text: { content: "Some random data" } }],
        },
      },
    ]);
  });
});
