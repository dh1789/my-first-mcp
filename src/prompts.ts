/**
 * Prompt 핵심 로직 - Day 2
 *
 * MCP 서버의 Prompt 기능:
 * - code-review: 코드 리뷰 요청 템플릿
 * - explain-code: 코드 설명 요청 템플릿
 */

/**
 * Prompt 메시지 콘텐츠 타입
 */
export interface PromptContent {
  type: "text";
  text: string;
}

/**
 * Prompt 메시지 타입
 */
export interface PromptMessage {
  role: "user" | "assistant";
  content: PromptContent;
}

/**
 * Prompt 결과 타입
 */
export interface PromptResult {
  messages: PromptMessage[];
}

/**
 * 코드 리뷰 프롬프트 입력 타입
 */
export interface CodeReviewInput {
  code: string;
  language?: string;
  focusAreas?: string;
}

/**
 * 코드 설명 프롬프트 입력 타입
 */
export interface ExplainCodeInput {
  code: string;
  level?: "beginner" | "intermediate" | "advanced";
}

/**
 * 코드 리뷰 프롬프트 생성
 *
 * 코드 리뷰를 요청하는 프롬프트를 생성합니다.
 *
 * @param input - 코드 리뷰 입력
 * @returns 프롬프트 메시지
 */
export function generateCodeReviewPrompt(input: CodeReviewInput): PromptResult {
  const { code, language, focusAreas } = input;
  const lang = language || "알 수 없음";
  const focus = focusAreas || "전반적인 코드 품질";

  const text = `다음 ${lang} 코드를 리뷰해주세요.

## 집중 리뷰 영역
${focus}

## 코드
\`\`\`${language || ""}
${code}
\`\`\`

## 리뷰 요청 사항
1. 코드 품질 점수 (1-10)
2. 개선이 필요한 부분
3. 잘 작성된 부분
4. 구체적인 개선 제안
`;

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text,
        },
      },
    ],
  };
}

/**
 * 코드 설명 프롬프트 생성
 *
 * 코드 설명을 요청하는 프롬프트를 생성합니다.
 *
 * @param input - 코드 설명 입력
 * @returns 프롬프트 메시지
 */
export function generateExplainCodePrompt(input: ExplainCodeInput): PromptResult {
  const { code, level = "intermediate" } = input;

  const levelText: Record<string, string> = {
    beginner: "프로그래밍 초보자도 이해할 수 있도록 쉽게",
    intermediate: "기본적인 프로그래밍 지식을 가진 사람을 위해",
    advanced: "숙련된 개발자를 위해 심층적으로",
  };

  const explanation = levelText[level];

  const text = `다음 코드를 ${explanation} 설명해주세요.

\`\`\`
${code}
\`\`\`

## 설명 형식
1. 코드의 목적
2. 주요 로직 단계별 설명
3. 사용된 패턴이나 기법
4. 주의할 점
`;

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text,
        },
      },
    ],
  };
}
