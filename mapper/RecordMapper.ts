import { StructuredExpense } from "../model/SharedSchema";
import { NotionExpenseRecord } from "../model/NotionExpenseRecord";

export type RecordMapper<T, K> = (U: StructuredExpense) => K;
export type NotionRecordMapper = RecordMapper<
  StructuredExpense,
  NotionExpenseRecord
>;
