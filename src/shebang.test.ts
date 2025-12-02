/**
 * Shebang 및 실행 파일 검증 테스트 - Day 4 TDD
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("실행 파일 설정", () => {
  describe("소스 파일 shebang", () => {
    it("src/index.ts 최상단에 shebang이 있어야 한다", () => {
      const indexPath = path.join(__dirname, "index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");
      const firstLine = content.split("\n")[0];
      expect(firstLine).toBe("#!/usr/bin/env node");
    });
  });

  describe("빌드 결과물", () => {
    it("dist/index.js 파일이 존재해야 한다", () => {
      const distPath = path.join(__dirname, "..", "dist", "index.js");
      expect(fs.existsSync(distPath)).toBe(true);
    });

    it("dist/index.js 최상단에 shebang이 있어야 한다", () => {
      const distPath = path.join(__dirname, "..", "dist", "index.js");
      const content = fs.readFileSync(distPath, "utf-8");
      const firstLine = content.split("\n")[0];
      expect(firstLine).toBe("#!/usr/bin/env node");
    });
  });
});
