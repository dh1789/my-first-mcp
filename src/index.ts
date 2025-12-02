#!/usr/bin/env node

/**
 * my-first-mcp: MCP 서버 개발 튜토리얼
 *
 * 이 MCP 서버는 다음 기능을 제공합니다:
 *
 * Tools (Day 1):
 * 1. get_current_time: 현재 시간 조회
 * 2. calculate: 사칙연산 계산기
 * 3. get_random_number: 랜덤 숫자 생성
 * 4. reverse_string: 문자열 뒤집기
 * 5. get_server_info: 서버 정보 조회
 *
 * Resources (Day 2):
 * - server://info: 서버 정보
 * - config://settings: 설정 정보
 * - help://topic/{topic}: 도움말 (동적)
 *
 * Prompts (Day 2):
 * - code-review: 코드 리뷰 템플릿
 * - explain-code: 코드 설명 템플릿
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
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

// Day 2: Resource 로직 import
import {
  getServerInfoResource,
  getConfigResource,
  getHelpTopic,
} from "./resources.js";

// Day 2: Prompt 로직 import
import {
  generateCodeReviewPrompt,
  generateExplainCodePrompt,
} from "./prompts.js";

// Day 3: Project Analyzer 로직 import
import {
  analyzeStructure,
  analyzeDependencies,
  countLines,
} from "./project-analyzer.js";

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

// ============================================
// Day 2: Resources
// ============================================

/**
 * Resource 1: 서버 정보
 *
 * URI: server://info
 */
server.resource(
  "server-info",
  "server://info",
  {
    description: "MCP 서버 정보를 제공합니다",
    mimeType: "application/json",
  },
  async () => {
    const resource = getServerInfoResource();
    return {
      contents: [{
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.content,
      }],
    };
  }
);

/**
 * Resource 2: 설정 정보
 *
 * URI: config://settings
 */
server.resource(
  "config",
  "config://settings",
  {
    description: "서버 설정 정보를 제공합니다",
    mimeType: "application/json",
  },
  async () => {
    const resource = getConfigResource();
    return {
      contents: [{
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.content,
      }],
    };
  }
);

/**
 * Resource 3: 도움말 (동적 Resource Template)
 *
 * URI Template: help://topic/{topic}
 */
server.resource(
  "help",
  new ResourceTemplate("help://topic/{topic}", { list: undefined }),
  {
    description: "토픽별 도움말을 제공합니다 (tools, resources, prompts)",
    mimeType: "text/plain",
  },
  async (uri, { topic }) => {
    const resource = getHelpTopic(topic as string);
    return {
      contents: [{
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.content,
      }],
    };
  }
);

// ============================================
// Day 2: Prompts
// ============================================

/**
 * Prompt 1: 코드 리뷰
 *
 * 코드 리뷰를 요청하는 프롬프트 템플릿
 */
server.prompt(
  "code-review",
  "코드 리뷰를 요청합니다",
  {
    code: z.string().describe("리뷰할 코드"),
    language: z.string().optional().describe("프로그래밍 언어"),
    focusAreas: z.string().optional().describe("집중 리뷰 영역 (쉼표로 구분)"),
  },
  async ({ code, language, focusAreas }) => {
    const result = generateCodeReviewPrompt({ code, language, focusAreas });
    return {
      messages: result.messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    };
  }
);

/**
 * Prompt 2: 코드 설명
 *
 * 코드 설명을 요청하는 프롬프트 템플릿
 */
server.prompt(
  "explain-code",
  "코드 설명을 요청합니다",
  {
    code: z.string().describe("설명할 코드"),
    level: z.enum(["beginner", "intermediate", "advanced"])
      .optional()
      .describe("설명 수준 (beginner, intermediate, advanced)"),
  },
  async ({ code, level }) => {
    const result = generateExplainCodePrompt({
      code,
      level: level as "beginner" | "intermediate" | "advanced" | undefined,
    });
    return {
      messages: result.messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    };
  }
);

// ============================================
// Day 3: Project Analyzer Tools
// ============================================

/**
 * Tool 6: 프로젝트 구조 분석
 *
 * 사용 예시:
 * - "이 프로젝트의 구조를 분석해줘"
 * - "src 폴더 구조 보여줘"
 */
