# @terminus/t-i18n

> Runtime library for automating internationalization (i18n) in React and Next.js projects.

`@terminus/t-i18n` is the runtime library that provides the necessary utilities and functions for internationalization in projects processed by [`@terminus/t-i18n-cli`](../cli/README.md). It serves as a lightweight wrapper around `react-i18next` and `i18next`, providing seamless integration and enhanced functionality.

## Installation

```bash
npm install @terminus/t-i18n
# or
yarn add @terminus/t-i18n
# or
pnpm add @terminus/t-i18n
```

## Usage

### Basic Setup

```typescript
import { i18n, t } from "@terminus/t-i18n"

// Initialize i18n
i18n.init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        hello: "Hello",
        welcome: "Welcome to our app",
      },
    },
    zh: {
      translation: {
        hello: "你好",
        welcome: "欢迎使用我们的应用",
      },
    },
  },
})

// Use translation function
const greeting = t("hello") // "Hello" or "你好"
```

### React Components

```typescript
import { useTranslation } from '@terminus/t-i18n'

function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("hello")}</p>
    </div>
  )
}
```

### With CLI Integration

When using with [`@terminus/t-i18n-cli`](../cli/README.md), the transformation process automatically wraps your text with the `t()` function:

**Before transformation:**

```typescript
const message = "欢迎使用我们的应用"
```

**After transformation:**

```typescript
import { t } from "@terminus/t-i18n"
const message = t("欢迎使用我们的应用")
```

## API Reference

### `t(key, options?, defaultMessage?)`

The main translation function.

```typescript
t(key: string, options?: object): string
```

**Parameters:**

- `key`: Translation key
- `options`: Optional interpolation and formatting options
- `defaultMessage`: Optional default message

**Example:**

```typescript
t("hello") // Basic usage
t("greeting", { name: "John" }) // With interpolation
```

### `i18n`

The i18next instance for configuration and advanced usage.

```typescript
import { i18n } from "@terminus/t-i18n"

i18n.changeLanguage("zh")
i18n.addResources("en", "common", { key: "value" })
```

### React Hooks and Components

All `react-i18next` exports are available:

```typescript
import {
  useTranslation,
  Trans,
  I18nextProvider,
  // ... all react-i18next exports
} from "@terminus/t-i18n"
```

## Environment Compatibility

### Browser Environment

In browser environments, the library checks for a global `Ti18n` instance and uses it if available, otherwise creates a new i18next instance.

```typescript
// Global i18n instance (if available)
window.Ti18n = yourExistingI18nextInstance
```

### Node.js Environment

In Node.js environments, a new i18next instance is created automatically.

## License

MIT License - see the [LICENSE](../../LICENSE) file for details.

## Related Packages

- [`@terminus/t-i18n-cli`](../cli/README.md) - CLI tool for automatic code transformation and key extraction
