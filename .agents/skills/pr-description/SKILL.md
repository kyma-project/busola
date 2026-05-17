# Skill: pr-description

Generate a complete PR description from the project's pull-request template, populated with context derived from the current branch.

## Usage

```
/pr-description [issue-number]
```

- `issue-number` (optional): GitHub issue number to link in the "Related issue(s)" section.

## Instructions

When this skill is invoked, follow these steps:

### 1. Read the PR template

Read `.github/pull-request-template.md` from the repository root.

### 2. Analyze the current branch

Run the following commands to understand what changed:

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

Use the commit messages and diff to understand the nature and scope of the changes.

### 3. Determine the PR title prefix

Based on the changes, select the most appropriate prefix:

| Prefix      | When to use                                               |
| ----------- | --------------------------------------------------------- |
| `feat:`     | A new feature                                             |
| `fix:`      | A bug fix                                                 |
| `docs:`     | Documentation-only changes                                |
| `refactor:` | A code change that neither fixes a bug nor adds a feature |
| `test:`     | Adding or updating tests                                  |
| `revert:`   | Reverting a previous commit                               |
| `chore:`    | Maintenance changes (build, CI, deps, tooling)            |

### 4. Generate the PR description

Produce a markdown output that fills in the template:

```markdown
**Description**

Changes proposed in this pull request:

- <bullet 1: concise summary of a logical change>
- <bullet 2: ...>
- ...

**Related issue(s)**

<If issue number provided: "Resolves #N". Otherwise omit or write "N/A">

**Definition of done**

- [x] The PR's title starts with one of the following prefixes:
  - feat: A new feature
  - fix: A bug fix
  - docs: Documentation only changes
  - refactor: A code change that neither fixes a bug nor adds a feature
  - test: Adding tests
  - revert: Revert commit
  - chore: Maintenance changes to the build process or auxiliary tools, libraries, workflows, etc.
- [x] Related issues are linked.
- [x] Explain clearly why you created the PR and what changes it introduces
- [x] All necessary steps are delivered, for example, tests, documentation, merging
```

### 5. Suggest a PR title

Output a suggested PR title with the chosen prefix. Keep it under 70 characters. Example:

```
feat: Add persistent volume detail cards
```

### 6. Output format

Present the output clearly so the user can copy it directly into a GitHub PR form:

1. First show the **suggested title**.
2. Then show the **full PR body** as a fenced markdown block.

## Guidelines

- Description bullets should focus on _what_ changed and _why_, not implementation minutiae.
- Keep bullets concise (one line each).
- If there are multiple commits, group related changes into logical bullets rather than listing each commit verbatim.
- Check all "Definition of done" items that are satisfied. Leave unchecked any that still need attention (e.g., missing tests or docs) and note them for the user.
- If no issue number is provided and the branch name or commits reference an issue, suggest it to the user but do not auto-fill.
