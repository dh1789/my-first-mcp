#!/usr/bin/env node

/**
 * my-first-mcp: MCP 서버 개발 튜토리얼
 *
 * 이 MCP 서버는 다음 Tool을 제공합니다:
 * 1. get_current_time: 현재 시간 조회
 * 2. calculate: 사칙연산 계산기
 * 3. get_random_number: 랜덤 숫자 생성
 * 4. reverse_string: 문자열 뒤집기
 * 5. get_server_info: 서버 정보 조회
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 테스트 가능한 핵심 로직 import
import {
  formatTime,
  calculate,
  generateRandomNumbers,
  reverseString,
  getServerInfo,
  type TimeFormat,
  type Operation,
} from "./tools.js";

// MCP 서버 인스턴스 생성
const server = new McpServer({
  name: "my-first-mcp",
  version: "1.0.0",
});

/**
 * Tool 1: 현재 시간 조회
 *
 * 사용 예시:
 * - "지금 몇 시야?"
 * - "서울 시간 알려줘"
 * - "뉴욕 시간은?"
 */
server.tool(
  "get_current_time",
  "현재 날짜와 시간을 반환합니다. 시간대를 지정할 수 있습니다.",
  {
    timezone: z
      .string()
      .optional()
      .describe("시간대 (예: Asia/Seoul, America/New_York). 기본값: Asia/Seoul"),
    format: z
      .enum(["full", "date", "time"])
      .optional()
      .describe("출력 형식: full(전체), date(날짜만), time(시간만). 기본값: full"),
  },
  async ({ timezone, format }) => {
    const result = formatTime(
      new Date(),
      timezone || "Asia/Seoul",
      (format || "full") as TimeFormat
    );

    return {
      content: [
        {
          type: "text",
          text: `현재 시간 (${result.timezone}): ${result.formatted}`,
        },
      ],
    };
  }
);

/**
 * Tool 2: 사칙연산 계산기
 *
 * 사용 예시:
 * - "123 더하기 456 계산해줘"
 * - "100에서 30 빼면?"
 * - "15 곱하기 8은?"
 * - "144를 12로 나누면?"
 */
server.tool(
  "calculate",
  "두 숫자의 사칙연산(덧셈, 뺄셈, 곱셈, 나눗셈)을 수행합니다.",
  {
    a: z.number().describe("첫 번째 숫자"),
    b: z.number().describe("두 번째 숫자"),
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("연산 종류: add(덧셈), subtract(뺄셈), multiply(곱셈), divide(나눗셈)"),
  },
  async ({ a, b, operation }) => {
    const result = calculate(a, b, operation as Operation);

    if (result.isError) {
      return {
        content: [
          {
            type: "text",
            text: result.errorMessage!,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: result.expression,
        },
      ],
    };
  }
);

/**
 * Tool 3: 랜덤 숫자 생성
 *
 * 사용 예시:
 * - "1부터 100 사이 랜덤 숫자"
 * - "주사위 굴려줘" (1-6)
 * - "로또 번호 하나 뽑아줘" (1-45)
 */
server.tool(
  "get_random_number",
  "지정한 범위 내에서 랜덤 정수를 생성합니다.",
  {
    min: z.number().int().describe("최소값 (정수)"),
    max: z.number().int().describe("최대값 (정수)"),
    count: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe("생성할 숫자 개수 (1-10). 기본값: 1"),
  },
  async ({ min, max, count }) => {
    const result = generateRandomNumbers(min, max, count || 1);

    if (result.isError) {
      return {
        content: [
          {
            type: "text",
            text: result.errorMessage!,
          },
        ],
        isError: true,
      };
    }

    const n = result.numbers.length;
    const resultText =
      n === 1
        ? `랜덤 숫자 (${result.min}~${result.max}): ${result.numbers[0]}`
        : `랜덤 숫자 ${n}개 (${result.min}~${result.max}): ${result.numbers.join(", ")}`;

    return {
      content: [
        {
          type: "text",
          text: resultText,
        },
      ],
    };
  }
);

/**
 * Tool 4: 문자열 뒤집기
 *
 * 사용 예시:
 * - "hello 뒤집어줘"
 * - "12345 거꾸로"
 */
server.tool(
  "reverse_string",
  "입력된 문자열을 뒤집어서 반환합니다.",
  {
    text: z.string().min(1).describe("뒤집을 문자열"),
  },
  async ({ text }) => {
    const result = reverseString(text);

    return {
      content: [
        {
          type: "text",
          text: `원본: ${result.original}\n뒤집음: ${result.reversed}`,
        },
      ],
    };
  }
);

/**
 * Tool 5: 서버 정보
 *
 * 사용 예시:
 * - "이 MCP 서버 정보 알려줘"
 */
server.tool(
  "get_server_info",
  "이 MCP 서버의 정보와 사용 가능한 Tool 목록을 반환합니다.",
  {},
  async () => {
    const info = getServerInfo();

    const infoText = `
=== ${info.name} 서버 정보 ===

버전: ${info.version}
설명: ${info.description}

사용 가능한 Tool:
${info.tools.map((t, i) => `${i + 1}. ${t}`).join("\n")}

GitHub: https://github.com/dh1789/my-first-mcp
`.trim();

    return {
      content: [
        {
          type: "text",
          text: infoText,
        },
      ],
    };
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("my-first-mcp 서버가 시작되었습니다.");
}

main().catch((error) => {
  console.error("서버 시작 실패:", error);
  process.exit(1);
});
