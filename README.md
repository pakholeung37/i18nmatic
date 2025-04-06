# i18nmatic

**"The fastest way to implement internationalization"**

`i18nmatic` is a CLI tool that automates code transformation and translation key extraction, allowing you to quickly and efficiently implement internationalization (i18n) in React and Next.js projects. Quickly apply internationalization to validate your ideas and business in the global market!

## Why?

To expand your business and seize global opportunities, **internationalization (i18n)** is no longer optional—it's essential.

React and Next.js projects typically use libraries such as `react-i18next` or `next-i18next` to handle multilingual content. However, wrapping every text manually in `t()` functions and managing extracted translation keys in JSON files is tedious, repetitive, and resource-intensive, especially in large codebases.

**i18nmatic** automates these repetitive tasks, enabling developers to focus on higher-level problems and empowering your business to quickly validate ideas in the global market.

## Key Features

- **Automatic code transformation**: Detects all text requiring internationalization in JSX, string literals, template literals, etc. Automatically extracts translation keys based on the selected language, wraps them with `t()`, and injects the necessary imports.
- **Translation key extraction**: Automatically generates translation keys into JSON files, simplifying translation file management.
- **Multilingual support**: Supports major languages including Korean, English, Japanese, and Chinese.
- **React/Next.js compatibility**: Fully compatible with `react-i18next` and `next-i18next`.

## Installation

```bash
npm install -D i18nmatic
# or
yarn add -D i18nmatic
```

## Usage

### 1. Create a configuration file

**Create an `auto-i18n.config.json` file in your project's root directory** ([Click here to see the default configuration options](https://github.com/seonghunYang/i18nmatic?tab=readme-ov-file#-configuration-auto-i18nconfigjson)):

```json
{
  "runType": "next",        // Choose between "next" or "react"
                              // - "next": Use for Next.js projects
                              // - "react": Use for React projects

  "entry": "src",           // Root directory of your source code
                              // - Example: "src" targets all files in the src directory

  "locales": ["en", "ja-JP"],  // Array of locale codes to support
                                // - Example: ["en", "ja-JP"] supports English and Japanese
                                // - JSON files are generated separately per language

  "outputDir": "public/locales", // Directory to store generated translation JSON files
                                   // - Example: "public/locales" is compatible with Next.js static paths

  "enablePrettier": true,     // Whether to format generated code and JSON files using Prettier
                              // - true: Use Prettier formatting
                              // - false: Save original formatting

  "outputFileName": "common.json", // Name of the generated translation JSON file
                                     // - Example: "common.json" is consistent across languages

  "keyLanguage": "ko"         // Base language to extract translation keys
                              // - Example: "ko" extracts Korean text as translation keys
                              // - Supported values: "ko", "en", "ja", "zh", etc.
}

```

### 2. Run CLI

Execute the following command to transform code and extract translation keys:

```bash
npx auto-i18n
```

Or add a script to `package.json`:

```json
"scripts": {
  "auto-i18n": "auto-i18n"
}
```

Then run:

```bash
npm run auto-i18n
# or
yarn auto-i18n
```

### 3. Transformation results

### Before:

```jsx
function Greeting() {
  return <div>안녕하세요</div>;
}
```

### After:

```jsx
import { useTranslation } from "next-i18next";

function Greeting() {
  const { t } = useTranslation();
  return <div>{t("안녕하세요")}</div>;
}
```

### Extracted JSON keys (`public/locales/en/common.json`):

```json
{
  "안녕하세요": "안녕하세요"
}
```

## Supported Patterns

- **JSX text**: `<div>안녕하세요</div>` → `<div>{t("안녕하세요")}</div>`
- **String literals**: `const greeting = "안녕하세요";` → `const greeting = t("안녕하세요");`
- **Template literals**: `const message = `${name}님 안녕하세요`;` → `const message = t("{{name}}님 안녕하세요", { name });`
- **JSX attributes**: `<input placeholder="안녕하세요" />` → `<input placeholder={t("안녕하세요")} />`
- **Conditional expressions**: `isKorean ? "안녕하세요" : "Hello"` → `isKorean ? t("안녕하세요") : t("Hello")`

### 📘 Configuration (`auto-i18n.config.json`)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `runType` | `"next"` \| `"react"` | `"next"` | 사용 중인 프레임워크 유형을 지정합니다. |
| `entry` | `string` | `"src"` | Root directory for your source code. |
| `locales` | `string[]` | `["ja_JP"]` | Supported locale codes (e.g., `["en", "ja-JP"]`). |
| `outputDir` | `string` | `"public/locales"` | Directory for generated translation JSON files. |
| `enablePrettier` | `boolean` | `true` | Format output using Prettier. |
| `outputFileName` | `string` | `"common.json"` | Filename for generated translation files. |
| `keyLanguage` | `"ko"` \| `"en"` \| `"ja"` \| `"zh"` | `"ko"` | 번역 키를 추출할 기준 언어입니다. |

## Testing

This project uses Jest for testing. To run tests:

```bash
npm test
```

## Contributing

Contributions are always welcome! Please follow these steps:

1. Fork this repository.
2. Create a new branch: `git checkout -b feature/my-feature`
3. Ensure all existing tests pass, and add relevant tests for your changes.
4. Commit your changes: `git commit -m "Add my feature"`
5. Push to your branch: `git push origin feature/my-feature`
6. Create a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

If you have questions or issues, please open a GitHub issue.
