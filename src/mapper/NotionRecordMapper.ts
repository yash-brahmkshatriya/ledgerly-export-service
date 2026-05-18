import { StructuredExpense } from "#/model/SharedSchema.js";
import { NotionRecordMapper } from "./RecordMapper.js";
import { NotionExpenseRecord } from "#/model/NotionExpenseRecord.js";

export const notionRecordMapper: NotionRecordMapper = (
  record: StructuredExpense,
) => {
  const notionRecord: NotionExpenseRecord = {
    Name: record.title,
    Amount: record.amount,
    Type: record.category,
    Date: new Date(record.expenseTimestamp),
    Notes: record.description,
    "Created at": new Date(),
  };
  return notionRecord;
};
