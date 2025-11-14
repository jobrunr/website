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