server.tool(
  "analyze_structure",
  "프로젝트 디렉토리 구조를 분석하여 트리 형태로 보여줍니다.",
  {
    path: z.string().describe("분석할 디렉토리 경로"),
    maxDepth: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe("최대 깊이 (1-10). 기본값: 전체"),
    showHidden: z
      .boolean()
      .optional()
      .describe("숨김 파일/폴더 표시 여부. 기본값: false"),
  },
  async ({ path: targetPath, maxDepth, showHidden }) => {
    const result = analyzeStructure(targetPath, { maxDepth, showHidden });

    if (!result.success) {
      return {
        content: [{ type: "text", text: `오류: ${result.error}` }],
        isError: true,
      };
    }

    const statsText = result.stats
      ? `\n\n📊 통계: ${result.stats.totalFiles}개 파일, ${result.stats.totalDirs}개 폴더`
      : "";

    return {
      content: [
        {
          type: "text",
          text: `📁 ${result.path}\n\n${result.tree}${statsText}`,
        },
      ],
    };
  }
);

/**
 * Tool 7: 의존성 분석
 *
 * 사용 예시:
 * - "이 프로젝트의 의존성을 분석해줘"
 * - "package.json 정보 보여줘"
 */
server.tool(
  "analyze_dependencies",
  "프로젝트의 package.json을 분석하여 의존성 정보를 제공합니다.",
  {
    path: z.string().describe("분석할 프로젝트 경로 (package.json이 있는 디렉토리)"),
    includeDevDeps: z
      .boolean()
      .optional()
      .describe("개발 의존성 포함 여부. 기본값: true"),
  },
  async ({ path: targetPath, includeDevDeps }) => {
    const result = analyzeDependencies(targetPath, { includeDevDeps });

    if (!result.success) {
      return {
        content: [{ type: "text", text: `오류: ${result.error}` }],
        isError: true,
      };
    }

    let text = `📦 ${result.name} v${result.version}\n`;
    if (result.description) {
      text += `📝 ${result.description}\n`;
    }

    if (result.dependencies && result.dependencies.length > 0) {
      text += `\n🔗 프로덕션 의존성 (${result.dependencies.length}개):\n`;
      result.dependencies.forEach(dep => {
        text += `  - ${dep.name}: ${dep.version}\n`;
      });
    }

    if (result.devDependencies && result.devDependencies.length > 0) {
      text += `\n🛠️ 개발 의존성 (${result.devDependencies.length}개):\n`;
      result.devDependencies.forEach(dep => {
        text += `  - ${dep.name}: ${dep.version}\n`;
      });
    }

    if (result.scripts && result.scripts.length > 0) {
      text += `\n📜 스크립트 (${result.scripts.length}개):\n`;
      result.scripts.forEach(script => {
        text += `  - ${script.name}: ${script.command}\n`;
      });
    }

    return {
      content: [{ type: "text", text }],
    };
  }
);

/**
 * Tool 8: 코드 라인 수 통계
 *
 * 사용 예시:
 * - "이 프로젝트의 코드 라인 수를 알려줘"
 * - "TypeScript 파일만 라인 수 세줘"
 */
server.tool(
  "count_lines",
  "프로젝트의 코드 라인 수를 분석합니다 (코드/주석/빈줄 분류).",
  {
    path: z.string().describe("분석할 디렉토리 경로"),
    extensions: z
      .array(z.string())
      .optional()
      .describe("분석할 확장자 목록 (예: [\"ts\", \"js\"]). 기본값: 모든 지원 확장자"),
  },
  async ({ path: targetPath, extensions }) => {
    const result = countLines(targetPath, { extensions });

    if (!result.success) {
      return {
        content: [{ type: "text", text: `오류: ${result.error}` }],
        isError: true,
      };
    }

    let text = `📊 코드 라인 통계\n\n`;
    text += `📁 총 파일: ${result.totalFiles}개\n`;
    text += `📝 총 라인: ${result.totalLines}줄\n`;
    text += `  - 코드: ${result.codeLines}줄\n`;
    text += `  - 주석: ${result.commentLines}줄\n`;
    text += `  - 빈줄: ${result.blankLines}줄\n`;

    if (result.byExtension && Object.keys(result.byExtension).length > 0) {
      text += `\n📈 확장자별 통계:\n`;
      Object.entries(result.byExtension)
        .sort((a, b) => b[1].lines - a[1].lines)
        .forEach(([ext, stats]) => {
          text += `  .${ext}: ${stats.files}개 파일, ${stats.lines}줄 (코드: ${stats.codeLines}, 주석: ${stats.commentLines})\n`;
        });
    }

    return {
      content: [{ type: "text", text }],
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
