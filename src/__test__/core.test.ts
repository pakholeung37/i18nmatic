import * as parser from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { has } from "../common";
import * as demoCode from "./demo";
import * as core from "../core";

describe("isFunctionalComponent", () => {
  const testCases = [
    { code: demoCode.componentDeclaration, expected: true },
    { code: demoCode.componentExpression, expected: true },
    { code: demoCode.componentArrow, expected: true },
    { code: demoCode.hookDeclaration, expected: false },
    { code: demoCode.hookExpression, expected: false },
    { code: demoCode.hookArrow, expected: false },
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
