export type NotionTargetFieldTypes =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "url"
  | "email"
  | "checkbox";

export const DEFAULT_NOTION_SCHEMA: NotionTargetFieldTypes = "rich_text";
export const NotionSchemaMap: Record<string, NotionTargetFieldTypes> = {
  Name: "title",
  Amount: "number",
  Type: "select",
  Date: "date",
  Notes: "rich_text",
  "Created at": "date",
};
