import {
  DEFAULT_NOTION_SCHEMA,
  NotionSchemaMap,
  NotionTargetFieldTypes,
} from "#/constants/NotionSchemaMap.js";
import { NotionExpenseRecord } from "#/model/NotionExpenseRecord.js";

type NotionSchemaPredictor = (
  record: NotionExpenseRecord,
) => Record<string, NotionTargetFieldTypes>;

type NotionDate = { start: string; end?: string; time_zone?: string };

export const notionExportPreProcessor: (
  items: NotionExpenseRecord[],
) => object[] = (items) => {
  console.log("Notion export pre-processing started");
  if (items.length === 0) return [];
  const notionSchemaPrediction = hardcodedNotionSchemaPredictor(items[0]);
  return items.map((item) => {
    return Object.keys(item).reduce((acc, key) => {
      const targetField = notionSchemaPrediction[key];
      const convertCb = ConvertToNotionTargetField[targetField];
      const notionValue = convertCb(item[key as keyof NotionExpenseRecord]);
      return {
        ...acc,
        [key]: notionValue,
      };
    }, {});
  });
};

const hardcodedNotionSchemaPredictor: NotionSchemaPredictor = (
  record: NotionExpenseRecord,
) => {
  return Object.keys(record).reduce((acc, key) => {
    const notionSchema = NotionSchemaMap[key] ?? DEFAULT_NOTION_SCHEMA;
    return {
      ...acc,
      [key]: notionSchema,
    };
  }, {});
};

interface NotionConverter {
  title: (val: any) => { title: Array<{ text: { content: string } }> };
  rich_text: (val: any) => {
    rich_text: Array<{ text: { content: string } }>;
  };
  number: (val: any) => { number: number };
  select: (val: any) => { select: { name: string } };
  multi_select: (val: any) => { multi_select: Array<{ name: string }> };
  date: (val: any) => { date: NotionDate };
  url: (val: any) => { url: string };
  email: (val: any) => { email: string };
  checkbox: (val: any) => { checkbox: boolean };
}

const ConvertToNotionTargetField: NotionConverter = {
  title: (val) => ({
    title: [{ text: { content: val || "" } }],
  }),

  rich_text: (val) => ({
    rich_text: [{ text: { content: val || "" } }],
  }),

  number: (val) => ({
    number: val,
  }),

  select: (val) => ({
    select: { name: val },
  }),

  multi_select: (val) => ({
    multi_select: val.map((name: unknown) => ({ name })),
  }),

  date: (val) => {
    const dateStr =
      val instanceof Date ? val.toISOString() : new Date(val).toISOString();
    return { date: { start: dateStr } };
  },

  url: (val) => ({
    url: val,
  }),

  email: (val) => ({
    email: val,
  }),

  checkbox: (val) => ({
    checkbox: val ? true : false,
  }),
};
