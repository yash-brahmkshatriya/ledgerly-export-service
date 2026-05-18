import { StructuredExpense } from "#/model/SharedSchema.js";
import { NotionExpenseRecord } from "#/model/NotionExpenseRecord.js";

export type RecordMapper<T, K> = (U: StructuredExpense) => K;
export type NotionRecordMapper = RecordMapper<
  StructuredExpense,
  NotionExpenseRecord
>;
