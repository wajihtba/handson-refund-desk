# Spec: <what the coding agent will build>

Copy this file to `docs/specs/<name>.md` (for RD-204: `docs/specs/retries.md`, for RD-702: `docs/specs/status-page.md`)
and write it before your coding agent writes any code. Commit it on its
own, then give the agent this file, not a one-line prompt. Write it so a
teammate who has never seen the project could build from it without
asking you a question.

## Goal

Who uses the result and what they do with it, in two or three sentences.

## Inputs

The data the code reads, with the types and files it comes from.

## Output

What the code returns or shows, precisely enough to test.

## Constraints

Files it may change, functions it must keep, libraries it may not add.

## Examples

One or two inputs with the output you expect.

## Must never happen

The failures you will check for yourself, each with how you'll check it.
