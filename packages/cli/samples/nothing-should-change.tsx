import { B, useTranslation, t } from "@terminus/t-console-framework"
// 中文测试用集合

// 1. 函数声明 + JSX 中直接使用中文
function HelloComponent() {
  return <div>HelloComponent</div>
}

const smaple1 = "Sample1"

const ERROR_MESSAGE = "error"
const review = {
  id: 1,
  name: "test",
}
const reviews = [
  {
    id: 1,
    name: "Mr.zhang",
  },
  {
    id: 2,
    name: "Ms.li",
  },
]

// 1. 函数声明 + JSX 中直接使用中文
function HelloComponent2() {
  const { t } = useTranslation()
  return <div>{t("你好")}</div>
}

const ERROR_MESSAGE2 = t("请稍后再试")
const review2 = {
  id: 1,
  name: t("测试"),
}
