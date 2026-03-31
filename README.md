# @theyahia/vk-mcp

MCP-сервер для VK API — записи со стены, поиск постов, пользователи, группы. **4 инструмента.**

[![npm](https://img.shields.io/npm/v/@theyahia/vk-mcp)](https://www.npmjs.com/package/@theyahia/vk-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "vk": {
      "command": "npx",
      "args": ["-y", "@theyahia/vk-mcp"],
      "env": { "VK_ACCESS_TOKEN": "your-token" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add vk -e VK_ACCESS_TOKEN=your-token -- npx -y @theyahia/vk-mcp
```

### VS Code / Cursor

```json
{ "servers": { "vk": { "command": "npx", "args": ["-y", "@theyahia/vk-mcp"], "env": { "VK_ACCESS_TOKEN": "your-token" } } } }
```

> Требуется `VK_ACCESS_TOKEN`. Получите на [vk.com/dev](https://vk.com/dev).

## Инструменты (4)

| Инструмент | Описание |
|------------|----------|
| `get_wall` | Записи со стены пользователя или сообщества |
| `search_posts` | Поиск постов по ключевым словам |
| `get_user` | Информация о пользователях |
| `get_groups` | Информация о сообществах |

## Примеры

```
Покажи последние посты со стены Дурова
Найди посты про AI в VK
Информация о группе team
```

## Часть серии Russian API MCP

**50 серверов:** [github.com/theYahia/russian-mcp](https://github.com/theYahia/russian-mcp)

## Лицензия

MIT
