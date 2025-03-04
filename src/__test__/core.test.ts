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

  it("should correctly wrap string literals, JSX text, attributes, template literals, and ternary expressions with t()", () => {
    // 1. AST 파싱
    const ast = parser.parse(demoCode.allCasesDemo, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. TWrapper 인스턴스 생성 및 wrap 실행
    const wrapper = new core.TWrapper(
      hookContextNodes,
      // 간단히 한글 유무만 확인하도록 구현
      createLanguageCheckFunction("ko")
    );
    wrapper.wrap(); // wrap()은 StringLiteral, JSXText, TemplateLiteral 등을 모두 처리

    // 4. 변환 결과 확인
    const output = generate(ast, { jsescOption: { minimal: true } }).code;

    // 5. 모든 사례가 t()로 변환되었는지 검사
    // - 일반 문자열 리터럴
    expect(output).toContain('t("안녕하세요")');
    // - 템플릿 리터럴
    expect(output).toContain('t("안녕, {{user.name}}!", ');
    expect(output).toContain('"user.name": user.name');
    // - 삼항 연산자
    expect(output).toContain('isKorean ? t("안녕") : "Hello"');
    // - JSX Attribute
    expect(output).toContain('placeholder={t("잠시만요")}');
    // - JSX Text
    expect(output).toContain('{t("반갑습니다.")}');
  });
});

