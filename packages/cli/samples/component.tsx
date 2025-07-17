import { B } from "@terminus/t-console-framework"
// 中文测试用集合

// 1. 函数声明 + JSX 中直接使用中文
function HelloComponent() {
  return <div>你好</div>
}

// 2. 函数声明 + 变量赋值中文字符串字面量
function HelloWorldComponent() {
  const text = "你好"
  return <div>{text}</div>
}

// 3. 隐式返回箭头函数 + JSX 中的中文
//    -> 没有块语句，可以测试隐式返回
const AnotherComponent = () => <span>你好，这是一个span</span>

// 4. 显式返回箭头函数 + JSXText/Attribute 中文
const AnotherComponent2 = () => {
  return <input type="text" placeholder="你好，请在这里输入" />
}

// 5. 函数声明 + 条件表达式(三元运算符) 内部中文
function ConditionalComponent({ isKorean }) {
  return <div>{isKorean ? "你好" : "Hello"}</div>
}

// 6. 模板字面量 + 中文
function TemplateLiteralComponent({ name }) {
  // 例如: `${name}，你好`
  //    `${user.name}，我们${time}见面吧` 这样的模式测试
  return <p>{`${name}，你好`}</p>
}

// 7. 箭头函数 + 多个中文字符串字面量
const MultipleStringLiterals = () => {
  const greeting = "你好"
  const message = "很高兴见到你"
  return <p>{greeting + ", " + message}</p>
}

// 8. 函数表达式 + JSXText 中文
const ExpressionComponent = function () {
  return <p>表达式组件：你好</p>
}

// 9. 函数声明 + 多个中文混合的条件表达式 + 模板字面量
function ComplexConditional({ isMorning, user }) {
  // 三元运算符 + 模板字面量
  // 中文 / 英语混合
  const timeStr = isMorning ? "上午" : "下午"
  return <div>{`${user.name}，现在是${timeStr}。Hello!`}</div>
}

// 10. 内部嵌套函数也有中文的情况
//     (用于判断是否为顶级函数)
const NestedFunction = () => {
  // 不是顶级的内部函数
  function inner() {
    // 中文字符串字面量
    return "这是内部函数的中文"
  }
  return <div>{inner()}</div>
}

// 11. 完全没有中文的组件 (不应该被转换)
function NoKoreanComponent() {
  return <div>Hello only, no Korean here</div>
}

// 12. 隐式返回箭头函数 + JSXText + 三元运算符同时
const ComplexArrow = ({ isHello }) =>
  isHello ? <div>你好 - 三元运算符</div> : <div>Hello - ternary</div>

// 13. 函数声明 + JSX Attribute 2个
function DoubleAttributeComponent() {
  return (
    <section title="你好标题" aria-label="中文标签">
      <p>中文段落</p>
    </section>
  )
}

// 14. 箭头函数 + 复合模板字面量 (表达式、中文、英语混合)
//    例如) `${user.name}，今天是 ${date}。Have a good day!`
const MixedTemplate = ({ user, date }) => (
  <div>{`${user.name}，今天是 ${date}。Have a good day!`}</div>
)

// 15. (可选) 函数声明 + JSX + Template Literal 内部有TSType (类型信息)
//    -> 实际工作中类型可能混合的情况 (非常罕见)
//    -> 在这里写出来也可以测试TSType跳过逻辑
function TypeAnnotatedTemplate<T>(value: T) {
  // 例如: `${value as string} - 中文`
  return <div>{`${value as string} - 中文`}</div>
}

/**
 * 以上16种函数/组件涵盖了
 * 1) 函数声明
 * 2) 函数表达式
 * 3) 箭头函数 (隐式/显式返回)
 * 4) 三元运算符
 * 5) 模板字面量
 * 6) JSXText / JSX Attribute
 * 7) 多个字符串字面量
 * 8) 内部嵌套函数
 * 9) TypeScript 类型 (非常罕见的情况)
 * 等包含中文的用例。
 *
 * - 用Babel解析整个文件后，一次性测试
 *   可以一次性确认大部分中文转换用例。
 */
