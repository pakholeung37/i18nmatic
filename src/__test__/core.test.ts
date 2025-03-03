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
      retainLines: true,
      concise: true,
      jsescOption: {
        minimal: true,
      },
    }).code;

    expect(output).toContain('t("안녕하세요")');
  });
});
