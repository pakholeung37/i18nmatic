import { KeyLanguage } from '../type'

export function createLanguageCheckFunction(language: KeyLanguage) {
  switch (language) {
    case 'ko':
      return containsKorean
    case 'ja':
      return containsJapanese
    case 'zh':
      return containsChinese
    case 'en':
      return containsEnglish
    default:
      return () => false
  }
}

function containsKorean(text: string): boolean {
  // [가-힣] 범위의 한글 문자를 찾는 정규식
  const koreanRegex = /[가-힣]/
  return koreanRegex.test(text)
}

function containsJapanese(text: string): boolean {
  // 일본어(히라가나, 가타카나, CJK 한자) 범위를 포함하는 정규식
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/
  return japaneseRegex.test(text)
}

// 중국어 검사
function containsChinese(text: string): boolean {
  // 간단히 CJK 통합 한자 범위를 검사 (중국어, 일본어 한자를 포함)
  const chineseRegex = /[\u4E00-\u9FFF]/
  return chineseRegex.test(text)
}

// 영어(알파벳) 검사
function containsEnglish(text: string): boolean {
  // 기본 알파벳 범위만 검사 (A-Z, a-z)
  const englishRegex = /[A-Za-z]/
  return englishRegex.test(text)
}
