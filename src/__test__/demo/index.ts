// 훅(Hook) 버전

// 1. 선언형 훅 (FunctionDeclaration)
export const hookDeclaration = `
function useMyHook() {
  return { value: 42 };
}
`;

// 2. 표현식 훅 (FunctionExpression)
export const hookExpression = `
const useMyHook = function() {
  return { value: 42 };
};
`;

// 3. 화살표 함수 훅 (ArrowFunctionExpression)
export const hookArrow = `
const useMyHook = () => {
  return { value: 42 };
};
`;

// 컴포넌트(Component) 버전

// 4. 선언형 컴포넌트 (FunctionDeclaration)
export const componentDeclaration = `
function MyComponent() {
  return <div>Hello, world!</div>;
}
`;

// 5. 표현식 컴포넌트 (FunctionExpression)
export const componentExpression = `
const MyComponent = function() {
  return <div>Hello, world!</div>;
};
`;

// 6. 화살표 함수 컴포넌트 (ArrowFunctionExpression)
export const componentArrow = `
const MyComponent = () => {
  return <div>Hello, world!</div>;
};
`;
