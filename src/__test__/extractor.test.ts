import generate from "@babel/generator";
import * as parser from "@babel/parser";
import { Extractor } from "../extractor";
import { createLanguageCheckFunction } from "../common";

const parseCode = (code: string) => {
  return parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
};

const gernateCode = (ast: any) => {
  return generate(ast, {
    concise: true,
    jsescOption: { minimal: true },
  }).code;
};

describe("extractor", () => {
  it("component", () => {
    const code = `
function MyComponent() {
  const msg = "안녕하세요"; // 한글 (비래핑)
  console.log(t("이미 t()래핑된 문자열"));
  return <div>반갑습니다</div>;
}
`;

    const ast = parseCode(code);

    const result = new Extractor(
      ast,
      createLanguageCheckFunction("ko")
    ).extract();

    expect(result[0]).toEqual({
      text: "안녕하세요",
      isTWrapped: false,
      containerName: "MyComponent",
    });
    expect(result[1]).toEqual({
      text: "이미 t()래핑된 문자열",
      isTWrapped: true,
      containerName: "MyComponent",
    });
    expect(result[2]).toEqual({
      text: "반갑습니다",
      isTWrapped: false,
      containerName: "MyComponent",
    });
  });

  it("not component", () => {
    const code = `
function helperFunction() {
    return "안녕하세요";
}
`;

    const ast = parseCode(code);

    const result = new Extractor(
      ast,
      createLanguageCheckFunction("ko")
    ).extract();

    expect(result[0]).toEqual({
      text: "안녕하세요",
      isTWrapped: false,
      containerName: "helperFunction",
    });
  });

  it("object", () => {
    const code = `
const user = {
  name: "양성훈",
  sex: "남",
};
`;

    const ast = parseCode(code);

    const result = new Extractor(
      ast,
      createLanguageCheckFunction("ko")
    ).extract();

    console.log(result);

    expect(result[0]).toEqual({
      text: "양성훈",
      isTWrapped: false,
      containerName: "user",
    });
    expect(result[1]).toEqual({
      text: "남",
      isTWrapped: false,
      containerName: "user",
    });
  });
});
