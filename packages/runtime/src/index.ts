import i18next from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import ChainedBackend from "i18next-chained-backend"
import LocalStorageBackend from "i18next-localstorage-backend" // load from local storage
import HttpBackend from "i18next-http-backend" // have a own http fallback
import { initReactI18next } from "react-i18next"

export { useTranslation, I18nextProvider, withTranslation } from "react-i18next"

export const i18n =
  ((window as any).Ti18n as typeof i18next) ?? i18next.createInstance()
// @ts-ignore
window.Ti18n = i18n // Expose for debugging
export const t = i18n.t.bind(i18n) // 绑定 t 函数以便直接使用
export function initI18n(): void {
  // resources: Record<string, any>,
  // options?: DetectorOptions,
  i18n
    // 用于检测用户语言
    .use(LanguageDetector)
    // 将 i18next 实例传递给 react-i18next
    .use(initReactI18next)
    .use(ChainedBackend)
    // 初始化 i18next
    .init({
      // 默认语言
      load: "currentOnly",
      lng: undefined,
      // allow keys to be phrases having `:`, `.`
      nsSeparator: false,
      // allow keys to be phrases having `:`, `.`
      keySeparator: false,

      // do not load a fallback
      fallbackLng: false,

      // 命名空间配置
      // ns: ['translation', 'common', 'errors'],
      // defaultNS: 'translation',

      interpolation: {
        escapeValue: false, // React 默认会转义，所以这里设置为 false
      },

      detection: {
        order: ["cookie", "navigator"],
        caches: ["cookie"],
        cookieDomain: cookieDomain(),
        // detactor options
        lookupQuerystring: "lng",
        lookupCookie: "trantor_v2_lng",
        lookupLocalStorage: "trantor_v2_lng",
        lookupSessionStorage: "trantor_v2_lng",
      },

      backend: {
        backends: [
          LocalStorageBackend, // primary
          HttpBackend, // fallback
        ],
        backendOptions: [
          {
            prefix: "t-i18n_res_",
            expirationTime: 0,
          },
          {
            loadPath: (lng: string) => {
              return `/locales/${lng}.json`
            },
          },
        ],
      },
    })
    .then(() => {
      console.log("i18n initialized successfully")
    })
}

const cookieDomain = () => {
  const domain = window.location.hostname
  if (tlds().some((tld) => domain.endsWith(tld))) {
    return domain.split(".").slice(-3).join(".")
  }
  return domain.split(".").slice(-2).join(".")
}

const tlds = () => {
  return [".com.con", ".net.cn", ".org.cn", ".gov.cn", ".edu.cn"]
}
