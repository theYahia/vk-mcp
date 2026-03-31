import { z } from "zod";
import { vkGet } from "../client.js";

export const getWallSchema = z.object({
  owner_id: z.number().describe("ID владельца стены (пользователь или группа, отрицательный для групп)"),
  count: z.number().int().min(1).max(100).default(20).describe("Количество записей"),
  offset: z.number().int().default(0).describe("Смещение"),
});

export async function handleGetWall(params: z.infer<typeof getWallSchema>): Promise<string> {
  const result = await vkGet("wall.get", {
    owner_id: String(params.owner_id),
    count: String(params.count),
    offset: String(params.offset),
  });
  return JSON.stringify(result, null, 2);
}

export const searchPostsSchema = z.object({
  q: z.string().describe("Поисковый запрос"),
  count: z.number().int().min(1).max(200).default(20).describe("Количество результатов"),
  start_time: z.number().optional().describe("Начало периода (unix timestamp)"),
  end_time: z.number().optional().describe("Конец периода (unix timestamp)"),
});

export async function handleSearchPosts(params: z.infer<typeof searchPostsSchema>): Promise<string> {
  const p: Record<string, string> = {
    q: params.q,
    count: String(params.count),
  };
  if (params.start_time) p.start_time = String(params.start_time);
  if (params.end_time) p.end_time = String(params.end_time);

  const result = await vkGet("newsfeed.search", p);
  return JSON.stringify(result, null, 2);
}
