# Day 4: npm 패키지 배포 준비 - TDD 태스크 리스트

## 목표
my-first-mcp를 npm에 배포 가능한 상태로 만들기

## 테스트 목록

### 1. Package.json 구조 검증
- [x] TEST: package.json에 bin 필드가 올바르게 설정되어 있어야 한다
- [x] TEST: package.json에 files 필드가 배포 파일만 포함해야 한다
- [x] TEST: package.json에 repository, homepage 필드가 있어야 한다
- [x] TEST: package.json에 engines 필드로 Node.js 버전이 명시되어야 한다

### 2. 실행 파일 검증
- [x] TEST: dist/index.js 파일 최상단에 shebang이 있어야 한다
- [x] TEST: node dist/index.js로 서버가 정상 시작되어야 한다

### 3. 배포 파일 검증
- [x] TEST: npm pack 결과에 dist/, README.md, LICENSE 포함 확인
- [x] TEST: npm pack 결과에 src/, node_modules/ 미포함 확인

### 4. 문서 검증
- [x] TEST: README.md에 설치 방법이 포함되어야 한다
- [x] TEST: README.md에 Claude Code 연결 방법이 포함되어야 한다

## 진행 상황
- 시작일: 2025-12-03
- 완료일: 2025-12-03
- 상태: ✅ 완료

## 테스트 결과
- 총 테스트: 90개
- 통과: 90개
- 실패: 0개

## 배포 준비 완료
- package.json에 files, repository, homepage, bugs, prepublishOnly 추가
- shebang 설정 확인
- npm pack 테스트 통과
