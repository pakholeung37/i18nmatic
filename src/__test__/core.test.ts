import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import { createLanguageCheckFunction, has } from "../common";
import * as demoCode from "./demo";
import * as core from "../core";
import generate from "@babel/generator";

describe("isFunctionalComponent", () => {
  const testCases = [
    { code: demoCode.componentDeclaration, expected: true },
    { code: demoCode.componentExpression, expected: true },
    { code: demoCode.componentArrow, expected: true },
    { code: demoCode.hookDeclaration, expected: false },
    { code: demoCode.hookExpression, expected: false },
    { code: demoCode.hookArrow, expected: false },
    { code: demoCode.helperFunction, expected: false },
  ];

  testCases.forEach(({ code, expected }, index) => {
    it(`should return ${expected} for test case ${index + 1}`, () => {
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"],
      });
      traverse(ast, {
        FunctionDeclaration(path) {
          expect(core.isFunctionalComponent(path)).toBe(expected);
        },
        FunctionExpression(path) {
          expect(core.isFunctionalComponent(path)).toBe(expected);
        },
        ArrowFunctionExpression(path) {
          expect(core.isFunctionalComponent(path)).toBe(expected);
        },
      });
    });
  });
});

describe("isHook", () => {
  const testCases = [
    { code: demoCode.componentDeclaration, expected: false },
    { code: demoCode.componentExpression, expected: false },
    { code: demoCode.componentArrow, expected: false },
    { code: demoCode.hookDeclaration, expected: true },
    { code: demoCode.hookExpression, expected: true },
    { code: demoCode.hookArrow, expected: true },
    { code: demoCode.helperFunction, expected: false },
  ];
  testCases.forEach(({ code, expected }, index) => {
    it(`should return ${expected} for test case ${index + 1}`, () => {
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"],
      });
      traverse(ast, {
        FunctionDeclaration(path) {
          expect(core.isHook(path)).toBe(expected);
        },
        FunctionExpression(path) {
          expect(core.isHook(path)).toBe(expected);
        },
        ArrowFunctionExpression(path) {
          expect(core.isHook(path)).toBe(expected);
        },
      });
    });
  });
});

describe("isHookContextNode", () => {
  const testCases = [
    { code: demoCode.componentDeclaration, expected: true },
    { code: demoCode.componentExpression, expected: true },
    { code: demoCode.componentArrow, expected: true },
    { code: demoCode.hookDeclaration, expected: true },
    { code: demoCode.hookExpression, expected: true },
    { code: demoCode.hookArrow, expected: true },
    { code: demoCode.helperFunction, expected: false },
  ];
  testCases.forEach(({ code, expected }, index) => {
    it(`should return ${expected} for test case ${index + 1}`, () => {
      const ast = parser.parse(code, {
        sourceType: "module",
        plugins: ["jsx"],
      });
      traverse(ast, {
        FunctionDeclaration(path) {
          expect(core.isHookContextNode(path)).toBe(expected);
        },
        FunctionExpression(path) {
          expect(core.isHookContextNode(path)).toBe(expected);
        },
        ArrowFunctionExpression(path) {
          expect(core.isHookContextNode(path)).toBe(expected);
        },
      });
    });
  });
});

describe("findHookContextNode", () => {
  it("should find all hook context nodes", () => {
    const ast = parser.parse(
      `
            ${demoCode.componentDeclaration}
            ${demoCode.componentExpression}
            ${demoCode.componentArrow}
            ${demoCode.hookDeclaration}
            ${demoCode.hookExpression}
            ${demoCode.hookArrow}
            ${demoCode.helperFunction}
        `,
      {
        sourceType: "module",
        plugins: ["jsx"],
      }
    );

    const hookContextNodes = core.findHookContextNode(ast);
    expect(hookContextNodes).toHaveLength(6);
  });
});

