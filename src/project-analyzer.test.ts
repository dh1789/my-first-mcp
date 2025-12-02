/**
 * 프로젝트 분석 테스트 - TDD Red Phase
 *
 * Day 3: 프로젝트 분석 Tool 테스트
 * - analyzeStructure: 디렉토리 구조 분석
 * - analyzeDependencies: package.json 의존성 분석
 * - countLines: 코드 라인 수 통계
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  analyzeStructure,
  analyzeDependencies,
  countLines,
  type StructureResult,
  type DependencyResult,
  type LineCountResult,
} from "./project-analyzer.js";

// 테스트용 임시 디렉토리 생성
const TEST_DIR = path.join(process.cwd(), "test-project-temp");

beforeAll(() => {
  // 테스트 디렉토리 구조 생성
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, "src"), { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, "tests"), { recursive: true });

  // 테스트 파일 생성
  fs.writeFileSync(
    path.join(TEST_DIR, "package.json"),
    JSON.stringify({
      name: "test-project",
      version: "1.0.0",
      description: "Test project for analyzer",
      dependencies: {
        "express": "^4.18.0",
        "lodash": "^4.17.0",
      },
      devDependencies: {
        "typescript": "^5.0.0",
        "vitest": "^2.0.0",
      },
      scripts: {
        "build": "tsc",
        "test": "vitest",
      },
    }, null, 2)
  );

  // TypeScript 소스 파일 생성
  fs.writeFileSync(
    path.join(TEST_DIR, "src", "index.ts"),
    `// Main entry point
import { helper } from "./helper";

/**
 * Main function
 */
export function main() {
  console.log("Hello");
  return helper();
}

main();
`
  );

  fs.writeFileSync(
    path.join(TEST_DIR, "src", "helper.ts"),
    `// Helper module

export function helper() {
  return "helper";
}
`
  );

  // 테스트 파일 생성
  fs.writeFileSync(
    path.join(TEST_DIR, "tests", "index.test.ts"),
    `import { describe, it, expect } from "vitest";
import { main } from "../src/index";

describe("main", () => {
  it("should work", () => {
    expect(main()).toBeDefined();
  });
});
`
  );
});

afterAll(() => {
  // 테스트 디렉토리 정리
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("Project Analyzer", () => {
  describe("analyzeStructure", () => {
    it("디렉토리 구조를 분석해야 한다", () => {
      const result = analyzeStructure(TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.path).toBe(TEST_DIR);
      expect(result.tree).toBeDefined();
    });

    it("src 디렉토리를 포함해야 한다", () => {
      const result = analyzeStructure(TEST_DIR);

      expect(result.tree).toContain("src/");
    });

    it("파일을 포함해야 한다", () => {
      const result = analyzeStructure(TEST_DIR);

      expect(result.tree).toContain("package.json");
      expect(result.tree).toContain("index.ts");
    });

    it("maxDepth를 지정할 수 있어야 한다", () => {
      const result = analyzeStructure(TEST_DIR, { maxDepth: 1 });

      expect(result.success).toBe(true);
      // depth 1이면 하위 파일은 보이지 않아야 함
      expect(result.tree).toContain("src/");
    });

    it("존재하지 않는 경로에 대해 에러를 반환해야 한다", () => {
      const result = analyzeStructure("/nonexistent/path");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("통계 정보를 포함해야 한다", () => {
      const result = analyzeStructure(TEST_DIR);

      expect(result.stats).toBeDefined();
      expect(result.stats?.totalFiles).toBeGreaterThan(0);
      expect(result.stats?.totalDirs).toBeGreaterThan(0);
    });
  });

  describe("analyzeDependencies", () => {
    it("package.json을 분석해야 한다", () => {
      const result = analyzeDependencies(TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.name).toBe("test-project");
      expect(result.version).toBe("1.0.0");
    });

    it("프로덕션 의존성을 반환해야 한다", () => {
      const result = analyzeDependencies(TEST_DIR);

      expect(result.dependencies).toBeDefined();
      expect(result.dependencies?.length).toBe(2);
      expect(result.dependencies).toContainEqual({
        name: "express",
        version: "^4.18.0",
      });
    });

    it("개발 의존성을 반환해야 한다", () => {
      const result = analyzeDependencies(TEST_DIR);

      expect(result.devDependencies).toBeDefined();
      expect(result.devDependencies?.length).toBe(2);
      expect(result.devDependencies).toContainEqual({
        name: "typescript",
        version: "^5.0.0",
      });
    });

    it("스크립트를 반환해야 한다", () => {
      const result = analyzeDependencies(TEST_DIR);

      expect(result.scripts).toBeDefined();
      expect(result.scripts?.length).toBe(2);
    });

    it("package.json이 없는 경로에 대해 에러를 반환해야 한다", () => {
      const result = analyzeDependencies("/nonexistent/path");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("includeDevDeps 옵션이 false면 devDependencies를 제외해야 한다", () => {
      const result = analyzeDependencies(TEST_DIR, { includeDevDeps: false });

      expect(result.success).toBe(true);
      expect(result.devDependencies).toBeUndefined();
    });
  });

  describe("countLines", () => {
    it("코드 라인 수를 계산해야 한다", () => {
      const result = countLines(TEST_DIR);

      expect(result.success).toBe(true);
      expect(result.totalLines).toBeGreaterThan(0);
    });

    it("파일 수를 반환해야 한다", () => {
      const result = countLines(TEST_DIR);

      expect(result.totalFiles).toBeGreaterThan(0);
    });

    it("코드/주석/빈줄을 분류해야 한다", () => {
      const result = countLines(TEST_DIR);

      expect(result.codeLines).toBeDefined();
      expect(result.commentLines).toBeDefined();
      expect(result.blankLines).toBeDefined();
      expect(result.codeLines! + result.commentLines! + result.blankLines!).toBe(result.totalLines);
    });

    it("확장자별 통계를 제공해야 한다", () => {
      const result = countLines(TEST_DIR);

      expect(result.byExtension).toBeDefined();
      expect(result.byExtension?.ts).toBeDefined();
      expect(result.byExtension?.ts.files).toBeGreaterThan(0);
    });

    it("특정 확장자만 분석할 수 있어야 한다", () => {
      const result = countLines(TEST_DIR, { extensions: ["ts"] });

      expect(result.success).toBe(true);
      expect(result.byExtension?.json).toBeUndefined();
    });

    it("존재하지 않는 경로에 대해 에러를 반환해야 한다", () => {
      const result = countLines("/nonexistent/path");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
