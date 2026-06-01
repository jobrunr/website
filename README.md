# This is the website for JobRunr.

If you see a typo, do not hesitate to create a pull request.

## How to run locally

### Prerequisites

1. Install hugo: https://gohugo.io/installation/
2. Install go: https://go.dev/dl/
3. Install Node.js: https://nodejs.org/en/download (or use `nvm` https://github.com/nvm-sh/nvm)

### Project setup

Run the following to setup the project:
```sh
npm run project-setup
```

### Run the project locally

1. Install required modules

```sh
npm i
```

2. Start local server


```sh
hugo server -D
```

> `-D` allows to see draft articles

3. Build with pagefind (you need this at least once for search to work locally)

```
npx -y pagefind --site public
```

### Theme

This project uses the hugo fortify theme. You can find its documentation at https://docs.gethugothemes.com/fortify/.

### JobRunr Extensions

We've extended the fortify theme with a few shortcodes of our own.

#### Sidebar menu

This is currently used on the documentation pages. It supports up to 3 levels of nesting.

##### Usage
The menu type in the front-matter needs to be `sidebar`.

Example:
```yaml
menu: 
  sidebar:
    identifier: faq
    name: FAQ
    weight: 95
```

#### Code tabs

Display code examples in multiple formats with synchronized tabs across the page.

##### Features

- **Global sync**: Clicking one tab activates all matching tabs on the page
- **Persistence**: Remembers user preferences per category using localStorage
- **Keyboard navigation**: Arrow keys, Home, and End for accessibility
- **ARIA compliant**: Full accessibility support with proper roles and keyboard interaction

##### Usage

Basic example with auto-generated tab types:

````markdown
{{< codetabs category="dependency" >}}
{{< codetab label="Maven" >}}
```xml
<dependency>
    <groupId>org.jobrunr</groupId>
    <artifactId>jobrunr</artifactId>
    <version>${jobrunr.version}</version>
</dependency>
```
{{< /codetab >}}

{{< codetab label="Gradle" >}}
```groovy
implementation 'org.jobrunr:jobrunr:${jobrunr.version}'
```
{{< /codetab >}}
{{< /codetabs >}}
````

##### Parameters

**`codetabs` shortcode:**
- `category` (optional): Category for syncing tabs across page. If omitted, auto-generates from sorted tab types. Must be one of the allowed categories in `params.codetabs.allowedCategories`. Specifying the `category` is highly recommended.
- `label` (optional): ARIA label for the tablist. Defaults to "Code examples".

**`codetab` shortcode:**
- `label` (required): Display text for the tab button.
- `type` (optional): Unique identifier for the tab. Auto-generated from label using `urlize` if not provided.

##### Best Practices

- Use explicit `category` for common patterns (dependency, framework, etc.) to ensure tabs sync correctly
- Each `codetab` must have a unique `label` within its parent `codetabs`
- Minimum 2 tabs required per `codetabs` block
- Tab content supports full Markdown formatting


#### Code annotations (conum)

Annotate specific lines in a code block with numbered badges, then explain them in a legend below. The badges are not included when the user copies the code.

##### Usage

Place `{{< conum N >}}` inline in the code block next to the line you want to call out, then follow the block with a `{{< conum-legend >}}` containing a matching ordered list:

````markdown
```java
JobRunr.configure() {{< conum 1 >}}
    .useStorageProvider(new InMemoryStorageProvider())
    .useBackgroundJobServer()
    .initialize();

BackgroundJob.enqueue(() -> myService.doWork()); {{< conum 2 >}}
```

{{< conum-legend >}}
1. Configure and start JobRunr: sets up storage and the background job server.
2. Enqueue a fire-and-forget job: executed as soon as a worker is free.
{{< /conum-legend >}}
````

##### Notes

- Numbers in the legend are styled automatically via CSS counters — write a plain ordered list inside `{{< conum-legend >}}`.
- Badge numbers are rendered via CSS `::before` and are excluded from clipboard copy.

#### Alerts

Highlight important information using GitHub-style alert syntax.

##### Usage

```markdown
> [!NOTE]
> Useful information that users should know.

> [!TIP]
> Helpful advice for better results.

> [!IMPORTANT]
> Key information users need to know.

> [!WARNING]
> Urgent info requiring attention.

> [!CAUTION]
> Potential risks or destructive actions.

> [!PRO]
> JobRunr Pro features.
```

##### Custom Titles

```markdown
> [!NOTE] Version Requirement
> All servers must run the same code version.
```

##### Callouts

```markdown
> [!TIP] Pro Tip
```

##### Available Types

- **NOTE** - General information
- **TIP** - Helpful suggestions
- **IMPORTANT** - Critical information
- **WARNING** - Caution required
- **CAUTION** - Dangerous operations
- **PRO** - Premium features

