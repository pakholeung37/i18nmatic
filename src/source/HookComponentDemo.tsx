// src/demo/HookComponentDemo.tsx
import React from "react";

// 사용자 정의 훅 예제
export const useCustomHook = () => {
  return "안녕하세요";
};

// 훅을 사용하는 함수형 컴포넌트 예제
export const CustomComponent = () => {
  const value = useCustomHook();
  return <div>{value}</div>;
};

// 일반 함수 예제 (컴포넌트가 아님)
export const helperFunction = () => {
  return 42;
};
