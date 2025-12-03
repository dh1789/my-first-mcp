/**
 * Day 5: 고급 패턴 테스트
 *
 * 테스트 대상:
 * 1. Cache 클래스 (인메모리 캐싱)
 * 2. 보안 검증 (경로 검증, 민감 정보 필터링)
 * 3. 로깅 시스템
 * 4. 서버 상태 조회
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  Cache,
  validatePath,
  sanitizeContent,
  LogLevel,
  log,
  getServerStatus,
  safePathSchema,
  githubUsernameSchema,
} from "./advanced.js";

// ============================================
// Cache 클래스 테스트
// ============================================
describe("Cache", () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>(1); // 1초 TTL
  });

  describe("set과 get", () => {
    it("값을 저장하고 조회할 수 있어야 한다", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("존재하지 않는 키는 null을 반환해야 한다", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("커스텀 TTL을 지정할 수 있어야 한다", () => {
      cache.set("key2", "value2", 5000); // 5초 TTL
      expect(cache.get("key2")).toBe("value2");
    });
  });

  describe("TTL 만료", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("TTL이 만료되면 null을 반환해야 한다", () => {
      cache.set("expiring", "will-expire");
      expect(cache.get("expiring")).toBe("will-expire");

      // 1.1초 후 (TTL 1초 초과)
      vi.advanceTimersByTime(1100);
      expect(cache.get("expiring")).toBeNull();
    });

    it("TTL 내에서는 값을 유지해야 한다", () => {
      cache.set("valid", "still-valid");

      // 0.5초 후 (TTL 1초 미만)
      vi.advanceTimersByTime(500);
      expect(cache.get("valid")).toBe("still-valid");
    });
  });

  describe("clear", () => {
    it("모든 캐시를 삭제해야 한다", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
    });
  });

  describe("cleanup", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("만료된 항목만 삭제해야 한다", () => {
      cache.set("short", "short-lived", 500); // 0.5초 TTL
      cache.set("long", "long-lived", 2000); // 2초 TTL

      vi.advanceTimersByTime(700); // 0.7초 후
      cache.cleanup();

      expect(cache.get("short")).toBeNull(); // 만료됨
      expect(cache.get("long")).toBe("long-lived"); // 유지됨
    });
  });

  describe("size", () => {
    it("캐시된 항목 수를 반환해야 한다", () => {
      expect(cache.size).toBe(0);

      cache.set("key1", "value1");
      expect(cache.size).toBe(1);

      cache.set("key2", "value2");
      expect(cache.size).toBe(2);
    });
  });
});

// ============================================
// 보안 검증 테스트
// ============================================
describe("보안 검증", () => {
  describe("safePathSchema", () => {
    it("유효한 경로를 허용해야 한다", () => {
      expect(safePathSchema.safeParse("src/index.ts").success).toBe(true);
      expect(safePathSchema.safeParse("package.json").success).toBe(true);
    });

    it("상위 디렉토리 참조(..)를 거부해야 한다", () => {
      const result = safePathSchema.safeParse("../etc/passwd");
      expect(result.success).toBe(false);
    });

    it("절대 경로(/)를 거부해야 한다", () => {
      const result = safePathSchema.safeParse("/etc/passwd");
      expect(result.success).toBe(false);
    });

    it("빈 문자열을 거부해야 한다", () => {
      const result = safePathSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });

  describe("githubUsernameSchema", () => {
    it("유효한 GitHub 사용자명을 허용해야 한다", () => {
      expect(githubUsernameSchema.safeParse("dh1789").success).toBe(true);
      expect(githubUsernameSchema.safeParse("octocat").success).toBe(true);
      expect(githubUsernameSchema.safeParse("user-name").success).toBe(true);
    });

    it("잘못된 사용자명을 거부해야 한다", () => {
      expect(githubUsernameSchema.safeParse("-invalid").success).toBe(false);
      expect(githubUsernameSchema.safeParse("invalid-").success).toBe(false);
      expect(githubUsernameSchema.safeParse("in--valid").success).toBe(true); // 연속 하이픈은 허용
    });

    it("40자 이상을 거부해야 한다", () => {
      const longName = "a".repeat(40);
      expect(githubUsernameSchema.safeParse(longName).success).toBe(false);
    });
  });

  describe("validatePath", () => {
    it("베이스 경로 내의 경로를 허용해야 한다", () => {
      const result = validatePath("/project", "src/index.ts");
      expect(result).toBe("/project/src/index.ts");
    });

    it("경로 이탈 시도를 감지하고 에러를 던져야 한다", () => {
      expect(() => validatePath("/project", "../etc/passwd")).toThrow(
        "경로 이탈 시도가 감지되었습니다"
      );
    });

    it("복잡한 경로 이탈 시도도 감지해야 한다", () => {
      expect(() =>
        validatePath("/project", "src/../../../etc/passwd")
      ).toThrow("경로 이탈 시도가 감지되었습니다");
    });
  });

  describe("sanitizeContent", () => {
    it("일반 텍스트는 그대로 반환해야 한다", () => {
      const content = "This is normal content";
      expect(sanitizeContent(content)).toBe(content);
    });

    it("password 패턴을 마스킹해야 한다", () => {
      const content = 'password = "secret123"';
      expect(sanitizeContent(content)).toBe("[REDACTED]");
    });

    it("api_key 패턴을 마스킹해야 한다", () => {
      const content = 'api_key: "sk-1234567890"';
      expect(sanitizeContent(content)).toBe("[REDACTED]");
    });

    it("token 패턴을 마스킹해야 한다", () => {
      const content = 'token = "ghp_xxxxxxxxxxxx"';
      expect(sanitizeContent(content)).toBe("[REDACTED]");
    });

    it("secret 패턴을 마스킹해야 한다", () => {
      const content = "secret: 'my-secret-value'";
      expect(sanitizeContent(content)).toBe("[REDACTED]");
    });

    it("여러 민감 정보를 동시에 마스킹해야 한다", () => {
      const content = `
        password = "pass123"
        api_key: "key456"
        normal_value = "safe"
      `;
      const sanitized = sanitizeContent(content);
      expect(sanitized).toContain("[REDACTED]");
      expect(sanitized).toContain("normal_value");
      expect(sanitized).not.toContain("pass123");
      expect(sanitized).not.toContain("key456");
    });
  });
});

// ============================================
// 로깅 시스템 테스트
// ============================================
describe("로깅 시스템", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("LogLevel", () => {
    it("올바른 로그 레벨 값을 가져야 한다", () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });
  });

  describe("log 함수", () => {
    it("INFO 레벨 로그를 출력해야 한다", () => {
      log(LogLevel.INFO, "테스트 메시지");
      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0]?.[0] as string;
      expect(logOutput).toContain("[INFO]");
      expect(logOutput).toContain("테스트 메시지");
    });

    it("데이터와 함께 로그를 출력해야 한다", () => {
      log(LogLevel.ERROR, "에러 메시지", { key: "value" });
      expect(consoleSpy).toHaveBeenCalled();
      const logArgs = consoleSpy.mock.calls[0];
      expect(logArgs.length).toBe(2); // 메시지 + 데이터
    });

    it("타임스탬프를 포함해야 한다", () => {
      log(LogLevel.WARN, "경고 메시지");
      const logOutput = consoleSpy.mock.calls[0]?.[0] as string;
      // ISO 형식 타임스탬프 확인
      expect(logOutput).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});

// ============================================
// 서버 상태 조회 테스트
// ============================================
describe("getServerStatus", () => {
  it("서버 상태 정보를 반환해야 한다", () => {
    const status = getServerStatus();

    expect(status).toHaveProperty("uptime");
    expect(status).toHaveProperty("memory");
    expect(status).toHaveProperty("nodeVersion");
    expect(typeof status.uptime).toBe("number");
    expect(status.nodeVersion).toMatch(/^v\d+/);
  });

  it("메모리 사용량 정보를 포함해야 한다", () => {
    const status = getServerStatus();

    expect(status.memory).toHaveProperty("heapUsed");
    expect(status.memory).toHaveProperty("heapTotal");
    expect(status.memory).toHaveProperty("rss");
    expect(typeof status.memory.heapUsed).toBe("number");
  });
});
