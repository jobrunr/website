# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the JobRunr website (www.jobrunr.io), built with Hugo static site generator using the Fortify Hugo theme and Tailwind CSS v4.

## Prerequisites

Hugo, Go, and Node.js must be installed. See [README.md](README.md) for installation links.

## Commands

**Development:**
```bash
hugo server -D          # Start local server (-D shows draft articles)
npm run dev             # Start server (no drafts)
npm run preview         # Preview production build
```

**Build:**
```bash
npm run build           # Production build with minification
npx -y pagefind --site public  # Build search index (run after hugo build)
```

**Setup:**
```bash
npm run project-setup   # Initial project setup
npm i                   # Install dependencies
```

**Maintenance:**
```bash
npm run update-modules  # Update Hugo modules
npm run format          # Format code with Prettier
```

## Architecture

### Content Structure
- `content/english/` - All site content in English
  - `blog/` - Blog posts (markdown with front matter)
  - `documentation/` - Documentation pages with sidebar navigation
  - `guides/` - Tutorial guides
  - `use-case/` - Use case pages

### Theme & Layouts
- `themes/fortify-hugo/` - Base Fortify theme with JobRunr extensions
  - `assets/css/` - Stylesheets (base, components, documentation, syntax highlighting)
  - `assets/js/` - JavaScript (codetabs, code-copy, framework switching, etc.)
  - `layouts/` - Page templates for all content types
- `layouts/_markup/` - Custom render hooks that override theme defaults
  - `render-blockquote-alert.html` - GitHub-style alert rendering
  - `render-heading.html` - Heading customization
  - `render-image.html` - Image processing

### Configuration
- `hugo.toml` - Main Hugo configuration
- `config/_default/` - Additional config (menus, params, modules)
- `go.mod` - Hugo module dependencies

### Assets
- `assets/` - Images organized by content type (blog, documentation, guides)
- `static/` - Static files served directly

### Linking & URLs

The site uses `defaultContentLanguageInSubdir = true`, so all URLs are prefixed with `/en/`. When linking between pages, always use Hugo's `ref` shortcode rather than hardcoding paths:
```markdown
[link text]({{< ref "documentation/some-page" >}})
```

## Custom Shortcodes

See [README.md](README.md) for full documentation on JobRunr's custom shortcodes including:
- **Code tabs** (`codetabs`/`codetab`) - Synchronized tabs for Maven/Gradle, Java/Kotlin, configuration properties examples, etc.
- **Alerts** - GitHub-style alerts (`NOTE`, `TIP`, `WARNING`, `CAUTION`, `PRO`)

## Documentation Pages

Documentation uses sidebar navigation controlled by front matter:
```yaml
menu:
  sidebar:
    identifier: unique-id
    name: Display Name
    weight: 10
```

## Writing Conventions
- Keep code comments minimal
- Use concise, direct language
- **Documentation and Guide**: Read a few existing documentation files to match tone and style.
- **Technical Blog posts and Use cases**:
  - Write like a developer talking to a peer, not like a marketing team.
  - No unverified claims or invented statistics. Research outstanding articles (official docs, well-regarded blog posts) to support claims and include them as sources.
  - Verify all JobRunr features, APIs, and config properties against the documentation in `content/english/documentation`, `content/english/guides` — don't guess, notify in case of uncertainty.
  - Before writing, read 2-3 of these posts to match tone and style:
    - `blog/2024-10-31-task-schedulers-java-modern-alternatives-to-quartz.md`
    - `blog/2023-02-13-java-scheduler.md`
    - `blog/Simplified-RAG-Workflows-in-Java.md`
    - `blog/2022-10-05-JobRunr-and-daylight-saving-time.md`
    - `blog/axon-framework-jobrunr-pro.md`

## Code Style

- Keep code and comments concise
- Avoid unnecessary comments

## LLM Context (`.llm/`)

The `.llm/` directory is a persistent scratchpad for LLMs to store context across sessions and long-running tasks that may exceed the context window. Use it to save notes, plans, progress, or research so work can be resumed seamlessly. This folder is gitignored.

## Key Parameters

In `hugo.toml`:
- `params.jobRunrVersion` - Current JobRunr version displayed throughout the site
- `params.enableTrialButton` - Toggle trial button visibility
