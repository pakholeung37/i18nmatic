import i18next, { type i18n as I18n } from "i18next"

export * from "react-i18next"

export type * from "i18next"

export const i18n: I18n =
  ((window as any).Ti18n as typeof i18next) ?? i18next.createInstance()
// @ts-ignore
window.Ti18n = i18n

export const t: I18n["t"] = function t(...args) {
  // 如果没有第三参数
  if (!args[2]) {
    return i18n.t(...args)
  }
  const defaultMessage = args[2]
  const key = args[0]
  let result = i18n.t(...args)
  // 如果没有翻译结果，使用默认消息
  if (result === key) {
    // 如果没有翻译结果，使用默认消息
    result = defaultMessage as any
  }
  return result
} as I18n["t"]
