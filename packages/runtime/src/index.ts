import i18next, { type i18n as I18n } from "i18next"

export { useTranslation, I18nextProvider, withTranslation } from "react-i18next"

export const i18n: I18n =
  ((window as any).Ti18n as typeof i18next) ?? i18next.createInstance()
// @ts-ignore
window.Ti18n = i18n // Expose for debugging

// 绑定 t 函数以便直接使用ng
export const t: I18n['t'] = i18n.t.bind(i18n)
