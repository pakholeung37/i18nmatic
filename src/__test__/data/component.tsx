// 한글 테스트용 모음

// 1. 함수 선언문 + JSX 안에 직접 한글
function HelloComponent() {
  return <div>안녕하세요</div>;
}

// 2. 함수 선언문 + 변수에 한글 String Literal 할당
function HelloWorldComponent() {
  const text = "안녕하세요";
  return <div>{text}</div>;
}

// 3. 암시적 반환 Arrow Function (화살표 함수) + JSX 안에 한글
//    -> 블록문이 없어, 암시적 반환 테스트 가능
const AnotherComponent = () => <span>안녕하세요 스팬입니다</span>;

// 4. 명시적 반환 Arrow Function + JSXText/Attribute 한글
const AnotherComponent2 = () => {
  return <input type="text" placeholder="안녕하세요 여기에 입력해 주세요" />;
};

// 5. 함수 선언문 + 조건식(삼항 연산자) 내부 한글
function ConditionalComponent({ isKorean }) {
  return <div>{isKorean ? "안녕하세요" : "Hello"}</div>;
}

// 6. 템플릿 리터럴 + 한글
function TemplateLiteralComponent({ name }) {
  // 예: `${name}님 안녕하세요`
  //    `${user.name}님 ${time}에 만나요` 같은 패턴 테스트 가능
  return <p>{`${name}님 안녕하세요`}</p>;
}

// 7. Arrow Function + 여러 String Literal이 한글
const MultipleStringLiterals = () => {
  const greeting = "안녕하세요";
  const message = "반갑습니다";
  return <p>{greeting + ", " + message}</p>;
};

// 8. 함수 표현식 + JSXText 한글
const ExpressionComponent = function () {
  return <p>표현식 컴포넌트: 안녕하세요</p>;
};

// 9. 함수 선언문 + 여러 한글이 섞인 조건식 + 템플릿 리터럴
function ComplexConditional({ isMorning, user }) {
  // 삼항 연산자 + 템플릿 리터럴
  // 한국어 / 영어 혼합
  const timeStr = isMorning ? "아침" : "오후";
  return <div>{`${user.name}님, 지금은 ${timeStr}입니다. Hello!`}</div>;
}

// 10. 내부 중첩 함수에도 한글이 있는 경우
//     (최상위 함수인지 아닌지 판단용)
const NestedFunction = () => {
  // 최상위가 아닌 내부 함수
  function inner() {
    // 한글 String Literal
    return "이건 내부 함수의 한글";
  }
  return <div>{inner()}</div>;
};

// 11. 한글이 전혀 없는 컴포넌트 (변환되지 않아야 함)
function NoKoreanComponent() {
  return <div>Hello only, no Korean here</div>;
}

// 12. 암시적 반환 Arrow Function + JSXText + 삼항연산자 동시
const ComplexArrow = ({ isHello }) =>
  isHello ? <div>안녕하세요 - 삼항연산자</div> : <div>Hello - ternary</div>;

// 13. 함수 선언문 + JSX Attribute 2개
function DoubleAttributeComponent() {
  return (
    <section title="안녕하세요 타이틀" aria-label="한글 라벨">
      <p>한글 paragraph</p>
    </section>
  );
}

// 14. 화살표 함수 + 복합 템플릿 리터럴 (표현식, 한글, 영어 혼합)
//    ex) `${user.name}님, 오늘은 ${date} 입니다. Have a good day!`
const MixedTemplate = ({ user, date }) => (
  <div>{`${user.name}님, 오늘은 ${date} 입니다. Have a good day!`}</div>
);

// 15. (옵션) 함수 선언문 + JSX + Template Literal 내부에 TSType (타입 정보)
//    -> 실무에서 타입이 혼합될 수 있는 케이스 (아주 드묾)
//    -> 여기서 작성해두면 TSType 스킵 로직도 테스트 가능
function TypeAnnotatedTemplate<T>(value: T) {
  // 예: `${value as string}님 - 한글`
  return <div>{`${value as string}님 - 한글`}</div>;
}

/**
 * 위 16가지 함수/컴포넌트는
 * 1) 함수 선언문
 * 2) 함수 표현식
 * 3) 화살표 함수 (암시적/명시적 반환)
 * 4) 삼항 연산자
 * 5) 템플릿 리터럴
 * 6) JSXText / JSX Attribute
 * 7) 여러 String Literal
 * 8) 내부 중첩 함수
 * 9) TypeScript 타입 (아주 드문 케이스)
 * 등에 대한 한글 포함 사례를 커버합니다.
 *
 * - 이 파일 전체를 Babel로 파싱한 뒤, 한꺼번에 테스트하면
 *   대부분의 한글 변환 케이스를 한 번에 확인할 수 있습니다.
 */
