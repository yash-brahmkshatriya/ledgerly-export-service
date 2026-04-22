import { CreatePageParameters } from "@notionhq/client";
import { NotionExpenseRecord } from "../model/NotionExpenseRecord";
import { notionExportPreProcessor } from "../transformer/NotionDataTransformer";
import { StructuredExpense } from "../model/SharedSchema";
import { notionRecordMapper } from "../mapper/NotionRecordMapper";
import { notionClient } from "../client/NotionClient";

const DATABASE_ID = "TEST";

export const notionExporter = (items: StructuredExpense[]): void => {
  const itemsAsNotionRecord: NotionExpenseRecord[] = items.map((item) =>
    notionRecordMapper(item),
  );
  const transformedItems = notionExportPreProcessor(itemsAsNotionRecord);

  dumpToNotion(transformedItems).then((result) => {
    console.log(`Success: ${result.success}, Error: ${result.error}`);
  });
};

interface SaveToNotionResult {
  success: number;
  error: number;
}

const dumpToNotion = async (items: object[]): Promise<SaveToNotionResult> => {
  let success = 0,
    error = 0;

  for (const item of items) {
    const done = await save(item as CreatePageParameters["properties"]);
    if (done) success++;
    else error++;
  }

  return {
    success,
    error,
  };
};

const save = async (
  item: CreatePageParameters["properties"],
): Promise<boolean> => {
  try {
    await notionClient.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties: item,
    });
    return true;
  } catch (error) {
    console.error(`Failed to add item with title: ${item?.title}`);
    return false;
  }
};
