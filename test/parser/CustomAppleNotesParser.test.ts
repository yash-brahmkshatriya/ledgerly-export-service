import { describe, it, expect } from "vitest";
import { parseExpenses } from "@/parser/CustomAppleNotesParser";

describe("parseExpenses - Temporal Logic", () => {
  it("assigns date header to subsequent entries", () => {
    const input = `
    24 Apr
    1000 - Lunch - y - yny - Team lunch
    500 - Dinner - y - yny - Dinner
    `;

    const result = parseExpenses(input);

    expect(result).toHaveLength(2);
    expect(result[0].expenseTimestamp).toBe("2026-04-24T00:00:00.000Z");
    expect(result[1].expenseTimestamp).toBe("2026-04-24T00:00:00.000Z");
  });

  it("defaults year to 2026 when not provided", () => {
    const input = `
    01 Jan
    100 - Test - y - yny - desc
    `;

    const result = parseExpenses(input);
    expect(result[0].expenseTimestamp).toBe("2026-01-01T00:00:00.000Z");
  });

  it("resets date when new header appears", () => {
    const input = `
    24 Apr
    100 - A - y - yny - d
    25 Apr
    200 - B - y - yny - d
    `;

    const result = parseExpenses(input);

    expect(result[0].expenseTimestamp).toBe("2026-04-24T00:00:00.000Z");
    expect(result[1].expenseTimestamp).toBe("2026-04-25T00:00:00.000Z");
  });
});

describe("parseExpenses - Equal Split Logic", () => {
  it("splits equally among participants", () => {
    const input = `
    24 Apr
    900 - Trip - y - yny - desc
    `;

    const result = parseExpenses(input);

    expect(result[0].split).toEqual({
      y: 600,
      n: 300,
    });

    expect(result[0].amount).toBeCloseTo(600);
  });

  it("handles duplicate initials correctly", () => {
    const input = `
    24 Apr
    1000 - Test - y - yyy - desc
    `;

    const result = parseExpenses(input);

    expect(result[0].split).toEqual({
      y: 1000,
    });

    expect(result[0].amount).toBe(1000);
  });
});

describe("parseExpenses - Manual Split Logic", () => {
  it("parses manual split correctly", () => {
    const input = `
    24 Apr
    100 - Split - y - y(40)n(60) - desc
    `;

    const result = parseExpenses(input);

    expect(result[0].split).toEqual({
      y: 40,
      n: 60,
    });

    expect(result[0].amount).toBe(40);
  });
});

describe("parseExpenses - Status Handling", () => {
  it("marks as UNPROCESSED when '?' present", () => {
    const input = `
    24 Apr
    100 - Test - y - y?n - desc
    `;

    const result = parseExpenses(input);

    expect(result[0].status).toBe("UNPROCESSED");
  });

  it("marks as PROCESSED when valid split", () => {
    const input = `
    24 Apr
    100 - Test - y - y(50)n(50) - desc
    `;

    const result = parseExpenses(input);

    expect(result[0].status).toBe("PROCESSED");
  });
});

describe("parseExpenses - Field Mapping", () => {
  it("maps all fields correctly", () => {
    const input = `
    24 Apr
    100 - Coffee - y - yn - Food - Morning coffee 
    `;

    const result = parseExpenses(input)[0];

    expect(result.title).toBe("Coffee");
    expect(result.description).toBe("Morning coffee");
    expect(result.category).toBe("Food");
  });

  it("defaults category to null if missing", () => {
    const input = `
    24 Apr
    100 - Coffee - y - yn -  - Morning coffee
    `;

    const result = parseExpenses(input)[0];

    expect(result.category).toBe("");
  });

  it("defaults empty description to empty string", () => {
    const input = `
    24 Apr
    100 - Coffee - y - yn -  -   
    `;

    const result = parseExpenses(input)[0];

    expect(result.description).toBe("");
  });
});

describe("parseExpenses - Training Status", () => {
  it("defaults trainingStatus to PENDING", () => {
    const input = `
    24 Apr
    100 - Coffee - y - yn - desc
    `;

    const result = parseExpenses(input);

    expect(result[0].trainingStatus).toBe("PENDING");
  });
});

describe("parseExpenses - Custom Shortname", () => {
  it("uses custom shortname instead of 'y'", () => {
    const input = `
    24 Apr
    100 - Test - a - a(70)b(30) - desc
    `;

    const result = parseExpenses(input, "a");

    expect(result[0].amount).toBe(70);
  });
});

describe("parseExpenses - Invalid Input Handling", () => {
  it("skips lines with missing delimiters", () => {
    const input = `
    24 Apr
    100 Coffee y yn desc
    200 - Valid - y - yn - desc
    `;

    const result = parseExpenses(input);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Valid");
  });

  it("skips lines with too few segments", () => {
    const input = `
    24 Apr
    100 - Incomplete - y
    200 - Valid - y - yn - desc
    `;

    const result = parseExpenses(input);

    expect(result.length).toBe(1);
  });

  it("skips lines with invalid amount", () => {
    const input = `
    24 Apr
    abc - Test - y - yn - desc
    200 - Valid - y - yn - desc
    `;

    const result = parseExpenses(input);

    expect(result.length).toBe(1);
  });

  it("skips lines without a preceding date header", () => {
    const input = `
    100 - NoDate - y - yn - desc
    24 Apr
    200 - Valid - y - yn - desc
    `;

    const result = parseExpenses(input);

    expect(result).toHaveLength(1);
  });

  it("handles empty input gracefully", () => {
    const result = parseExpenses("");

    expect(result).toEqual([]);
  });

  it("handles whitespace-only input", () => {
    const result = parseExpenses("   \n   ");

    expect(result).toEqual([]);
  });
});