describe("Insertion", () => {
  it("converts arrow function with implicit return to a block statement with explicit return", () => {
    const code = `
      const Component = () => <p>안녕하세요</p>;
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. TWrapper 인스턴스 생성 및 wrap 실행
    const insertion = new core.Insertion(hookContextNodes, ast);

    insertion.wrapFunctionsWithBlockStatement();

    const output = generate(ast, { jsescOption: { minimal: true } }).code;
    // 예상 변환 결과:
    // const Component = () => {
    //   return <p>안녕하세요</p>;
    // };
    expect(output).toContain("return <p>안녕하세요</p>;");
    expect(output).toContain("{");
    expect(output).toContain("}");
  });

  it("does not convert arrow function with explicit return", () => {
    const code = `
    const Component = () => {
      return <p>안녕하세요</p>;
    };
  `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. TWrapper 인스턴스 생성 및 wrap 실행
    const insertion = new core.Insertion(hookContextNodes, ast);

    insertion.wrapFunctionsWithBlockStatement();

    const output = generate(ast, { jsescOption: { minimal: true } }).code;
    // 예상 변환 결과:
    // const Component = () => {
    //   return <p>안녕하세요</p>;
    // };
    expect(output).toContain("return <p>안녕하세요</p>;");
    expect(output).toContain("{");
    expect(output).toContain("}");
  });

  it("inserts useTranslation hook at the top of top-level function if t() exists", () => {
    const code = `
      const Component = () => {
        const handleClick = () => {
          alert(t('반갑습니다'));
        }
        return (
          <button onClick={handleClick}>t('안녕하세요')</button>
        );
      }
    `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. TWrapper 인스턴스 생성 및 wrap 실행
    const insertion = new core.Insertion(hookContextNodes, ast);

    // 먼저 block statement로 감싸는 작업 실행 (암시적 반환이 있을 경우 대비)
    insertion.insertUseTranslationHook();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;
    // 기대: 최상위 함수의 시작 부분에 const { t } = useTranslation(); 이 삽입되어 있어야 한다.
    expect(output).toContain("const { t } = useTranslation()");
  });

  it("inserts useTranslation hook at the top of top-level functions when t() exists in both components", () => {
    const code = `
        const Component1 = () => {
          const handleClick = () => {
            alert(t('반갑습니다'));
          }
          return (
            <button onClick={handleClick}>t('안녕하세요')</button>
          );
        }
  
        const Component2 = () => <button onClick={handleClick}>{t('안녕하세요')}</button>
        
      `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. TWrapper 인스턴스 생성 및 useTranslation 훅 주입 실행
    const insertion = new core.Insertion(hookContextNodes, ast);
    insertion.wrapFunctionsWithBlockStatement();
    insertion.insertUseTranslationHook();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    // 정규식을 이용해 "const { t } = useTranslation()" 패턴이 두 번 이상 등장하는지 확인
    const regex = /const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/g;
    const matches = output.match(regex);

    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(2);
  });

  it("does not insert duplicate useTranslation hook if already present", () => {
    const code = `
        const Component = () => {
          const { t } = useTranslation();
          const handleClick = () => {
            alert(t('반갑습니다'));
          }
          return (
            <button onClick={handleClick}>t('안녕하세요')</button>
          );
        }
      `;
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. Insertion 인스턴스 생성 및 useTranslation 훅 주입 시도
    const insertion = new core.Insertion(hookContextNodes, ast);
    insertion.insertUseTranslationHook();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    // 정규식을 이용해 "const { t } = useTranslation()" 패턴이 정확히 한 번만 존재하는지 확인
    const regex = /const\s*{\s*t\s*}\s*=\s*useTranslation\(\)/g;
    const matches = output.match(regex);

    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("does not insert useTranslation hook if t() call is absent", () => {
    const code = `
      const Component = () => {
        return (
          <div>Hello</div>
        );
      }
    `;

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. TWrapper 인스턴스 생성 및 wrap 실행
    const insertion = new core.Insertion(hookContextNodes, ast);

    // 먼저 block statement로 감싸는 작업 실행 (암시적 반환이 있을 경우 대비)
    insertion.insertUseTranslationHook();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    expect(output).not.toContain("const { t } = useTranslation()");
  });

  it("should insert an import declaration when a t call exists and the import is missing", () => {
    const code = `
      const Component = () => {
        return (
          <div>{t("안녕하세요")}</div>
        );
      }
    `;

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const hookContextNodes = core.findHookContextNode(ast);

    const insertion = new core.Insertion(hookContextNodes, ast);

    insertion.insertImportDeclartion();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    expect(output).toContain('import { useTranslation } from "next-i18next"');
  });

  it("should insert an import declaration when a t call exists and the import is missin on react", () => {
    const code = `
      const Component = () => {
        return (
          <div>{t("안녕하세요")}</div>
        );
      }
    `;

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const hookContextNodes = core.findHookContextNode(ast);

    const insertion = new core.Insertion(hookContextNodes, ast, "react");

    insertion.insertImportDeclartion();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    expect(output).toContain('import { useTranslation } from "react-i18next"');
  });

  it("should inject both the translation hook and the import declaration when a t call exists", () => {
    const code = `
      const Component = () => <div>{t("안녕하세요")}</div>
    `;

    // 1. AST 생성 (jsx, typescript 플러그인 활성화)
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    // 2. HookContextNode 후보 찾기
    const hookContextNodes = core.findHookContextNode(ast);

    // 3. Insertion 인스턴스 생성 후 insert() 실행
    const insertion = new core.Insertion(hookContextNodes, ast);
    insertion.insert();

    // 4. AST를 코드로 변환하여 결과 검증
    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    expect(output).toContain('import { useTranslation } from "next-i18next"');
    expect(output).toContain("const { t } = useTranslation()");
  });

  it("does not insert import declaration if already present", () => {
    const code = `
      import { useTranslation } from "next-i18next"

      const Component = () => {
        const { t } = useTranslation();
        return (
          <div>{t("안녕하세요")}</div>
        );
      }
    `;

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const hookContextNodes = core.findHookContextNode(ast);

    const insertion = new core.Insertion(hookContextNodes, ast);

    insertion.insertImportDeclartion();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    const regex = /import\s*{\s*useTranslation\s*}\s*from\s*"next-i18next"/g;
    const matches = output.match(regex);

    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });

  it("does not insert import declaration if already present", () => {
    const code = `
      import { useState } from "react";
      import { useTranslation } from "next-i18next";

      const Component = () => {
        const { t } = useTranslation();
        return (
          <div>{t("안녕하세요")}</div>
        );
      }
    `;

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });

    const hookContextNodes = core.findHookContextNode(ast);

    const insertion = new core.Insertion(hookContextNodes, ast);

    insertion.insertImportDeclartion();

    const output = generate(ast, {
      concise: true,
      jsescOption: { minimal: true },
    }).code;

    const regex = /import\s*{\s*useTranslation\s*}\s*from\s*"next-i18next"/g;
    const matches = output.match(regex);

    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(1);
  });
});
