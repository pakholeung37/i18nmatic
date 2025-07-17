// 훅(Hook) 버전

// 1. 선언형 훅 (FunctionDeclaration)
export const hookDeclaration = `
function useMyHook1() {
  return { value: 42 };
}
`

// 2. 표현식 훅 (FunctionExpression)
export const hookExpression = `
const useMyHook2 = function() {
  return { value: 42 };
};
`

// 3. 화살표 함수 훅 (ArrowFunctionExpression)
export const hookArrow = `
const useMyHook3 = () => {
  return { value: 42 };
};
`

// 컴포넌트(Component) 버전

// 4. 선언형 컴포넌트 (FunctionDeclaration)
export const componentDeclaration = `
function MyComponent1() {
  return <div>Hello, world!</div>;
}
`

// 5. 표현식 컴포넌트 (FunctionExpression)
export const componentExpression = `
const MyComponent2 = function() {
  return <div>Hello, world!</div>;
};
`

// 6. 화살표 함수 컴포넌트 (ArrowFunctionExpression)
export const componentArrow = `
const MyComponent3 = () => {
  return <div>Hello, world!</div>;
};
`

// 7. 그냥 함수
export const helperFunction = `
function helperFunction() {
  return 42;
}
`

export const allCasesDemo = `
  const user = { name: "Lee" };
  const isKorean = true;
  
  function AllCases() {
    // 일반 문자열 리터럴
    const greeting = "안녕하세요";
    
    // 템플릿 리터럴
    const template = \`안녕, \${user.name}!\`;
    
    // 삼항 연산자
    const message = isKorean ? "안녕" : "Hello";
    
    // JSX 리턴, JSX Attribute, JSX Text 모두 포함
    return (
      <div placeholder="잠시만요">
        반갑습니다.
        {template}
        {message}
      </div>
    );
  }
`
