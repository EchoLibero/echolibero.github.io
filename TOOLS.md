# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## System Errors (known bugs & mistakes)

### Git workspace confusion (2026-04-10)
**Symptom:** Lost work because main workspace has 5+ nested git repos (ai-nation-local, book-repo, bible, echolibero.github.io, pages-site, personal-site). `git add -A` tries to add them as regular files → SIGKILL or embedded-repo warnings.
**Fix:** Always use `git add <specific-file>` instead of `git add -A` when working in main workspace.
**Rule:** `git add works.html` → commit → push `pages works-final:main` (not `pages main` which is the old branch tracking).

### Pages remote branches
- `pages/main` — current published site
- `pages/gh-pages` — legacy, diverged from main by 400+ commits
- Always push to `pages <branch>:main` to update the live site
