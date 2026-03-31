#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getWallSchema, handleGetWall, searchPostsSchema, handleSearchPosts } from "./tools/wall.js";
import { getUserSchema, handleGetUser, getGroupsSchema, handleGetGroups } from "./tools/users.js";

const server = new McpServer({
  name: "vk-mcp",
  version: "1.0.0",
});

server.tool(
  "get_wall",
  "Получить записи со стены пользователя или сообщества ВКонтакте.",
  getWallSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetWall(params) }] }),
);

server.tool(
  "search_posts",
  "Поиск постов в новостной ленте ВКонтакте по ключевым словам.",
  searchPostsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleSearchPosts(params) }] }),
);

server.tool(
  "get_user",
  "Информация о пользователях ВКонтакте по ID или screen_name.",
  getUserSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetUser(params) }] }),
);

server.tool(
  "get_groups",
  "Информация о сообществах ВКонтакте по ID или короткому имени.",
  getGroupsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetGroups(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[vk-mcp] Сервер запущен. 4 инструмента. Требуется VK_ACCESS_TOKEN.");
}

main().catch((error) => {
  console.error("[vk-mcp] Ошибка:", error);
  process.exit(1);
});
