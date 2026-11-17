# NotSchool Games: an agent skill for classroom games

**Ask your AI assistant for a classroom game and get a link you can play on the projector in a minute.**

This repository contains an [agent skill](https://agentskills.io) that teaches Claude Code, Codex, Cursor, Gemini CLI and other coding agents to create games for [**notschool.games**](https://notschool.games), a free platform for teachers. Students play solo or as a two-team battle on a projector or smartboard.

> "Make a 10-question quiz on the water cycle for 4th graders"
> "Creează un joc Adevărat/Fals despre sistemul solar pentru clasa a 3-a"
> "Memory game: Spanish food words ↔ English, age 10"

Your agent writes the game JSON, checks it against the official NotSchool schema, and gives you a link to play it:

```text
Valid quiz game "The Water Cycle".
Play it: https://notschool.games/en/preview/…
```

## Game types

| Type | What students do |
|---|---|
| **Quiz** | Multiple choice, 2–6 options |
| **True or false** | Quick fact checks with instant feedback |
| **Word guess** | Guess the word letter by letter from a clue |
| **Memory** | Flip cards to find matching pairs |
| **Matching** | Pair each term with its definition |
| **Math battle** | Teams race to solve problems on a calculator |

Every game supports team battles (head-to-head, turn-based or buzzer), timers, speed and streak bonuses, and five visual themes. It works in any language, with full Romanian support.

## Install

**Any agent ([skills CLI](https://github.com/vercel-labs/skills)):**

```sh
npx skills add moldwebs/notschool-skills
```

**Claude Code plugin:**

```text
/plugin marketplace add moldwebs/notschool-skills
/plugin install notschool-games@notschool
```

**Manual:** copy [`skills/notschool-games`](skills/notschool-games) into `~/.claude/skills/` (or your agent's skills folder).

You need Node.js 18 or later for the validation script. It has no dependencies and needs no API key or account.

## Use the CLI without an agent

```sh
cd skills/notschool-games
node scripts/notschool.mjs validate examples/quiz.json   # check against the schema
node scripts/notschool.mjs draft examples/quiz.json      # get a playable link
node scripts/notschool.mjs search "fractions"            # find existing public games
node scripts/notschool.mjs types                         # live schema guidance
```

The script calls the public NotSchool MCP server at `https://notschool.games/mcp`. Draft links work right away. Guest drafts expire after 7 days unless you sign in on notschool.games and save them to your library, where you can also edit, publish and share them.

## Prefer MCP?

NotSchool is also a remote MCP server. Connect it directly and your assistant gets the same tools natively:

```sh
claude mcp add --transport http notschool https://notschool.games/mcp
```

Setup for ChatGPT, Claude.ai, Cursor, VS Code and other clients is at [notschool.games/llms.txt](https://notschool.games/llms.txt).

## What's inside

```text
skills/notschool-games/
├── SKILL.md                  # instructions the agent follows
├── references/game-types.md  # every field, limit and default
├── examples/*.json           # one valid game per type
└── scripts/notschool.mjs     # validate / draft / search / types
```

## License

MIT. Games you create are yours.

---

**[notschool.games](https://notschool.games): make learning playable.**
