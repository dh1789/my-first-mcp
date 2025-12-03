# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-12-04

### Added

- Day 5: 고급 패턴과 최적화
  - `Cache` 클래스: TTL 기반 인메모리 캐싱
  - 보안 검증: `safePathSchema`, `validatePath`, `sanitizeContent`
  - 로깅 시스템: `LogLevel`, `log` 함수
  - `server_status` Tool: 서버 상태 조회 (uptime, 메모리 사용량)
- 30개 유닛 테스트 추가 (총 120개)

## [1.1.0] - 2025-12-02

### Added

- Day 3: 프로젝트 분석기
  - `analyze_structure` Tool: 프로젝트 구조 분석
  - `analyze_dependencies` Tool: 의존성 분석
  - `count_lines` Tool: 코드 라인 수 통계
- Day 2: Resource와 Prompt
  - `server://info`, `config://settings` Resource
  - `help://topic/{topic}` 동적 Resource Template
  - `code-review`, `explain-code` Prompt
- 59개 유닛 테스트 추가 (총 90개)

## [1.0.0] - 2025-11-28

### Added

- Initial release (Day 1: MCP 개념과 첫 서버)
- 5 MCP Tools:
  - `get_current_time`: 현재 시간 조회 (시간대, 포맷 지원)
  - `calculate`: 사칙연산 계산기 (덧셈, 뺄셈, 곱셈, 나눗셈)
  - `get_random_number`: 랜덤 숫자 생성 (범위, 개수 지정)
  - `reverse_string`: 문자열 뒤집기
  - `get_server_info`: 서버 정보 조회
- TDD 기반 유닛 테스트 (31 tests)
- TypeScript 지원
- MCP Inspector 통합
- Claude Code 연동 지원
