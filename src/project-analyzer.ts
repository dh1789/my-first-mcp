/**
 * 프로젝트 분석 핵심 로직 - Day 3
 *
 * MCP 서버의 프로젝트 분석 Tool:
 * - analyzeStructure: 디렉토리 구조 분석
 * - analyzeDependencies: package.json 의존성 분석
 * - countLines: 코드 라인 수 통계
 */

import * as fs from "fs";
import * as path from "path";

/**
 * 디렉토리 구조 분석 옵션
 */
export interface StructureOptions {
  maxDepth?: number;
  showHidden?: boolean;
}

/**
 * 디렉토리 통계
 */
export interface DirectoryStats {
  totalFiles: number;
  totalDirs: number;
}

/**
 * 디렉토리 구조 분석 결과
 */
export interface StructureResult {
  success: boolean;
  path: string;
  tree?: string;
  stats?: DirectoryStats;
  error?: string;
}

/**
 * 의존성 정보
 */
export interface DependencyInfo {
  name: string;
  version: string;
}

/**
 * 스크립트 정보
 */
export interface ScriptInfo {
  name: string;
  command: string;
}

/**
 * 의존성 분석 옵션
 */
export interface DependencyOptions {
  includeDevDeps?: boolean;
}

/**
 * 의존성 분석 결과
 */
export interface DependencyResult {
  success: boolean;
  name?: string;
  version?: string;
  description?: string;
  dependencies?: DependencyInfo[];
  devDependencies?: DependencyInfo[];
  scripts?: ScriptInfo[];
  error?: string;
}

/**
 * 라인 수 통계 옵션
 */
export interface LineCountOptions {
  extensions?: string[];
}

/**
 * 확장자별 통계
 */
export interface ExtensionStats {
  files: number;
  lines: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
}

/**
 * 라인 수 통계 결과
 */
export interface LineCountResult {
  success: boolean;
  totalLines?: number;
  totalFiles?: number;
  codeLines?: number;
  commentLines?: number;
  blankLines?: number;
  byExtension?: Record<string, ExtensionStats>;
  error?: string;
}

/**
 * 디렉토리 구조를 분석합니다
 *
 * @param targetPath - 분석할 디렉토리 경로
 * @param options - 분석 옵션
 * @returns 구조 분석 결과
 */
