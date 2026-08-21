## Architecture Overview

A frontend-only PWA for practicing the **CCSE** exam (Conocimientos
Constitucionales y Socioculturales de España) — the fixed published pool of
true/false and multiple-choice questions on Spanish constitution, government,
geography, history, and culture — with SM-2 spaced repetition.

- **Question bank** lives in `src/data/questions.json` (a flat JSON array) and is
  normalized at load time by `parseQuestions` into the `Question` type. The import
  format is designed for **bulk seeding** — see `src/data/README.md`. Both
  `true-false` and `multiple-choice` types are supported; internally every question
  has `options` + `answerIndex`. Section keys are free-form strings labelled via
  `SECTION_LABELS` (`src/constants.ts`), with a title-cased fallback.
- **Scheduling** uses the SM-2 algorithm in `src/lib/scheduleCard.ts`. Each
  question's `ReviewState` (`repetitions`, `easeFactor`, `interval`, `due`) is
  persisted to `localStorage` (`loadStates.ts` / `saveStates.ts`), keyed by question
  id, so history survives edits to the bank. **Never reuse/renumber ids.**
- **`useDeck`** (`src/hooks/useDeck.ts`) loads state, computes due questions
  (`getDueQuestions.ts`), and records grades.
- **Review flow**: `ReviewSession` works through a snapshot of due questions;
  `QuestionCard` tests recall (pick an option → it locks and marks correct/wrong +
  explanation); `GradeControls` then lapses a wrong answer ("again", requeued this
  session) or offers Hard/Good/Easy on a correct one, each previewing its interval.

## Conventions & Patterns

Follows the global conventions in `~/.claude/CLAUDE.md`: one component/function per
file, `Props` type at the end of component files, shared types in `types.ts`, shared
constants in `constants.ts`, block comments on every function, Tabler icons,
sentence-cased UI text, tests under `tests/` subdirectories.
