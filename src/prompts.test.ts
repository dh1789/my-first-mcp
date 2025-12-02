/**
 * Prompt 테스트 - TDD Red Phase
 *
 * Day 2: Prompt 구현 테스트
 * - generateCodeReviewPrompt: 코드 리뷰 프롬프트
 * - generateExplainCodePrompt: 코드 설명 프롬프트
 */

import { describe, it, expect } from "vitest";
import {
  generateCodeReviewPrompt,
  generateExplainCodePrompt,
  type PromptMessage,
} from "./prompts.js";

describe("Prompts", () => {
  describe("generateCodeReviewPrompt", () => {
    it("코드 리뷰 프롬프트를 생성해야 한다", () => {
      const result = generateCodeReviewPrompt({
        code: "function add(a, b) { return a + b; }",
      });

      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBe(1);
      expect(result.messages[0].role).toBe("user");
      expect(result.messages[0].content.type).toBe("text");
    });

    it("코드를 프롬프트에 포함해야 한다", () => {
      const code = "function add(a, b) { return a + b; }";
      const result = generateCodeReviewPrompt({ code });

      expect(result.messages[0].content.text).toContain(code);
    });

    it("프로그래밍 언어를 지정할 수 있어야 한다", () => {
      const result = generateCodeReviewPrompt({
        code: "const x = 1;",
        language: "typescript",
      });

      expect(result.messages[0].content.text).toContain("typescript");
    });

    it("집중 리뷰 영역을 지정할 수 있어야 한다", () => {
      const result = generateCodeReviewPrompt({
        code: "const x = 1;",
        focusAreas: "성능, 보안",
      });

      expect(result.messages[0].content.text).toContain("성능, 보안");
    });

    it("기본값 없이도 동작해야 한다", () => {
      const result = generateCodeReviewPrompt({
        code: "x = 1",
      });

      expect(result.messages[0].content.text).toBeDefined();
      expect(result.messages[0].content.text.length).toBeGreaterThan(0);
    });

    it("리뷰 요청 형식을 포함해야 한다", () => {
      const result = generateCodeReviewPrompt({
        code: "const x = 1;",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("코드 품질");
      expect(text).toContain("개선");
    });
  });

  describe("generateExplainCodePrompt", () => {
    it("코드 설명 프롬프트를 생성해야 한다", () => {
      const result = generateExplainCodePrompt({
        code: "const x = 1;",
      });

      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBe(1);
      expect(result.messages[0].role).toBe("user");
    });

    it("코드를 프롬프트에 포함해야 한다", () => {
      const code = "function multiply(a, b) { return a * b; }";
      const result = generateExplainCodePrompt({ code });

      expect(result.messages[0].content.text).toContain(code);
    });

    it("beginner 수준을 지원해야 한다", () => {
      const result = generateExplainCodePrompt({
        code: "const x = 1;",
        level: "beginner",
      });

      expect(result.messages[0].content.text).toContain("초보자");
    });

    it("intermediate 수준을 지원해야 한다", () => {
      const result = generateExplainCodePrompt({
        code: "const x = 1;",
        level: "intermediate",
      });

      expect(result.messages[0].content.text).toContain("기본");
    });

    it("advanced 수준을 지원해야 한다", () => {
      const result = generateExplainCodePrompt({
        code: "const x = 1;",
        level: "advanced",
      });

      expect(result.messages[0].content.text).toContain("숙련");
    });

    it("기본값으로 intermediate 수준을 사용해야 한다", () => {
      const result = generateExplainCodePrompt({
        code: "const x = 1;",
      });

      expect(result.messages[0].content.text).toContain("기본");
    });

    it("설명 형식을 포함해야 한다", () => {
      const result = generateExplainCodePrompt({
        code: "const x = 1;",
      });

      const text = result.messages[0].content.text;
      expect(text).toContain("목적");
      expect(text).toContain("설명");
    });
  });
});
