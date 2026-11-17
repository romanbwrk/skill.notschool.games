#!/usr/bin/env node
// NotSchool CLI: validate game JSON and turn it into a playable link on https://notschool.games
// Zero dependencies, Node.js 18+. Talks to the public NotSchool MCP server over plain JSON-RPC.
//
//   node notschool.mjs validate <game.json|->      Check a game against the official schema
//   node notschool.mjs draft    <game.json|->      Validate, then create a playable draft (no account needed)
//   node notschool.mjs search   <query> [--type quiz] [--language en] [--limit 10]
//   node notschool.mjs types    [en|ro]            Print the live game-type guidance
//
// Env: NOTSCHOOL_URL (default https://notschool.games)

import { readFileSync } from "node:fs"

const BASE = (process.env.NOTSCHOOL_URL || "https://notschool.games").replace(/\/+$/, "")
const ENDPOINT = `${BASE}/mcp`

async function call(name, args) {
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
    })
  } catch (error) {
    fail(`Could not reach ${ENDPOINT}: ${error.message}`)
  }
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    fail(`Unexpected response (HTTP ${res.status}): ${text.slice(0, 300)}`)
  }
  if (body.error) fail(`Server error: ${body.error.message ?? JSON.stringify(body.error)}`)
  return body.result
}

function fail(message, code = 2) {
  console.error(message)
  process.exit(code)
}

function readGame(file) {
  if (!file) fail("Missing file argument (path to a .json game, or - for stdin).")
  const raw = file === "-" ? readFileSync(0, "utf8") : readFileSync(file, "utf8")
  try {
    return JSON.parse(raw)
  } catch (error) {
    fail(`Not valid JSON: ${error.message}`)
  }
}

function flags(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[++i]
    else out._.push(argv[i])
  }
  return out
}

function printIssues(label, issues) {
  if (!issues?.length) return
  console.log(`${label}:`)
  for (const i of issues) console.log(`  - ${i.path || "(root)"}: ${i.message} [${i.code}]`)
}

async function validate(definition) {
  const result = await call("validate_game", { definition })
  const data = result.structuredContent ?? {}
  console.log(result.content?.[0]?.text ?? (data.valid ? "Valid." : "Invalid."))
  printIssues("Errors (must fix)", data.errors)
  printIssues("Suggestions", data.warnings)
  return data.valid === true
}

const [command, ...rest] = process.argv.slice(2)
const opts = flags(rest)

switch (command) {
  case "validate": {
    const ok = await validate(readGame(opts._[0]))
    process.exit(ok ? 0 : 1)
  }
  case "draft": {
    const definition = readGame(opts._[0])
    if (!(await validate(definition))) process.exit(1)
    const result = await call("create_game_draft", { definition })
    const data = result.structuredContent ?? {}
    if (result.isError || !data.preview_url) fail(result.content?.[0]?.text ?? "Could not create the draft.", 1)
    console.log(`\nPlay it: ${data.preview_url}`)
    if (data.expires_at) console.log(`Guest draft, expires ${data.expires_at}. Sign in on ${BASE} and save it to keep it.`)
    break
  }
  case "search": {
    const args = { query: opts._.join(" ") || undefined, type: opts.type, language: opts.language, limit: opts.limit ? Number(opts.limit) : undefined }
    const result = await call("search_games", args)
    const games = result.structuredContent?.games ?? result.structuredContent?.results ?? []
    if (!games.length) console.log(result.content?.[0]?.text ?? "No games found.")
    for (const g of games) console.log(`- ${g.title} (${g.type}, ${g.language ?? "?"}) ${g.url ?? g.play_url ?? ""}`)
    break
  }
  case "types": {
    const result = await call("get_game_types", { language: opts._[0] === "ro" ? "ro" : "en" })
    const data = result.structuredContent ?? {}
    console.log(data.common_guidance ?? "")
    for (const t of data.types ?? []) console.log(`\n## ${t.type} (${t.name})\n${t.description}\n${t.guidance}`)
    break
  }
  default:
    console.log(`Usage:
  node notschool.mjs validate <game.json|->
  node notschool.mjs draft    <game.json|->
  node notschool.mjs search   <query> [--type quiz] [--language en] [--limit 10]
  node notschool.mjs types    [en|ro]`)
    process.exit(command ? 2 : 0)
}
