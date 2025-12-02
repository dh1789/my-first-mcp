/**
 * Resource 핵심 로직 - Day 2
 *
 * MCP 서버의 Resource 기능:
 * - 정적 Resource: 서버 정보, 설정
 * - 동적 Resource: Help 토픽 (Resource Template)
 */

/**
 * Resource 콘텐츠 타입
 */
export interface ResourceContent {
  uri: string;
  mimeType: string;
  content: string;
}

/**
 * 서버 정보 Resource
 *
 * URI: server://info
 * 서버의 기본 정보, 버전, 기능 목록을 제공합니다.
 */
export function getServerInfoResource(): ResourceContent {
  const serverInfo = {
    name: "my-first-mcp",
    version: "1.0.0",
    description: "MCP 서버 개발 튜토리얼 프로젝트",
    author: "idongho",
    tools: [
      "get_current_time",
      "calculate",
      "get_random_number",
      "reverse_string",
      "get_server_info",
    ],
    resources: [
      "server://info",
      "config://settings",
      "help://topic/{topic}",
    ],
    prompts: [
      "code-review",
      "explain-code",
    ],
    capabilities: {
      tools: true,
      resources: true,
      prompts: true,
    },
  };

  return {
    uri: "server://info",
    mimeType: "application/json",
    content: JSON.stringify(serverInfo, null, 2),
  };
}

/**
 * 설정 Resource
 *
 * URI: config://settings
 * 서버의 현재 설정값을 제공합니다.
 */
export function getConfigResource(): ResourceContent {
  const config = {
    timezone: "Asia/Seoul",
    language: "ko",
    features: {
      calculation: true,
      timeQuery: true,
      stringManipulation: true,
    },
    limits: {
      maxRandomNumber: 1000,
      maxStringLength: 10000,
    },
  };

  return {
    uri: "config://settings",
    mimeType: "application/json",
    content: JSON.stringify(config, null, 2),
  };
}

/**
 * Help 토픽 Resource (동적)
 *
 * URI Template: help://topic/{topic}
 * 사용 가능한 토픽: tools, resources, prompts
 */
export function getHelpTopic(topic: string): ResourceContent {
  const helpTopics: Record<string, string> = {
    tools: `## 사용 가능한 Tool 목록

1. **get_current_time**: 현재 시간을 조회합니다
   - timezone: 시간대 (예: Asia/Seoul)
   - format: 출력 형식 (full, date, time)

2. **calculate**: 사칙연산을 수행합니다
   - a: 첫 번째 숫자
   - b: 두 번째 숫자
   - operation: add, subtract, multiply, divide

3. **get_random_number**: 랜덤 숫자를 생성합니다
   - min: 최소값
   - max: 최대값
   - count: 생성할 개수 (1-10)

4. **reverse_string**: 문자열을 뒤집습니다
   - text: 뒤집을 문자열

5. **get_server_info**: 서버 정보를 조회합니다`,

    resources: `## Resource 목록

1. **server://info**: MCP 서버 정보
   - 서버 이름, 버전, 기능 목록

2. **config://settings**: 서버 설정
   - 시간대, 언어, 기능 설정

3. **help://topic/{topic}**: 도움말
   - 사용 가능한 토픽: tools, resources, prompts`,

    prompts: `## Prompt 템플릿 목록

1. **code-review**: 코드 리뷰 요청 템플릿
   - code: 리뷰할 코드
   - language: 프로그래밍 언어 (선택)
   - focusAreas: 집중 리뷰 영역 (선택)

2. **explain-code**: 코드 설명 요청 템플릿
   - code: 설명할 코드
   - level: 설명 수준 (beginner, intermediate, advanced)`,
  };

  const content = helpTopics[topic] ||
    `알 수 없는 토픽입니다. 사용 가능한 토픽: tools, resources, prompts`;

  return {
    uri: `help://topic/${topic}`,
    mimeType: "text/plain",
    content,
  };
}
