import { Client } from "@notionhq/client";

const CLIENT_TOKEN = process.env.NOTION_CLIENT_TOKEN;

// Initialize the Notion client
export const notionClient = new Client({
  auth: CLIENT_TOKEN,
});
