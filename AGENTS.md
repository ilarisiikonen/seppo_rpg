# Agent guidelines

These guidelines apply throughout this repository.

## Git and publication

- **Do not push code or tags.** Do not run `git push`, force-push, or publish
  changes through another tool or API. Leave pushing to the user.
- Do not trigger deployments, releases, or deployment workflows.
- Do not create commits unless the user explicitly requests them.
- Check the worktree before editing. Preserve existing staged, unstaged and
  untracked work; do not assume it belongs to the current task.
- Do not discard changes, rewrite history, or amend commits without an explicit
  request. If existing changes conflict with the task, ask before proceeding.
- Finish with a concise summary of changes, validation results and any unresolved
  limitations. Leave changes available locally for the user to review.

## Understand the current implementation

- Read the [technical documentation](TECHNICAL_DOCUMENTATION.md) and the relevant
  [gameplay guide](docs/README.md) before changing a subsystem.
- The maintained application is [seppo-react](seppo-react/). The root
  [index.html](index.html) is an older standalone implementation; do not edit it
  for a React feature unless specifically requested.
- Use runtime code as the source of truth. Descriptions, comments and the
  [historical mind map](GAME_MIND_MAP.txt) can disagree with execution.
- Check definitions, action handlers and their UI consumers together. A declared
  trait, relic or buff does not prove its effect is implemented.
- Keep area index, player XP level, route round and combat turn distinct.

## Make focused changes

- Implement the requested behavior without unrelated refactoring or balance changes.
- Reuse existing helpers, components, types and visual conventions.
- Preserve stable item/relic IDs used in saves and unlock checks.
- Keep TypeScript types accurate; avoid adding permissive casts to hide errors.
- Surface failures through appropriate feedback or logging. Do not introduce
  silent failure paths or pretend a failed operation succeeded.
- When fixing a documented discrepancy, update the implementation, relevant UI
  descriptions and documentation together. Do not silently fix unrelated
  discrepancies discovered during another task.

### Repository-specific considerations

- Game state is a mutable ref in
  [useGameState.ts](seppo-react/src/useGameState.ts). Mutations need an appropriate
  render trigger; asynchronous handlers should use current state.
- Multi-enemy changes must keep the enemy array, selected index, active enemy,
  per-enemy animations and displayed intentions consistent.
- Local run checkpoints and Firebase profile data are separate systems. Consider
  existing saved data before changing either shape.
- Tailwind `sm` and `md` start at 1024 px; `lg` starts at 1280 px. Do not assume
  default Tailwind breakpoints.
- The page body hides overflow. Fixed overlays and flex layouts must provide
  bounded, reachable scrolling on short mobile landscape screens.
- Keep asset names and casing exact. Edit source artwork under [assets](assets/),
  not generated copies under the application's public assets or build output.
- Never embed private keys, service-account credentials or other secrets in
  source, documentation or browser bundles.

## Documentation is part of the change

**Update directly affected Markdown documentation in the same task as code or
content changes.** Do not leave the documentation update as a suggested follow-up.

| Change | Documentation to update |
| --- | --- |
| Controls, turns, damage, block, buffs or rewards | [Game logic](docs/game-logic.md) |
| Areas, routes, map nodes or event choices | [World and events](docs/world-and-events.md) |
| Enemy stats, bosses, scaling or trait execution | [Enemies](docs/enemies.md) |
| Drinks, food, weapons, drops, shop stock or prices | [Items](docs/items.md) |
| Relic effects, acquisition or interactions | [Relics](docs/relics.md) |
| XP, upgrades, unlocks, scoring, saves or profile behavior | [Progression](docs/progression.md) |
| Architecture, dependencies, assets, configuration or deployment | [Technical documentation](TECHNICAL_DOCUMENTATION.md) |
| Setup, navigation or catalog totals | [Project README](README.md) and [documentation index](docs/README.md) |

- Document actual behavior, including important differences from intended or
  advertised behavior. Remove a caveat when the corresponding issue is fixed.
- Keep IDs, names, values, formulas, probabilities, catalog counts and acquisition
  restrictions consistent with source.
- Update the short in-game tutorial when a change affects the basics it teaches.
- Use relative Markdown links between repository documents and source files.
- Preserve the separation between gameplay references and technical documentation.
- Only claim a documentation snapshot was reverified to the extent actually checked.

## Validation

- Run commands from the [application directory](seppo-react/), using its
  [package manifest](seppo-react/package.json) and lockfile.
- For application changes, run `npm run build` to type-check and build. Use any
  relevant existing focused tests; add focused regression tests when the project
  has suitable test infrastructure.
- The current manifest has no test or lint scripts. Do not claim those checks
  passed or add a new testing stack for an unrelated change.
- For UI changes, verify the actual interaction and layout in a browser. Include
  short landscape sizes such as 568x320 or 667x375, a desktop size, and relevant
  breakpoint boundaries. Check that content and controls remain reachable.
- For documentation-only changes, no application build is required. Verify
  affected links, table consistency and source-backed facts instead.
- Avoid concurrent development-server startups/builds that copy into the same
  asset destination.
- Do not modify the user's active run or cloud profile as a test fixture. Use
  isolated local state and authorized test accounts when needed.
- Clean up temporary fixtures and test-only processes. Keep a user-requested
  development server available and report its address.
- Report checks actually run, failures and anything not verified. Do not push
  changes as a final validation or completion step.
