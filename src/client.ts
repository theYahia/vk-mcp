const BASE_URL = "https://api.vk.com/method";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;
const API_VERSION = "5.199";

export async function vkCall(
  method: string,
  params: Record<string, string> = {},
  httpMethod: "GET" | "POST" = "GET",
): Promise<unknown> {
  const token = process.env.VK_ACCESS_TOKEN;
  if (!token) throw new Error("VK_ACCESS_TOKEN не задан");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const allParams = { ...params, access_token: token, v: API_VERSION };

    try {
      let response: Response;
      if (httpMethod === "POST") {
        response = await fetch(`${BASE_URL}/${method}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(allParams).toString(),
          signal: controller.signal,
        });
      } else {
        const query = new URLSearchParams(allParams);
        response = await fetch(`${BASE_URL}/${method}?${query.toString()}`, {
          signal: controller.signal,
        });
      }
      clearTimeout(timer);

      if (response.ok) {
        const data = (await response.json()) as {
          response?: unknown;
          error?: { error_msg: string; error_code: number };
        };
        if (data.error)
          throw new Error(
            `VK API ошибка ${data.error.error_code}: ${data.error.error_msg}`,
          );
        return data.response;
      }

      if (
        (response.status === 429 || response.status >= 500) &&
        attempt < MAX_RETRIES
      ) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(
          `[vk-mcp] ${response.status}, повтор через ${delay}мс (${attempt}/${MAX_RETRIES})`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new Error(`VK HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (
        error instanceof DOMException &&
        error.name === "AbortError" &&
        attempt < MAX_RETRIES
      ) {
        console.error(
          `[vk-mcp] Таймаут, повтор (${attempt}/${MAX_RETRIES})`,
        );
        continue;
      }
      throw error;
    }
  }
  throw new Error("VK API: все попытки исчерпаны");
}

/** Backward-compatible GET alias */
export const vkGet = (
  method: string,
  params?: Record<string, string>,
): Promise<unknown> => vkCall(method, params, "GET");

/** POST alias for write operations */
export const vkPost = (
  method: string,
  params?: Record<string, string>,
): Promise<unknown> => vkCall(method, params, "POST");
