import { describe, it, expect, vi } from "vitest";
import {
  formatTime,
  calculate,
  generateRandomNumbers,
  reverseString,
  getServerInfo,
} from "./tools.js";

// ============================================
// Test: formatTime (get_current_time)
// ============================================
describe("formatTime", () => {
  it("should format date with default timezone (Asia/Seoul)", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate);

    expect(result.timezone).toBe("Asia/Seoul");
    expect(result.formatted).toContain("2025");
  });

  it("should format date with custom timezone", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "America/New_York");

    expect(result.timezone).toBe("America/New_York");
    expect(result.formatted).toBeDefined();
  });

  it("should format date only when format is 'date'", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "Asia/Seoul", "date");

    expect(result.formatted).toContain("2025");
    expect(result.formatted).not.toContain("시");
  });

  it("should format time only when format is 'time'", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "Asia/Seoul", "time");

    expect(result.formatted).toContain("시");
    expect(result.formatted).not.toContain("2025");
  });

  it("should format full date and time when format is 'full'", () => {
    const testDate = new Date("2025-11-28T09:30:00Z");
    const result = formatTime(testDate, "Asia/Seoul", "full");

    expect(result.formatted).toContain("2025");
    expect(result.formatted).toContain("시");
  });
});

// ============================================
// Test: calculate
// ============================================
describe("calculate", () => {
  describe("addition", () => {
    it("should add two positive numbers", () => {
      const result = calculate(123, 456, "add");

      expect(result.result).toBe(579);
      expect(result.expression).toBe("123 + 456 = 579");
      expect(result.isError).toBe(false);
    });

    it("should add negative numbers", () => {
      const result = calculate(-10, -20, "add");

      expect(result.result).toBe(-30);
      expect(result.isError).toBe(false);
    });

    it("should add zero", () => {
      const result = calculate(100, 0, "add");

      expect(result.result).toBe(100);
      expect(result.isError).toBe(false);
    });
  });

  describe("subtraction", () => {
    it("should subtract two numbers", () => {
      const result = calculate(100, 30, "subtract");

      expect(result.result).toBe(70);
      expect(result.expression).toBe("100 - 30 = 70");
      expect(result.isError).toBe(false);
    });

    it("should handle negative result", () => {
      const result = calculate(10, 30, "subtract");

      expect(result.result).toBe(-20);
      expect(result.isError).toBe(false);
    });
  });

  describe("multiplication", () => {
    it("should multiply two numbers", () => {
      const result = calculate(15, 8, "multiply");

      expect(result.result).toBe(120);
      expect(result.expression).toBe("15 × 8 = 120");
      expect(result.isError).toBe(false);
    });

    it("should handle multiplication by zero", () => {
      const result = calculate(100, 0, "multiply");

      expect(result.result).toBe(0);
      expect(result.isError).toBe(false);
    });
  });

  describe("division", () => {
    it("should divide two numbers", () => {
      const result = calculate(144, 12, "divide");

      expect(result.result).toBe(12);
      expect(result.expression).toBe("144 ÷ 12 = 12");
      expect(result.isError).toBe(false);
    });

    it("should handle decimal result", () => {
      const result = calculate(10, 3, "divide");

      expect(result.result).toBeCloseTo(3.333, 2);
      expect(result.isError).toBe(false);
    });

    it("should return error when dividing by zero", () => {
      const result = calculate(100, 0, "divide");

      expect(result.isError).toBe(true);
      expect(result.errorMessage).toBe("오류: 0으로 나눌 수 없습니다.");
      expect(result.result).toBeNaN();
    });
  });
});

// ============================================
// Test: generateRandomNumbers
// ============================================
describe("generateRandomNumbers", () => {
  it("should generate single random number in range", () => {
    const result = generateRandomNumbers(1, 10);

    expect(result.numbers).toHaveLength(1);
    expect(result.numbers[0]).toBeGreaterThanOrEqual(1);
    expect(result.numbers[0]).toBeLessThanOrEqual(10);
    expect(result.isError).toBe(false);
  });

  it("should generate multiple random numbers", () => {
    const result = generateRandomNumbers(1, 45, 6);

    expect(result.numbers).toHaveLength(6);
    result.numbers.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(45);
    });
    expect(result.isError).toBe(false);
  });

  it("should return error when min > max", () => {
    const result = generateRandomNumbers(100, 10);

    expect(result.isError).toBe(true);
    expect(result.errorMessage).toBe("오류: 최소값이 최대값보다 큽니다.");
    expect(result.numbers).toHaveLength(0);
  });

  it("should handle same min and max", () => {
    const result = generateRandomNumbers(5, 5, 3);

    expect(result.numbers).toHaveLength(3);
    result.numbers.forEach((num) => {
      expect(num).toBe(5);
    });
    expect(result.isError).toBe(false);
  });

  it("should generate integers only", () => {
    const result = generateRandomNumbers(1, 100, 10);

    result.numbers.forEach((num) => {
      expect(Number.isInteger(num)).toBe(true);
    });
  });
});

// ============================================
// Test: reverseString
// ============================================
describe("reverseString", () => {
  it("should reverse a simple string", () => {
    const result = reverseString("hello");

    expect(result.original).toBe("hello");
    expect(result.reversed).toBe("olleh");
  });

  it("should reverse a string with numbers", () => {
    const result = reverseString("12345");

    expect(result.reversed).toBe("54321");
  });

  it("should handle Korean characters", () => {
    const result = reverseString("안녕");

    expect(result.reversed).toBe("녕안");
  });

  it("should handle empty string", () => {
    const result = reverseString("");

    expect(result.reversed).toBe("");
  });

  it("should handle single character", () => {
    const result = reverseString("A");

    expect(result.reversed).toBe("A");
  });

  it("should preserve spaces", () => {
    const result = reverseString("Hello World");

    expect(result.reversed).toBe("dlroW olleH");
  });

  it("should handle special characters", () => {
    const result = reverseString("Hello MCP!");

    expect(result.reversed).toBe("!PCM olleH");
  });
});

// ============================================
// Test: getServerInfo
// ============================================
describe("getServerInfo", () => {
  it("should return correct server name", () => {
    const info = getServerInfo();

    expect(info.name).toBe("my-first-mcp");
  });

  it("should return correct version", () => {
    const info = getServerInfo();

    expect(info.version).toBe("1.0.0");
  });

  it("should return description", () => {
    const info = getServerInfo();

    expect(info.description).toBeDefined();
    expect(info.description.length).toBeGreaterThan(0);
  });

  it("should list all 5 tools", () => {
    const info = getServerInfo();

    expect(info.tools).toHaveLength(5);
    expect(info.tools.some((t) => t.includes("get_current_time"))).toBe(true);
    expect(info.tools.some((t) => t.includes("calculate"))).toBe(true);
    expect(info.tools.some((t) => t.includes("get_random_number"))).toBe(true);
    expect(info.tools.some((t) => t.includes("reverse_string"))).toBe(true);
    expect(info.tools.some((t) => t.includes("get_server_info"))).toBe(true);
  });
});
