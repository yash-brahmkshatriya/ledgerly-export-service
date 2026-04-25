import { describe, it, expect, vi, beforeEach } from "vitest";
import { notionClient } from "@/client/NotionClient";
import { notionRecordMapper } from "@/mapper/NotionRecordMapper";
import { notionExportPreProcessor } from "@/transformer/NotionDataTransformer";
import { components } from "@root/types";
import { notionExporter } from "@/export/NotionExporter";

type StructuredExpense = components["schemas"]["StructuredExpense"];

vi.mock("@/client/NotionClient", () => ({
  notionClient: {
    pages: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/mapper/NotionRecordMapper");
vi.mock("@/transformer/NotionDataTransformer");

const mockedNotionClient = vi.mocked(notionClient);
const mockedNotionRecordMapper = vi.mocked(notionRecordMapper);
const mockedNotionExportPreProcessor = vi.mocked(notionExportPreProcessor);

describe("NotionExporter", () => {
  beforeEach(vi.clearAllMocks);

  const mockStructuredExpenses: StructuredExpense[] = [
    {
      expenseTimestamp: "2023-10-27T10:00:00Z",
      title: "Coffee",
      amount: 5,
      category: "Food",
      tags: ["morning"],
      description: "Morning coffee",
      split: {},
    },
    {
      expenseTimestamp: "2023-10-28T12:30:00Z",
      title: "Lunch",
      amount: 25,
      category: "Food",
      tags: ["work"],
      description: "Team lunch",
      split: {},
    },
  ];

  const mockTransformedItems = [
    {
      title: {
        title: [{ text: { content: "Coffee" } }],
      },
    },
    {
      title: {
        title: [{ text: { content: "Lunch" } }],
      },
    },
  ];

  it("should process and export all items to Notion successfully", async () => {
    // 4. Use .mockImplementation and .mockReturnValue just like Jest
    mockedNotionRecordMapper.mockImplementation((item) => ({ ...item }) as any);
    mockedNotionExportPreProcessor.mockReturnValue(mockTransformedItems as any);
    (mockedNotionClient.pages.create as any).mockResolvedValue({
      id: "dummy-page-id",
    } as any);

    notionExporter(mockStructuredExpenses);

    // 5. process.nextTick still works in Node environment with Vitest
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockedNotionRecordMapper).toHaveBeenCalledTimes(2);
    expect(mockedNotionExportPreProcessor).toHaveBeenCalledTimes(1);
    expect(mockedNotionClient.pages.create).toHaveBeenCalledTimes(2);
    expect(mockedNotionClient.pages.create).toHaveBeenCalledWith({
      parent: { database_id: "TEST" },
      properties: mockTransformedItems[0],
    });
  });

  it("should report errors for items that fail to save", async () => {
    mockedNotionRecordMapper.mockImplementation((item) => ({ ...item }) as any);
    mockedNotionExportPreProcessor.mockReturnValue(mockTransformedItems as any);

    const apiError = new Error("Notion API Error");
    (mockedNotionClient.pages.create as any)
      .mockResolvedValueOnce({ id: "dummy-page-id-1" } as any)
      .mockRejectedValueOnce(apiError);

    notionExporter(mockStructuredExpenses);
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockedNotionClient.pages.create).toHaveBeenCalledTimes(2);
  });

  it("should handle the case with no items to export", async () => {
    mockedNotionExportPreProcessor.mockReturnValue([]);

    notionExporter([]);
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockedNotionRecordMapper).not.toHaveBeenCalled();
    expect(mockedNotionExportPreProcessor).toHaveBeenCalledWith([]);
    expect(mockedNotionClient.pages.create).not.toHaveBeenCalled();
  });
});
