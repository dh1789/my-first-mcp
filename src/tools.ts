/**
 * MCP Tool 핵심 로직 (테스트 가능한 순수 함수)
 */

// ============================================
// Tool 1: 현재 시간 조회
// ============================================
export type TimeFormat = "full" | "date" | "time";

export interface TimeResult {
  formatted: string;
  timezone: string;
}

export function formatTime(
  date: Date,
  timezone: string = "Asia/Seoul",
  format: TimeFormat = "full"
): TimeResult {
  let options: Intl.DateTimeFormatOptions = { timeZone: timezone };

  switch (format) {
    case "date":
      options = { ...options, dateStyle: "full" };
      break;
    case "time":
      options = { ...options, timeStyle: "long" };
      break;
    case "full":
    default:
      options = { ...options, dateStyle: "full", timeStyle: "long" };
      break;
  }

  const formatted = date.toLocaleString("ko-KR", options);
  return { formatted, timezone };
}

// ============================================
// Tool 2: 사칙연산 계산기
// ============================================
export type Operation = "add" | "subtract" | "multiply" | "divide";

export interface CalculateResult {
  result: number;
  expression: string;
  isError: boolean;
  errorMessage?: string;
}

export function calculate(
  a: number,
  b: number,
  operation: Operation
): CalculateResult {
  const symbols: Record<Operation, string> = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "÷",
  };

  if (operation === "divide" && b === 0) {
    return {
      result: NaN,
      expression: `${a} ${symbols[operation]} ${b}`,
      isError: true,
      errorMessage: "오류: 0으로 나눌 수 없습니다.",
    };
  }

  let result: number;
  switch (operation) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      result = a / b;
      break;
  }

  return {
    result,
    expression: `${a} ${symbols[operation]} ${b} = ${result}`,
    isError: false,
  };
}

// ============================================
// Tool 3: 랜덤 숫자 생성
// ============================================
export interface RandomResult {
  numbers: number[];
  min: number;
  max: number;
  isError: boolean;
  errorMessage?: string;
}

export function generateRandomNumbers(
  min: number,
  max: number,
  count: number = 1
): RandomResult {
  if (min > max) {
    return {
      numbers: [],
      min,
      max,
      isError: true,
      errorMessage: "오류: 최소값이 최대값보다 큽니다.",
    };
  }

  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.push(randomNum);
  }

  return {
    numbers,
    min,
    max,
    isError: false,
  };
}

// ============================================
// Tool 4: 문자열 뒤집기
// ============================================
export interface ReverseResult {
  original: string;
  reversed: string;
}

export function reverseString(text: string): ReverseResult {
  const reversed = text.split("").reverse().join("");
  return {
    original: text,
    reversed,
  };
}

// ============================================
// Tool 5: 서버 정보
// ============================================
export interface ServerInfo {
  name: string;
  version: string;
  description: string;
  tools: string[];
}

export function getServerInfo(): ServerInfo {
  return {
    name: "my-first-mcp",
    version: "1.0.0",
    description: "MCP 서버 개발 튜토리얼 - 첫 번째 MCP 서버",
    tools: [
      "get_current_time - 현재 시간 조회",
      "calculate - 사칙연산 계산기",
      "get_random_number - 랜덤 숫자 생성",
      "reverse_string - 문자열 뒤집기",
      "get_server_info - 서버 정보 조회",
    ],
  };
}
