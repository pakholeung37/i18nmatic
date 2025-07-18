import { describe, expect, it } from "vitest"
import generate from "@babel/generator"
import * as parser from "@babel/parser"
import { Extractor } from "../extractor"
import { createLanguageCheckFunction } from "../common/language"

const parseCode = (code: string) => {
  return parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  })
}

describe("extractor", () => {
  it("component", () => {
    const code = `
function MyComponent() {
  const msg = "안녕하세요"; // 한글 (비래핑)
  console.log(t("이미 t()래핑된 문자열"));
  return <div>반갑습니다</div>;
}
`

    const ast = parseCode(code)

    const result = new Extractor(
      ast,
      createLanguageCheckFunction("ko"),
      "",
    ).extract()

    expect(result.length).toBe(1)
    expect(result[0]).toEqual({
      text: "이미 t()래핑된 문자열",
      containerName: "/MyComponent",
    })
  })

  
})
