import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { notionRecordMapper } from "#/mapper/NotionRecordMapper.js";
import { components } from "#root/types.js";

type StructuredExpense = components["schemas"]["StructuredExpense"];

describe("notionRecordMapper", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-10-15T12:00:00.000Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should successfully map a StructuredExpense to a NotionExpenseRecord", () => {
    const mockExpense = {
      title: "Coffee",
      amount: 5.5,
      category: "Food & Beverage",
      expenseTimestamp: "2023-10-14T08:30:00.000Z",
      description: "Morning coffee",
    } as StructuredExpense;

    const result = notionRecordMapper(mockExpense);

    expect(result).toEqual({
      Name: "Coffee",
      Amount: 5.5,
      Type: "Food & Beverage",
      Date: new Date("2023-10-14T08:30:00.000Z"),
      Notes: "Morning coffee",
      "Created at": new Date("2023-10-15T12:00:00.000Z"),
    });
  });
});
