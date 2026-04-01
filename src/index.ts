#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { z } from "zod";

import { getWallSchema, handleGetWall, postWallSchema, handlePostWall, searchPostsSchema, handleSearchPosts } from "./tools/wall.js";
import { getUserSchema, handleGetUser, getGroupsSchema, handleGetGroups } from "./tools/users.js";
import { getFriendsSchema, handleGetFriends } from "./tools/friends.js";
import { sendMessageSchema, handleSendMessage } from "./tools/messages.js";
import { getStatsSchema, handleGetStats } from "./tools/stats.js";

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "vk-mcp",
    version: "1.1.0",
  });

  // ── Tools (8) ──────────────────────────────────────────────

  server.tool(
    "get_wall",
    "Получить записи со стены пользователя или сообщества ВКонтакте.",
    getWallSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetWall(params) }] }),
  );

  server.tool(
    "post_wall",
    "Опубликовать запись на стене пользователя или сообщества ВКонтакте.",
    postWallSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handlePostWall(params) }] }),
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

  server.tool(
    "get_friends",
    "Список друзей пользователя ВКонтакте.",
    getFriendsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetFriends(params) }] }),
  );

  server.tool(
    "send_message",
    "Отправить сообщение пользователю или в беседу ВКонтакте.",
    sendMessageSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSendMessage(params) }] }),
  );

  server.tool(
    "get_stats",
    "Статистика сообщества ВКонтакте за указанный период.",
    getStatsSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetStats(params) }] }),
  );

  // ── Prompts / Skills (2) ───────────────────────────────────

  server.prompt(
    "post-wall",
    "Опубликуй пост в группу VK",
    {
      group_id: z.string().describe("ID группы (без минуса)"),
      text: z.string().describe("Текст поста"),
    },
    async ({ group_id, text }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Опубликуй пост в группу VK (owner_id: -${group_id}) со следующим текстом:\n\n${text}\n\nИспользуй инструмент post_wall. Параметр from_group=1, чтобы пост был от имени группы.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "group-stats",
    "Статистика группы VK",
    {
      group_id: z.string().describe("ID группы"),
      days: z.string().optional().describe("За сколько дней (по умолчанию 7)"),
    },
    async ({ group_id, days }) => {
      const d = Number(days) || 7;
      const to = new Date();
      const from = new Date(to.getTime() - d * 86400000);
      const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Покажи статистику группы VK (group_id: ${group_id}) за период ${fmt(from)} — ${fmt(to)}.\n\nИспользуй инструмент get_stats. Представь данные в виде таблицы: дата, просмотры, посетители, подписки.`,
            },
          },
        ],
      };
    },
  );

  return server;
}

async function main() {
  const mode = process.argv.includes("--http") ? "http" : "stdio";

  if (mode === "http") {
    const port = Number(process.env.PORT) || 3000;

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    const server = createMcpServer();
    await server.connect(transport);

    const httpServer = createServer(async (req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: 8, version: "1.1.0" }));
        return;
      }

      await transport.handleRequest(req, res);
    });

    httpServer.listen(port, () => {
      console.error(`[vk-mcp] HTTP-сервер запущен на порту ${port}. 8 инструментов.`);
    });
  } else {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[vk-mcp] Сервер запущен (stdio). 8 инструментов. Требуется VK_ACCESS_TOKEN.");
  }
}

export { createMcpServer };

main().catch((error) => {
  console.error("[vk-mcp] Ошибка:", error);
  process.exit(1);
});
