/**
 * Resource 테스트 - TDD Red Phase
 *
 * Day 2: Resource 구현 테스트
 * - getServerInfoResource: 서버 정보 Resource
 * - getConfigResource: 설정 Resource
 * - getHelpTopic: 동적 Help Resource
 */

import { describe, it, expect } from "vitest";
import {
  getServerInfoResource,
  getConfigResource,
  getHelpTopic,
  type ResourceContent,
} from "./resources.js";

describe("Resources", () => {
  describe("getServerInfoResource", () => {
    it("서버 정보를 JSON 형식으로 반환해야 한다", () => {
      const result = getServerInfoResource();

      expect(result.uri).toBe("server://info");
      expect(result.mimeType).toBe("application/json");
      expect(result.content).toBeDefined();

      const parsed = JSON.parse(result.content);
      expect(parsed.name).toBe("my-first-mcp");
      expect(parsed.version).toBe("1.0.0");
    });

    it("capabilities 정보를 포함해야 한다", () => {
      const result = getServerInfoResource();
      const parsed = JSON.parse(result.content);

      expect(parsed.capabilities).toBeDefined();
      expect(parsed.capabilities.tools).toBe(true);
      expect(parsed.capabilities.resources).toBe(true);
      expect(parsed.capabilities.prompts).toBe(true);
    });

    it("tools 목록을 포함해야 한다", () => {
      const result = getServerInfoResource();
      const parsed = JSON.parse(result.content);

      expect(parsed.tools).toBeDefined();
      expect(Array.isArray(parsed.tools)).toBe(true);
      expect(parsed.tools.length).toBeGreaterThan(0);
    });
  });

  describe("getConfigResource", () => {
    it("설정 정보를 JSON 형식으로 반환해야 한다", () => {
      const result = getConfigResource();

      expect(result.uri).toBe("config://settings");
      expect(result.mimeType).toBe("application/json");
      expect(result.content).toBeDefined();
    });

    it("기본 설정값을 포함해야 한다", () => {
      const result = getConfigResource();
      const parsed = JSON.parse(result.content);

      expect(parsed.timezone).toBe("Asia/Seoul");
      expect(parsed.language).toBe("ko");
    });

    it("features 설정을 포함해야 한다", () => {
      const result = getConfigResource();
      const parsed = JSON.parse(result.content);

      expect(parsed.features).toBeDefined();
      expect(parsed.features.calculation).toBe(true);
      expect(parsed.features.timeQuery).toBe(true);
      expect(parsed.features.stringManipulation).toBe(true);
    });

    it("limits 설정을 포함해야 한다", () => {
      const result = getConfigResource();
      const parsed = JSON.parse(result.content);

      expect(parsed.limits).toBeDefined();
      expect(parsed.limits.maxRandomNumber).toBe(1000);
      expect(parsed.limits.maxStringLength).toBe(10000);
    });
  });

  describe("getHelpTopic", () => {
    it("tools 토픽에 대한 도움말을 반환해야 한다", () => {
      const result = getHelpTopic("tools");

      expect(result.uri).toBe("help://topic/tools");
      expect(result.mimeType).toBe("text/plain");
      expect(result.content).toContain("get_current_time");
      expect(result.content).toContain("calculate");
    });

    it("resources 토픽에 대한 도움말을 반환해야 한다", () => {
      const result = getHelpTopic("resources");

      expect(result.uri).toBe("help://topic/resources");
      expect(result.content).toContain("server://info");
      expect(result.content).toContain("config://settings");
    });

    it("prompts 토픽에 대한 도움말을 반환해야 한다", () => {
      const result = getHelpTopic("prompts");

      expect(result.uri).toBe("help://topic/prompts");
      expect(result.content).toContain("code-review");
      expect(result.content).toContain("explain-code");
    });

    it("알 수 없는 토픽에 대해 에러 메시지를 반환해야 한다", () => {
      const result = getHelpTopic("unknown");

      expect(result.uri).toBe("help://topic/unknown");
      expect(result.content).toContain("알 수 없는 토픽");
      expect(result.content).toContain("tools, resources, prompts");
    });
  });
});
