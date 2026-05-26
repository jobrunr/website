---
meta_title: "JobRunr MCP Server | Live JobRunr docs in Claude, Cursor, Copilot"
title: "Use JobRunr from inside your AI assistant"
description: "The JobRunr MCP server gives Claude Code, Cursor, VS Code, Windsurf, and any Model Context Protocol client live access to JobRunr documentation. Add one URL and your assistant stops making things up."
date: 2026-05-18
---

Your AI assistant has opinions about JobRunr. Some of them are wrong: invented method signatures, configuration properties spelled three different ways, Pro features described as if they were OSS. You've probably worked around it more than once.

The JobRunr MCP server fixes that. It serves the full `jobrunr.io` documentation as a hybrid search index (BM25 plus ONNX MiniLM embeddings) over the [Model Context Protocol](https://modelcontextprotocol.io). Point your editor at one URL and the assistant searches the actual docs instead of guessing.

**Endpoint:** `https://mcp.jobrunr.io/sse`

## Wire it up

{{< codetabs category="ide" label="IDE" >}}
{{< codetab label="Claude Code" type="claude-code" >}}
```bash
claude mcp add --transport sse jobrunr-docs https://mcp.jobrunr.io/sse
```

Restart Claude Code, then `/mcp` to confirm. Ask it anything about JobRunr and `search_jobrunr_docs` fires on its own.
{{< /codetab >}}
{{< codetab label="Cursor" type="cursor" >}}
Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jobrunr-docs": {
      "url": "https://mcp.jobrunr.io/sse"
    }
  }
}
```

Restart Cursor. The four JobRunr tools appear under Settings → MCP.
{{< /codetab >}}
{{< codetab label="VS Code / Windsurf" type="vscode" >}}
Same SSE URL, whichever MCP config UI your client exposes:

```
https://mcp.jobrunr.io/sse
```

A one-line `url` entry is usually enough. Restart after saving.
{{< /codetab >}}
{{< codetab label="Other / debugging" type="other" >}}
For any other MCP client, or to inspect the JSON-RPC traffic:

```bash
npx @modelcontextprotocol/inspector
```

Transport **SSE**, URL **`https://mcp.jobrunr.io/sse`**, click Connect. You'll see the four tools, their schemas, and can call them by hand.
{{< /codetab >}}
{{< /codetabs >}}

## What your assistant can do

| Tool | What it does |
|---|---|
| `search_jobrunr_docs` | Hybrid BM25 + semantic search. Returns ranked pages with title, URL, section, tier (`oss` or `pro`), and a highlighted snippet. |
| `fetch_jobrunr_doc` | Full markdown for one page. Useful when the assistant needs to quote something verbatim. |
| `list_jobrunr_doc_sections` | Grouped TOC for browsing before searching. |
| `request_jobrunr_pro_trial` | If a Pro feature comes up, your agent can request a free trial for you. It asks for your work email and company first. Nothing fires until you say go. |

The server doesn't generate answers. It surfaces relevant pages and lets your assistant synthesize.

## Updates and health

The index rebuilds on every `jobrunr.io` deploy and stays in sync within minutes. Nothing for you to update.

If you ever want a liveness check:

```bash
curl https://mcp.jobrunr.io/actuator/health
# {"status":"UP",...}
```

## No MCP client?

Drop [`/llms.txt`](/llms.txt) into any LLM context. Same docs, curated as a link index.

## Source

The server is open source: [github.com/iNicholasBE/jobrunr-docs-mcp](https://github.com/iNicholasBE/jobrunr-docs-mcp). Issues and PRs welcome.
