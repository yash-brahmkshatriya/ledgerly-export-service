import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { notionClient } from "../client/NotionClient";
import { notionRecordMapper } from "../mapper/NotionRecordMapper";
import { notionExportPreProcessor } from "../transformer/NotionDataTransformer";
import { components } from "../../types";
import { notionExporter } from "./NotionExporter";

type StructuredExpense = components["schemas"]["StructuredExpense"];

// Mock dependencies from other modules
jest.mock("../client/NotionClient", () => ({
  notionClient: {
    pages: {
      create: jest.fn(),
    },
  },
}));
jest.mock("../mapper/NotionRecordMapper");
jest.mock("../transformer/NotionDataTransformer");

// Typecast mocks for type safety in tests
const mockedNotionClient = jest.mocked(notionClient);
const mockedNotionRecordMapper = jest.mocked(notionRecordMapper);
const mockedNotionExportPreProcessor = jest.mocked(notionExportPreProcessor);

describe("NotionExporter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  // This is what the pre-processor is expected to return
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
    // Arrange: Mock dependencies to simulate a successful run
    mockedNotionRecordMapper.mockImplementation((item) => ({ ...item }) as any);
    mockedNotionExportPreProcessor.mockReturnValue(mockTransformedItems as any);
    mockedNotionClient.pages.create.mockResolvedValue({
      id: "dummy-page-id",
    } as any);

    // Act: Run the exporter
    notionExporter(mockStructuredExpenses);

    // Allow async operations inside notionExporter to complete
    await new Promise(process.nextTick);

    // Assert
    expect(mockedNotionRecordMapper).toHaveBeenCalledTimes(2);
    expect(mockedNotionExportPreProcessor).toHaveBeenCalledTimes(1);
    expect(mockedNotionClient.pages.create).toHaveBeenCalledTimes(2);
    expect(mockedNotionClient.pages.create).toHaveBeenCalledWith({
      parent: { database_id: "TEST" },
      properties: mockTransformedItems[0],
    });
  });

  it("should report errors for items that fail to save", async () => {
    // Arrange: Mock one success and one failure
    mockedNotionRecordMapper.mockImplementation((item) => ({ ...item }) as any);
    mockedNotionExportPreProcessor.mockReturnValue(mockTransformedItems as any);
    const apiError = new Error("Notion API Error");
    mockedNotionClient.pages.create
      .mockResolvedValueOnce({ id: "dummy-page-id-1" } as any) // First call succeeds
      .mockRejectedValueOnce(apiError); // Second call fails

    // Act
    notionExporter(mockStructuredExpenses);
    await new Promise(process.nextTick);

    // Assert
    expect(mockedNotionClient.pages.create).toHaveBeenCalledTimes(2);
  });

  it("should handle the case with no items to export", async () => {
    // Arrange: Mock the pre-processor to return an empty array
    mockedNotionExportPreProcessor.mockReturnValue([]);

    notionExporter([]);
    await new Promise(process.nextTick);

    expect(mockedNotionRecordMapper).not.toHaveBeenCalled();
    expect(mockedNotionExportPreProcessor).toHaveBeenCalledWith([]);
    expect(mockedNotionClient.pages.create).not.toHaveBeenCalled();
  });
});
