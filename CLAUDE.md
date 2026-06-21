# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->

## Build & Test

```bash
pnpm install      # install dependencies
pnpm dev          # dev server (opens browser)
pnpm build        # typecheck + production build (PWA)
pnpm test run     # unit tests once (Vitest)
pnpm test:pw      # end-to-end tests (Playwright)
pnpm test:all     # typecheck + unit + e2e
pnpm format       # format with Prettier
```

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
