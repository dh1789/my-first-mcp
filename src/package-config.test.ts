/**
 * Package.json 배포 설정 검증 테스트 - Day 4 TDD
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

describe("Package.json 배포 설정", () => {
  describe("bin 필드", () => {
    it("bin 필드가 존재해야 한다", () => {
      expect(packageJson.bin).toBeDefined();
    });

    it("bin 필드가 dist/index.js를 가리켜야 한다", () => {
      expect(packageJson.bin["my-first-mcp"]).toBe("dist/index.js");
    });
  });

  describe("files 필드", () => {
    it("files 필드가 존재해야 한다", () => {
      expect(packageJson.files).toBeDefined();
    });

    it("files에 dist가 포함되어야 한다", () => {
      expect(packageJson.files).toContain("dist");
    });

    it("files에 README.md가 포함되어야 한다", () => {
      expect(packageJson.files).toContain("README.md");
    });

    it("files에 LICENSE가 포함되어야 한다", () => {
      expect(packageJson.files).toContain("LICENSE");
    });
  });

  describe("메타데이터 필드", () => {
    it("repository 필드가 존재해야 한다", () => {
      expect(packageJson.repository).toBeDefined();
    });

    it("repository.url이 GitHub URL이어야 한다", () => {
      expect(packageJson.repository.url).toMatch(/github\.com/);
    });

    it("homepage 필드가 존재해야 한다", () => {
      expect(packageJson.homepage).toBeDefined();
    });

    it("bugs 필드가 존재해야 한다", () => {
      expect(packageJson.bugs).toBeDefined();
    });
  });

  describe("engines 필드", () => {
    it("engines 필드가 존재해야 한다", () => {
      expect(packageJson.engines).toBeDefined();
    });

    it("Node.js 20 이상을 요구해야 한다", () => {
      expect(packageJson.engines.node).toMatch(/>=\s*20/);
    });
  });

  describe("prepublishOnly 스크립트", () => {
    it("prepublishOnly 스크립트가 존재해야 한다", () => {
      expect(packageJson.scripts.prepublishOnly).toBeDefined();
    });

    it("prepublishOnly가 빌드를 포함해야 한다", () => {
      expect(packageJson.scripts.prepublishOnly).toMatch(/build/);
    });
  });
});
