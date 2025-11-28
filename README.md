# my-first-mcp

MCP(Model Context Protocol) 서버 개발 튜토리얼 - 첫 번째 MCP 서버

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

## 소개

이 프로젝트는 MCP(Model Context Protocol) 서버 개발을 배우기 위한 튜토리얼입니다. Claude Code와 같은 AI 도구에서 사용할 수 있는 간단한 MCP 서버를 구현합니다.

### 제공 Tool

| Tool | 설명 | 사용 예시 |
|------|------|----------|
| `get_current_time` | 현재 시간 조회 | "지금 몇 시야?" |
| `calculate` | 사칙연산 계산기 | "123 + 456 계산해줘" |
| `get_random_number` | 랜덤 숫자 생성 | "로또 번호 뽑아줘" |
| `reverse_string` | 문자열 뒤집기 | "hello 뒤집어줘" |
| `get_server_info` | 서버 정보 조회 | "MCP 서버 정보" |

## 설치

### 요구사항

- Node.js 20+
- npm 또는 pnpm

### 설치 방법

```bash
# 저장소 클론
git clone https://github.com/dh1789/my-first-mcp.git
cd my-first-mcp

# 의존성 설치
npm install

# 빌드
npm run build
```

## 사용법

### Claude Code에 연결

```bash
# MCP 서버 등록
claude mcp add my-first-mcp -- node /path/to/my-first-mcp/dist/index.js

# 연결 확인
claude mcp list
```

### MCP Inspector로 테스트

```bash
npm run inspect
# 브라우저에서 http://localhost:6274 접속
```

### 직접 실행

```bash
npm start
```

## 개발

### 프로젝트 구조

```
my-first-mcp/
├── src/
│   ├── index.ts      # MCP 서버 진입점
│   ├── tools.ts      # 핵심 로직 (순수 함수)
│   └── tools.test.ts # 유닛 테스트
├── dist/             # 빌드 결과물
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 스크립트

```bash
npm run build     # TypeScript 빌드
npm test          # 유닛 테스트 실행 (31 tests)
npm run test:watch # 테스트 watch 모드
npm run inspect   # MCP Inspector 실행
npm start         # 서버 실행
```

### 테스트

TDD 방식으로 31개 유닛 테스트가 포함되어 있습니다:

```bash
npm test

# 결과
# ✓ src/tools.test.ts (31 tests) 18ms
# Test Files  1 passed (1)
# Tests       31 passed (31)
```

## 기술 스택

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.7
- **MCP SDK**: @modelcontextprotocol/sdk
- **Validation**: zod
- **Testing**: vitest

## 관련 문서

- [MCP 공식 스펙](https://modelcontextprotocol.io/specification)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

## 기여

이슈와 PR을 환영합니다!

1. Fork
2. Feature branch 생성 (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 작성자

- **idongho** - [GitHub](https://github.com/dh1789)
