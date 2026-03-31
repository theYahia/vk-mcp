# VK API MCP Server

MCP-сервер для VK API (api.vk.com/method/, access_token, v=5.199).

## Архитектура
- src/client.ts - HTTP-клиент с retry и таймаутами
- src/types.ts - TypeScript-интерфейсы
- src/tools/wall.ts - get_wall, search_posts
- src/tools/users.ts - get_user, get_groups
- src/index.ts - точка входа MCP-сервера

## Переменные окружения
- VK_ACCESS_TOKEN - токен доступа VK API (обязательно)

## Сборка
npm run build && npm run dev
