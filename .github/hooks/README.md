# Git Hooks Setup

This directory contains Git hooks that automate quality checks for the repository.

## Installing the Pre-commit Hook

The pre-commit hook ensures that Playwright screenshots are generated before you commit changes.

### Installation

Run this command from the repository root:

```bash
cp .github/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Or use this one-liner:

```bash
just install-hooks  # If you've added this recipe to the justfile
```

### What the Hook Does

When you try to commit changes, the hook will:
1. Run `just test-all` to generate screenshots for all pages
2. Verify all configured pages are accessible
3. Generate screenshots in desktop, tablet, and mobile viewports
4. If successful, allow the commit to proceed
5. If failed, block the commit and show errors

### Bypassing the Hook (Not Recommended)

If you need to commit without running the hook (emergency only):

```bash
git commit --no-verify -m "Your message"
```

### Disabling the Hook

To temporarily disable:

```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

To re-enable:

```bash
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

## Other Hooks

You can add additional hooks as needed:
- `pre-push` - Run before pushing to remote
- `commit-msg` - Validate commit messages
- `post-commit` - Run after committing

Place them in this directory and install using the same method.
