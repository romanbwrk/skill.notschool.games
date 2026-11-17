---
name: notschool-games
description: Create playable classroom games (quiz, true/false, word guess, memory, matching, math battle) as NotSchool JSON and turn them into a shareable play link on notschool.games. Use when the user asks for a classroom game, quiz, trivia, flashcards, vocabulary or spelling game, true/false check, memory or matching game, math competition, or team battle for students, or mentions NotSchool / notschool.games, or wants game JSON validated or published.
---

# NotSchool game creator

[NotSchool](https://notschool.games) turns any classroom topic into a game the teacher can put on a projector and play solo or as a two-team battle. Every game is one JSON document. This skill writes that JSON, checks it against the official schema, and turns it into a playable link. No account is needed.

## Workflow

1. **Clarify only what's missing.** You need the topic, the students' age or grade, and the language. Infer the rest. Romanian (`ro`) and English (`en`) are first-class; other ISO 639-1 codes are accepted.
2. **Pick the type** (or use the one the user named):

   | Type | Best for | Items |
   |---|---|---|
   | `quiz` | knowledge checks, one clearly correct option | 5–15 questions |
   | `true_false` | fast fact checks, misconceptions | 8–20 statements |
   | `word_guess` | vocabulary, spelling (hangman-style) | 5–12 words |
   | `memory` | associations: word ↔ translation, country ↔ capital | 6–12 pairs |
   | `matching` | terms ↔ definitions | 5–10 pairs |
   | `math_battle` | arithmetic with single-number answers | 8–20 questions |

3. **Write the JSON.** Start from the matching file in [examples/](examples/) and follow [references/game-types.md](references/game-types.md) for the exact fields and limits. Save it as `<slug>.json` in the working directory unless the user wants it elsewhere.
4. **Validate** with the bundled script (Node 18+, no install). Run it from this skill's directory:
   ```sh
   node scripts/notschool.mjs validate path/to/game.json
   ```
   Exit code 0 means valid. On errors, fix each one at the JSON path it reports, then validate again. Also act on the suggestions it prints (for example a missing description or too few items).
5. **Get a play link** if the user wants to play, share or preview the game:
   ```sh
   node scripts/notschool.mjs draft path/to/game.json
   ```
   This prints a private preview URL. Guest drafts expire after 7 days unless the teacher signs in on notschool.games and saves them. Do not publish games publicly on the user's behalf; that happens on the site.
6. **Reply** with the file path, the play link, and a one-line summary (type, number of items, age, language). Offer to adjust it: harder, easier, more items, another language, or another game type on the same topic.

If the script can't reach the network, still deliver a carefully self-checked JSON file. The teacher can sign in for free and paste it at https://notschool.games/en/teacher/library/import, which validates it and shows a preview.

Other commands: `node scripts/notschool.mjs search "fractions" --language en` finds existing public games (suggest one if it already fits), and `node scripts/notschool.mjs types` prints the live schema guidance if anything here looks out of date.

## Content rules (the validator rejects or flags these)

- **Plain text only.** No HTML, Markdown, URLs, `{{ }}`, `${ }` or HTML entities in any text field.
- **No images.** Leave out `image_prompt`, `thumbnail_url` and every `image_url` field (images are currently disabled).
- **Unique values.** Options within a question, memory card faces, and matching terms and definitions must all be unique. Case and diacritics are ignored when checking.
- **Language.** Write everything in the game's `metadata.language`. Romanian needs correct diacritics: ă, â, î, ș, ț (comma below, not ş/ţ).
- **Accuracy and fit.** Content must be factually correct and age-appropriate, with one unambiguous right answer. Avoid trick wording, double negatives and "all of the above".
- **Quiz:** spread `correct_index` across positions. Don't always put the answer first.
- **True/false:** mix true and false roughly evenly.
- **Word guess:** the clue must never contain the answer, and the answer is letters only (spaces, hyphens and apostrophes allowed), up to 40 characters.
- **Math battle:** `correct_answer` is a single number. No units, fractions or expressions; use `tolerance` for decimals.
- **Explanations:** add a short `explanation` (1–2 sentences) where it teaches something. It's shown after answering.
