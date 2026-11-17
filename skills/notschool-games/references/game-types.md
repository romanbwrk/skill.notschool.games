# NotSchool game JSON reference (schema 1.0.0)

Full, valid examples for every type are in [../examples/](../examples/). For the live schema, run `node scripts/notschool.mjs types`.

## Envelope (all types)

```json
{
  "schema_version": "1.0.0",
  "type": "quiz",
  "metadata": { ... },
  "settings": { ... },
  "content": { ... },
  "presentation": { ... }
}
```

Only `type`, `metadata.title` and `content` are required. Everything else has a default, shown in brackets below.

### metadata

| Field | Rules |
|---|---|
| `title` | 1–120 chars |
| `description` | ≤500 chars [""]. Always add one, because it helps search. |
| `language` | ISO 639-1, e.g. `en`, `ro` [en] |
| `subject` | slug: `math`, `geography`, `english`, `romanian`, `science`, `history`, `biology`, … [general] |
| `age_min`, `age_max` | 3–99, min ≤ max [6, 14] |
| `difficulty` | `easy` \| `medium` \| `hard` [medium] |
| `duration_minutes` | 1–180 [10] |
| `tags` | ≤20 short words, lowercased [] |
| `categories` | ≤10 slugs (`a-z0-9-`) [] |

Do not include `image_prompt` or `thumbnail_url`.

### settings (common)

| Field | Rules |
|---|---|
| `game_mode` | `solo` \| `team_battle` [team_battle] |
| `answer_mode` | `head_to_head` \| `turn_based` \| `buzzer` [head_to_head]. `memory` and `matching` support only head_to_head and turn_based. |
| `time_per_question` | seconds, 0 = no timer [20; word_guess 60; memory and matching 0] |
| `points_correct` | 0–10000 [100] |
| `speed_bonus`, `streak_bonus` | boolean [false] |

### presentation

| Field | Rules |
|---|---|
| `theme` | `colorful` \| `classic` \| `high_contrast` \| `neon` \| `chalkboard` [colorful] |
| `sound_enabled` | boolean [true] |
| `show_explanations` | boolean [true] |

### Item ids

Items may have an `id` (`[A-Za-z0-9_-]{1,40}`, unique). Omit it and ids are assigned automatically. Any item can also have `points` (0–10000), which overrides `points_correct`.

## quiz

`content.questions` (1–100, recommended 5–15):

| Field | Rules |
|---|---|
| `question` | 1–300 chars |
| `options` | 2–6 strings, each 1–120 chars, unique |
| `correct_index` | 0-based index into `options` |
| `explanation` | optional, ≤500 |

## true_false

`content.statements` (1–100, recommended 8–20):

| Field | Rules |
|---|---|
| `statement` | 1–300 chars, a single clear claim |
| `answer` | `true` \| `false` |
| `explanation` | optional, ≤500 |

## word_guess

`content.words` (1–50, recommended 5–12):

| Field | Rules |
|---|---|
| `clue` | 1–300 chars, must not contain the answer |
| `answer` | ≤40 chars: letters (any script, with diacritics) plus inner spaces, `-` or `'` |
| `hint` | optional, ≤200 |
| `explanation` | optional, ≤500 |

Extra settings: `max_wrong_guesses` 1–15 [6], `strict_diacritics` [false]. When false, guessing "a" also reveals "ă" and "â".

## memory

`content.pairs` (2–24, recommended 6–12). Each pair has two faces, `a` and `b`:

```json
{ "a": { "text": "France" }, "b": { "text": "Paris" } }
```

Face `text` is 1–60 chars. Every face across the whole board must be unique.

## matching

`content.pairs` (2–20, recommended 5–10):

| Field | Rules |
|---|---|
| `term` | 1–80 chars, unique |
| `definition` | 1–200 chars, unique, must not repeat the term |

Also: `content.scoring` is `per_pair` \| `all_or_nothing` [per_pair], and `content.points_per_pair` is optional.

## math_battle

`content.questions` (1–100, recommended 8–20):

| Field | Rules |
|---|---|
| `question` | 1–200 chars, e.g. `"25 × 8 = ?"` or a short word problem |
| `correct_answer` | a single number (`"2,5"` is accepted and coerced) |
| `tolerance` | optional, ≥0, for decimal answers, e.g. `0.01` |
| `explanation` | optional, ≤500 |

Extra settings: `calculator` `basic`, `lock_after_submit` [true].