describe("TWrapper", () => {
  it("should wrap string literal containing Korean with t()", () => {
    const code = `
      const Component = () => {
        const greeting = "안녕하세요";
        return <div>{greeting}</div>;
      }
    `;

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    // HookContextNode 후보로 ArrowFunctionExpression 하나를 찾음
    const hookContextNodes = core.findHookContextNode(ast);

    // Wrapper 인스턴스를 생성하여 wrapping 실행
    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapStringLiteral();

    // 전체 AST를 코드 문자열로 변환하여 t() 호출이 있는지 확인
    const output = generate(ast, {
      jsescOption: {
        minimal: true,
      },
    }).code;

    expect(output).toContain('t("안녕하세요")');
  });

  it("wraps JSXText containing Korean with t()", () => {
    const code = `
      const Component = () => (
        <div>
          안녕하세요
        </div>
      );
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const hookContextNodes = core.findHookContextNode(ast);

    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapJSXText();

    // generate 시 jsescOption minimal 옵션을 사용하여 실제 한글이 그대로 보이게 한다.
    const output = generate(ast, {
      jsescOption: { minimal: true },
    }).code;
    // 기대: JSXText "안녕하세요"가 {t("안녕하세요")}로 변환됨.
    expect(output).toContain('{t("안녕하세요")}');
  });

  it("wraps JSXAttribute text aleardy have expression containing Korean with t()", () => {
    const code = `
      const Component = () => (
        <div placeholder={"안녕하세요"} />
      );
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const hookContextNodes = core.findHookContextNode(ast);

    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapStringLiteral();

    const output = generate(ast, {
      jsescOption: { minimal: true },
    }).code;
    // 기대: placeholder 속성 값이 {t("안녕하세요")} 형태로 변환됨.
    expect(output).toContain('placeholder={t("안녕하세요")}');
  });

  it("wraps JSXAttribute text containing Korean with t()", () => {
    const code = `
      const Component = () => (
        <div placeholder="안녕하세요" />
      );
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const hookContextNodes = core.findHookContextNode(ast);

    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapStringLiteral();

    const output = generate(ast, {
      jsescOption: { minimal: true },
    }).code;
    // 기대: placeholder 속성 값이 {t("안녕하세요")} 형태로 변환됨.
    expect(output).toContain('placeholder={t("안녕하세요")}');
  });

  it("wraps conditional expression consequent containing Korean with t()", () => {
    const code = `
      const Component = () => {
        const message = isKorean ? "안녕하세요" : "hello";
        return <> {message} </>;
      }
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const hookContextNodes = core.findHookContextNode(ast);

    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapStringLiteral();

    const output = generate(ast, {
      jsescOption: { minimal: true },
    }).code;
    // 기대: 삼항 연산자에서 "안녕하세요"가 t("안녕하세요")로 래핑되어야 함.
    expect(output).toContain('isKorean ? t("안녕하세요") : "hello"');
  });

  it("wraps conditional expression in Component containing Korean with t()", () => {
    const code = `
      const Component = () => {
        return <> {isKorean ? "안녕하세요" : "하hello"} </>;
      }
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const hookContextNodes = core.findHookContextNode(ast);

    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapStringLiteral();

    const output = generate(ast, {
      jsescOption: { minimal: true },
    }).code;
    // 기대: 삼항 연산자에서 "안녕하세요"가 t("안녕하세요")로 래핑되어야 함.
    expect(output).toContain('isKorean ? t("안녕하세요") : t("하hello")');
  });

  it("wraps a template literal with interpolations into a t() call", () => {
    const code = `
        const Component = () => {
        const message = \`\${user.name}님 \${time}에 만나요\`;

        return <> {message} </>;
      }
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
    const hookContextNodes = core.findHookContextNode(ast);

    const wrapper = new core.TWrapper(
      hookContextNodes,
      createLanguageCheckFunction("ko")
    );
    wrapper.wrapTemplateLiteral();

    const output = generate(ast, {
      jsescOption: { minimal: true },
    }).code;
    // 예상 변환 결과:
    // const message = t("{{user.name}}님 {{time}}에 만나요", { "user.name": user.name, time });
    expect(output).toContain('t("{{user.name}}님 {{time}}에 만나요"');
    expect(output).toContain('"user.name": user.name');
    expect(output).toContain('"time": time');
  });
});
