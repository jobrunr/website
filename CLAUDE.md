# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the JobRunr website (www.jobrunr.io), built with Hugo static site generator using the Fortify Hugo theme and Tailwind CSS v4.

## Commands

**Development:**
```bash
hugo server -D          # Start local server (-D shows draft articles)
npm run dev             # Alternative: start server
npm run preview         # Preview production build
```

**Build:**
```bash
npm run build           # Production build with minification
npx -y pagefind --site public  # Build search index (required for search to work)
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

## Custom Shortcodes

See [README.md](README.md) for full documentation on JobRunr's custom shortcodes including:
- **Code tabs** (`codetabs`/`codetab`) - Synchronized tabs for Maven/Gradle, Java/Kotlin examples
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

## Code Style

- Keep code and comments concise
- Avoid unnecessary comments

## Key Parameters

In `hugo.toml`:
- `params.jobRunrVersion` - Current JobRunr version displayed throughout the site
- `params.enableTrialButton` - Toggle trial button visibility