export function analyzeStructure(
  targetPath: string,
  options: StructureOptions = {}
): StructureResult {
  const { maxDepth = Infinity, showHidden = false } = options;

  try {
    if (!fs.existsSync(targetPath)) {
      return {
        success: false,
        path: targetPath,
        error: `경로를 찾을 수 없습니다: ${targetPath}`,
      };
    }

    const stats: DirectoryStats = { totalFiles: 0, totalDirs: 0 };
    const tree = buildTree(targetPath, "", 0, maxDepth, showHidden, stats);

    return {
      success: true,
      path: targetPath,
      tree,
      stats,
    };
  } catch (err) {
    return {
      success: false,
      path: targetPath,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 디렉토리 트리를 생성합니다
 */
function buildTree(
  dirPath: string,
  prefix: string,
  depth: number,
  maxDepth: number,
  showHidden: boolean,
  stats: DirectoryStats
): string {
  if (depth >= maxDepth) {
    return "";
  }

  let result = "";
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // 숨김 파일 필터링 및 정렬 (디렉토리 먼저)
  const filtered = entries
    .filter((e) => showHidden || !e.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (let i = 0; i < filtered.length; i++) {
    const entry = filtered[i];
    const isLast = i === filtered.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const newPrefix = prefix + (isLast ? "    " : "│   ");

    if (entry.isDirectory()) {
      stats.totalDirs++;
      result += `${prefix}${connector}${entry.name}/\n`;
      result += buildTree(
        path.join(dirPath, entry.name),
        newPrefix,
        depth + 1,
        maxDepth,
        showHidden,
        stats
      );
    } else {
      stats.totalFiles++;
      result += `${prefix}${connector}${entry.name}\n`;
    }
  }

  return result;
}

/**
 * package.json 의존성을 분석합니다
 *
 * @param targetPath - 분석할 디렉토리 경로
 * @param options - 분석 옵션
 * @returns 의존성 분석 결과
 */
export function analyzeDependencies(
  targetPath: string,
  options: DependencyOptions = {}
): DependencyResult {
  const { includeDevDeps = true } = options;

  try {
    const packagePath = path.join(targetPath, "package.json");

    if (!fs.existsSync(packagePath)) {
      return {
        success: false,
        error: `package.json을 찾을 수 없습니다: ${packagePath}`,
      };
    }

    const content = fs.readFileSync(packagePath, "utf-8");
    const pkg = JSON.parse(content);

    const result: DependencyResult = {
      success: true,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
    };

    // 프로덕션 의존성
    if (pkg.dependencies) {
      result.dependencies = Object.entries(pkg.dependencies).map(
        ([name, version]) => ({
          name,
          version: version as string,
        })
      );
    }

    // 개발 의존성
    if (includeDevDeps && pkg.devDependencies) {
      result.devDependencies = Object.entries(pkg.devDependencies).map(
        ([name, version]) => ({
          name,
          version: version as string,
        })
      );
    }

    // 스크립트
    if (pkg.scripts) {
      result.scripts = Object.entries(pkg.scripts).map(([name, command]) => ({
        name,
        command: command as string,
      }));
    }

    return result;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 코드 라인 수를 계산합니다
 *
 * @param targetPath - 분석할 디렉토리 경로
 * @param options - 분석 옵션
 * @returns 라인 수 통계
 */
export function countLines(
  targetPath: string,
  options: LineCountOptions = {}
): LineCountResult {
  const { extensions } = options;

  try {
    if (!fs.existsSync(targetPath)) {
      return {
        success: false,
        error: `경로를 찾을 수 없습니다: ${targetPath}`,
      };
    }

    const stats: LineCountResult = {
      success: true,
      totalLines: 0,
      totalFiles: 0,
      codeLines: 0,
      commentLines: 0,
      blankLines: 0,
      byExtension: {},
    };

    countLinesRecursive(targetPath, extensions, stats);

    return stats;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * 재귀적으로 파일을 순회하며 라인 수를 계산합니다
 */
function countLinesRecursive(
  dirPath: string,
  extensions: string[] | undefined,
  stats: LineCountResult
): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // 숨김 디렉토리와 node_modules 제외
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
        countLinesRecursive(fullPath, extensions, stats);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).slice(1); // .ts -> ts

      // 확장자 필터
      if (extensions && extensions.length > 0 && !extensions.includes(ext)) {
        continue;
      }

      // 숨김 파일 제외
      if (entry.name.startsWith(".")) {
        continue;
      }

      // 지원하는 텍스트 파일만 분석
      const textExtensions = ["ts", "js", "tsx", "jsx", "json", "md", "txt", "css", "scss", "html", "py", "go", "rs", "java", "c", "cpp", "h"];
      if (!textExtensions.includes(ext)) {
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const fileStats = analyzeFileLines(content, ext);

        stats.totalFiles! += 1;
        stats.totalLines! += fileStats.total;
        stats.codeLines! += fileStats.code;
        stats.commentLines! += fileStats.comment;
        stats.blankLines! += fileStats.blank;

        // 확장자별 통계
        if (!stats.byExtension![ext]) {
          stats.byExtension![ext] = {
            files: 0,
            lines: 0,
            codeLines: 0,
            commentLines: 0,
            blankLines: 0,
          };
        }

        stats.byExtension![ext].files += 1;
        stats.byExtension![ext].lines += fileStats.total;
        stats.byExtension![ext].codeLines += fileStats.code;
        stats.byExtension![ext].commentLines += fileStats.comment;
        stats.byExtension![ext].blankLines += fileStats.blank;
      } catch {
        // 바이너리 파일 등 읽기 실패 시 무시
      }
    }
  }
}

/**
 * 파일 내용의 라인을 분석합니다
 */
function analyzeFileLines(
  content: string,
  ext: string
): { total: number; code: number; comment: number; blank: number } {
  const lines = content.split("\n");
  let code = 0;
  let comment = 0;
  let blank = 0;
  let inMultiLineComment = false;

  // 주석 패턴 (언어별)
  const singleLineComment = getSingleLineCommentPattern(ext);
  const multiLineStart = getMultiLineCommentStart(ext);
  const multiLineEnd = getMultiLineCommentEnd(ext);

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      blank++;
      continue;
    }

    // 멀티라인 주석 처리
    if (inMultiLineComment) {
      comment++;
      if (multiLineEnd && trimmed.includes(multiLineEnd)) {
        inMultiLineComment = false;
      }
      continue;
    }

    if (multiLineStart && trimmed.startsWith(multiLineStart)) {
      comment++;
      if (!multiLineEnd || !trimmed.includes(multiLineEnd)) {
        inMultiLineComment = true;
      }
      continue;
    }

    // 단일 라인 주석
    if (singleLineComment && trimmed.startsWith(singleLineComment)) {
      comment++;
      continue;
    }

    code++;
  }

  return { total: lines.length, code, comment, blank };
}

/**
 * 확장자별 단일 라인 주석 패턴
 */
function getSingleLineCommentPattern(ext: string): string | null {
  const patterns: Record<string, string> = {
    ts: "//",
    js: "//",
    tsx: "//",
    jsx: "//",
    java: "//",
    c: "//",
    cpp: "//",
    go: "//",
    rs: "//",
    py: "#",
    css: null as unknown as string,
    scss: "//",
    html: null as unknown as string,
    md: null as unknown as string,
    json: null as unknown as string,
  };

  return patterns[ext] || null;
}

/**
 * 확장자별 멀티라인 주석 시작 패턴
 */
function getMultiLineCommentStart(ext: string): string | null {
  const patterns: Record<string, string> = {
    ts: "/*",
    js: "/*",
    tsx: "/*",
    jsx: "/*",
    java: "/*",
    c: "/*",
    cpp: "/*",
    go: "/*",
    css: "/*",
    scss: "/*",
    html: "<!--",
  };

  return patterns[ext] || null;
}

/**
 * 확장자별 멀티라인 주석 끝 패턴
 */
function getMultiLineCommentEnd(ext: string): string | null {
  const patterns: Record<string, string> = {
    ts: "*/",
    js: "*/",
    tsx: "*/",
    jsx: "*/",
    java: "*/",
    c: "*/",
    cpp: "*/",
    go: "*/",
    css: "*/",
    scss: "*/",
    html: "-->",
  };

  return patterns[ext] || null;
}
