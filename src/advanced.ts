/**
 * Day 5: 고급 패턴과 최적화
 *
 * 이 모듈은 프로덕션 레벨 MCP 서버를 위한 고급 기능을 제공합니다:
 * 1. Cache 클래스 - TTL 기반 인메모리 캐싱
 * 2. 보안 검증 - 경로 검증, 민감 정보 필터링
 * 3. 로깅 시스템 - 레벨별 로깅
 * 4. 서버 상태 조회
 */

import * as path from "path";
import { z } from "zod";

// ============================================
// Cache 클래스 (인메모리 캐싱)
// ============================================

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * TTL 기반 인메모리 캐시
 *
 * @example
 * const cache = new Cache<string>(300); // 5분 TTL
 * cache.set("key", "value");
 * cache.get("key"); // "value"
 */
export class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  /**
   * @param ttlSeconds TTL (초 단위). 기본값: 300초 (5분)
   */
  constructor(ttlSeconds: number = 300) {
    this.defaultTTL = ttlSeconds * 1000;
  }

  /**
   * 캐시에 값 저장
   *
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param ttl 커스텀 TTL (밀리초). 생략 시 기본 TTL 사용
   */
  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { data, expiry });
  }

  /**
   * 캐시에서 값 조회
   *
   * @param key 캐시 키
   * @returns 캐시된 값. 만료되었거나 없으면 null
   */
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiry) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 캐시된 항목 수
   */
  get size(): number {
    return this.store.size;
  }
}

// ============================================
// 보안 검증
// ============================================

/**
 * 안전한 경로 검증 스키마
 *
 * - 상위 디렉토리 참조(..) 금지
 * - 절대 경로(/) 금지
 * - 최소 1자, 최대 500자
 */
export const safePathSchema = z
  .string()
  .min(1)
  .max(500)
  .refine(
    (p) => !p.includes(".."),
    "상위 디렉토리 참조(..)는 허용되지 않습니다"
  )
  .refine(
    (p) => !p.startsWith("/"),
    "절대 경로는 허용되지 않습니다"
  );

/**
 * GitHub 사용자명 검증 스키마
 *
 * - 1-39자
 * - 알파벳, 숫자, 하이픈만 허용
 * - 하이픈으로 시작/끝 불가
 */
export const githubUsernameSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    "유효하지 않은 GitHub 사용자명입니다"
  );

/**
 * 경로 이탈 방지 검증
 *
 * @param basePath 베이스 경로
 * @param targetPath 검증할 대상 경로
 * @returns 검증된 절대 경로
 * @throws 경로 이탈 시도 시 에러
 */
export function validatePath(basePath: string, targetPath: string): string {
  // 절대 경로로 변환
  const resolved = path.resolve(basePath, targetPath);

  // 베이스 경로 내부인지 확인
  if (!resolved.startsWith(path.resolve(basePath))) {
    throw new Error("경로 이탈 시도가 감지되었습니다");
  }

  return resolved;
}

/**
 * 민감 정보 필터링 패턴
 */
const sensitivePatterns = [
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /secret\s*[:=]\s*['"][^'"]+['"]/gi,
  /token\s*[:=]\s*['"][^'"]+['"]/gi,
];

/**
 * 민감 정보 마스킹
 *
 * @param content 원본 콘텐츠
 * @returns 민감 정보가 마스킹된 콘텐츠
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;
  for (const pattern of sensitivePatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized;
}

// ============================================
// 로깅 시스템
// ============================================

/**
 * 로그 레벨
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// 환경 변수에서 로그 레벨 설정
const currentLogLevel: LogLevel = process.env.LOG_LEVEL
  ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO
  : LogLevel.INFO;

/**
 * 로그 출력
 *
 * @param level 로그 레벨
 * @param message 로그 메시지
 * @param data 추가 데이터 (선택)
 */
export function log(level: LogLevel, message: string, data?: unknown): void {
  if (level < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  const logMessage = `[${timestamp}] [${levelName}] ${message}`;

  if (data) {
    console.error(logMessage, JSON.stringify(data));
  } else {
    console.error(logMessage);
  }
}

// ============================================
// 서버 상태 조회
// ============================================

/**
 * 서버 상태 정보 타입
 */
export interface ServerStatus {
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  nodeVersion: string;
}

/**
 * 서버 상태 조회
 *
 * @returns 서버 상태 정보
 */
export function getServerStatus(): ServerStatus {
  const memoryUsage = process.memoryUsage();

  return {
    uptime: process.uptime(),
    memory: {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      rss: memoryUsage.rss,
    },
    nodeVersion: process.version,
  };
}
