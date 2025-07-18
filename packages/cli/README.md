# @terminus/t-i18n-cli

> CLI tool for automating internationalization (i18n) code transformation and key extraction in React and Next.js projects.

`@terminus/t-i18n-cli` is a command-line tool that automates the process of wrapping text in your code with translation functions and extracting the keys for internationalization. It helps you quickly and efficiently implement i18n in your React and Next.js projects, allowing you to validate your ideas and business in the global market faster.

## Why?

To expand your business and seize global opportunities, **internationalization (i18n)** is no longer optional—it's essential.

React and Next.js projects typically use libraries such as `react-i18next` or `next-i18next` to handle multilingual content. However, manually wrapping every piece of text in `t()` functions and managing the extracted translation keys in JSON files is tedious, repetitive, and resource-intensive, especially in large codebases.

`@terminus/t-i18n-cli` automates these repetitive tasks, enabling developers to focus on higher-level problems and empowering your business to quickly validate ideas in the global market.

## 📺 Demo

See how quickly `@terminus/t-i18n-cli` transforms your code and extracts translation keys.

## Key Features

- **Automatic Code Transformation**: Detects text in JSX, string literals, and template literals that needs to be internationalized. It automatically wraps them with a `t()` function and injects the necessary imports.
- **Translation Key Extraction**: Extracts all text requiring translation—even if not yet wrapped with `t()`—and outputs keys with source file paths into a JSON file, enabling efficient management and traceability.
- **Multilingual Support**: Supports multiple languages for key extraction, including English, Japanese, Chinese, and Korean.
- **React/Next.js Compatibility**: Fully compatible with `react-i18next` and `next-i18next`.

## Installation

```bash
npm install -D @terminus/t-i18n-cli
# or
yarn add -D @terminus/t-i18n-cli
```

## Usage

### 1. Create a configuration file

Create an `auto-i18n.config.json` file in your project's root directory.

```json
{
  "runType": "next",
  "entry": "src",
  "outputDir": "public/locales",
  "enablePrettier": true,
  "outputFileName": "common.json",
  "keyLanguage": "en"
}
```

_(See below for all configuration options)_

### 2. Run the CLI

Execute the following command to transform your code and extract translation keys:

```bash
npx t-i18n-cli
```

Or add a script to your `package.json`:

```json
"scripts": {
  "i18n": "t-i18n-cli"
}
```

Then run:

```bash
pnpm run i18n
# or
yarn i18n
```

### 3. Transformation Results

**Before:**

```jsx
function Greeting() {
  return <div>Hello</div>
}
```

**After:**

```jsx
import { useTranslation } from "next-i18next"

function Greeting() {
  const { t } = useTranslation()
  return <div>{t("Hello")}</div>
}
```

**Extracted JSON (`public/locales/ja-JP/common.json`):**

```json
{
  "Hello": "Hello"
}
```

## Examples

### Input Code (Before)

```jsx
// Template Literals
function TemplateLiteralComponent({ name }) {
  return <p>{`Hello, ${name}`}</p>
}

// JSX Attributes
function JSXAttributeComponent() {
  return <input type="text" placeholder="Please enter text here" />
}
```

### Transformed Code (After)

```jsx
import { useTranslation } from "next-i18next"

function TemplateLiteralComponent({ name }) {
  const { t } = useTranslation()
  return <p>{t("Hello, {{name}}", { name })}</p>
}

function JSXAttributeComponent() {
  const { t } = useTranslation()
  return <input type="text" placeholder={t("Please enter text here")} />
}
```

### Extracted JSON File (`public/locales/{locale}/common.json`)

```json
{
  "Hello, {{name}}": "Hello, {{name}}",
  "Please enter text here": "Please enter text here"
}
```

## Handling Complex Cases

In some scenarios, it can be difficult for the tool to automatically determine if a string should be wrapped with the `t()` function, especially for text inside complex data structures.

For these cases, `@terminus/t-i18n-cli` will still extract the text into your JSON files and add a comment indicating the source file path. This allows developers to easily find the text and manually apply the `t()` function where needed.

### Example Input Code

```jsx
// src/components/example.tsx

const ITEMS = [
  {
    id: 1,
    title: "Hello",
    description: "Welcome.",
  },
  {
    id: 2,
    title: "Pleased to meet you.",
    description: "Thank you.",
  },
]

function Example() {
  return (
    <>
      {ITEMS.map((item) => (
        <div key={item.title}>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
        </div>
      ))}
    </>
  )
}
```

### Extracted JSON File (`public/locales/{locale}/common.json`)

```json
{
  ...
  "__comment_1": "src/components/example.tsx/ITEMS",
  "Welcome.": "Welcome.",
  "Thank you.": "Thank you.",
  "Pleased to meet you.": "Pleased to meet you.",
  ...
}
```

## Supported Patterns

- **JSX text**: `<div>Hello</div>` → `<div>{t("Hello")}</div>`
- **String literals**: `const greeting = "Hello";` → `const greeting = t("Hello");`
- **Template literals**: ``const message = `${name}, welcome`;`` → `const message = t("{{name}}, welcome", { name });`
- **JSX attributes**: `<input placeholder="Hello" />` → `<input placeholder={t("Hello")} />`
- **Conditional expressions**: `isMorning ? "Good morning" : "Good evening"` → `isMorning ? t("Good morning") : t("Good evening")`

## Configuration (`auto-i18n.config.json`)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `importModuleName` | `string` | `"@terminus/t-i18n"` | The module name to import translation functions from. |
| `useHook` | `boolean` | `false` | Whether to use `useTranslation` hook or just the `t` function. |
| `keyLanguage` | `"zh"` \| `"en"` \| `"ko"` \| `"ja"` | `"zh"` | The base language for extracting translation keys. |
| `outputDir` | `string` | `"public/locales"` | The directory for generated translation JSON files. |
| `include` | `string` \| `string[]` | `"./**/*"` | Glob patterns for files to include in the transformation. |
| `exclude` | `string` \| `string[]` | `["node_modules", "dist", "build", "test"]` | Glob patterns for files to exclude. |
| `ext` | `string[]` | `["js", "jsx", "ts", "tsx"]` | File extensions to process. |
| `enablePrettier` | `boolean` | `true` | Format the output code using Prettier. |
| `outputFileName` | `string` | `"en-US.json"` | The filename for the generated translation file. |
| `dry` | `boolean` | `false` | If true, performs a dry run without writing changes to files. |
| `outputJsonMode` | `"create"` \| `"merge"` | `"create"` | `"create"` to overwrite existing JSON, `"merge"` to merge with it. |
| `comment` | `boolean` | `false` | Whether to add comments to the generated JSON file for complex cases. |
| `defaultTranslation`| `string` | `""` | Default value for new keys in the translation file. |

## Contributing

Contributions are always welcome! Please feel free to create a Pull Request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/my-feature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/my-feature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License.
