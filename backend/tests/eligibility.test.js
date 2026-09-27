/**
 * Tests for the Eligibility Service
 * 
 * This is the most critical part of the application.
 * Every business rule must be tested with pass and fail scenarios.
 */

const {
  checkCGPA,
  checkBacklogs,
  checkBranch,
  checkSkills,
  checkGraduationYear,
  evaluateEligibility,
} = require("../src/services/eligibility.service");

// ─── Sample Test Data ───────────────────────────────────────────────────────
const createStudent = (overrides = {}) => ({
  cgpa: 7.44,
  backlogs: 0,
  branch: "AI & ML",
  graduationYear: 2025,
  skills: ["Python", "SQL", "React"],
  ...overrides,
});

const createJob = (overrides = {}) => ({
  minimumCGPA: 7.0,
  maximumBacklogs: 0,
  eligibleBranches: ["AI & ML", "CSE"],
  requiredSkills: ["Python", "SQL"],
  graduationYear: 2025,
  ...overrides,
});

// ─── CGPA Tests ─────────────────────────────────────────────────────────────
describe("checkCGPA", () => {
  test("PASS: student CGPA meets requirement", () => {
    const result = checkCGPA(createStudent({ cgpa: 7.44 }), createJob({ minimumCGPA: 7.0 }));
    expect(result.passed).toBe(true);
  });

  test("PASS: student CGPA exactly meets requirement", () => {
    const result = checkCGPA(createStudent({ cgpa: 7.0 }), createJob({ minimumCGPA: 7.0 }));
    expect(result.passed).toBe(true);
  });

  test("FAIL: student CGPA below requirement", () => {
    const result = checkCGPA(createStudent({ cgpa: 6.72 }), createJob({ minimumCGPA: 7.0 }));
    expect(result.passed).toBe(false);
    expect(result.message).toContain("below required");
  });

  test("FAIL: very low CGPA", () => {
    const result = checkCGPA(createStudent({ cgpa: 4.5 }), createJob({ minimumCGPA: 7.0 }));
    expect(result.passed).toBe(false);
  });
});

// ─── Backlogs Tests ─────────────────────────────────────────────────────────
describe("checkBacklogs", () => {
  test("PASS: student has 0 backlogs, job requires 0", () => {
    const result = checkBacklogs(createStudent({ backlogs: 0 }), createJob({ maximumBacklogs: 0 }));
    expect(result.passed).toBe(true);
  });

  test("PASS: student has 1 backlog, job allows 1", () => {
    const result = checkBacklogs(createStudent({ backlogs: 1 }), createJob({ maximumBacklogs: 1 }));
    expect(result.passed).toBe(true);
  });

  test("FAIL: student has 1 backlog, job requires 0", () => {
    const result = checkBacklogs(createStudent({ backlogs: 1 }), createJob({ maximumBacklogs: 0 }));
    expect(result.passed).toBe(false);
    expect(result.message).toContain("exceeds");
  });

  test("FAIL: student has 2 backlogs, job allows 1", () => {
    const result = checkBacklogs(createStudent({ backlogs: 2 }), createJob({ maximumBacklogs: 1 }));
    expect(result.passed).toBe(false);
  });
});

// ─── Branch Tests ───────────────────────────────────────────────────────────
describe("checkBranch", () => {
  test("PASS: student branch is in eligible list", () => {
    const result = checkBranch(
      createStudent({ branch: "AI & ML" }),
      createJob({ eligibleBranches: ["AI & ML", "CSE"] })
    );
    expect(result.passed).toBe(true);
  });

  test("PASS: all branches eligible (empty array)", () => {
    const result = checkBranch(
      createStudent({ branch: "Mechanical" }),
      createJob({ eligibleBranches: [] })
    );
    expect(result.passed).toBe(true);
  });

  test("FAIL: student branch not in eligible list", () => {
    const result = checkBranch(
      createStudent({ branch: "Mechanical" }),
      createJob({ eligibleBranches: ["CSE", "AI & ML"] })
    );
    expect(result.passed).toBe(false);
    expect(result.message).toContain("not in the eligible branches");
  });

  test("PASS: case-insensitive branch matching", () => {
    const result = checkBranch(
      createStudent({ branch: "ai & ml" }),
      createJob({ eligibleBranches: ["AI & ML"] })
    );
    expect(result.passed).toBe(true);
  });
});

// ─── Skills Tests ───────────────────────────────────────────────────────────
describe("checkSkills", () => {
  test("PASS: student has all required skills", () => {
    const results = checkSkills(
      createStudent({ skills: ["Python", "SQL", "React"] }),
      createJob({ requiredSkills: ["Python", "SQL"] })
    );
    expect(results.every((r) => r.passed)).toBe(true);
  });

  test("FAIL: student is missing a required skill", () => {
    const results = checkSkills(
      createStudent({ skills: ["Python", "JavaScript"] }),
      createJob({ requiredSkills: ["Python", "SQL"] })
    );
    const failedSkills = results.filter((r) => !r.passed);
    expect(failedSkills.length).toBe(1);
    expect(failedSkills[0].skillName).toBe("SQL");
  });

  test("FAIL: student has none of the required skills", () => {
    const results = checkSkills(
      createStudent({ skills: ["AutoCAD", "MATLAB"] }),
      createJob({ requiredSkills: ["Python", "SQL", "React"] })
    );
    expect(results.every((r) => !r.passed)).toBe(true);
  });

  test("PASS: no skills required", () => {
    const results = checkSkills(
      createStudent({ skills: [] }),
      createJob({ requiredSkills: [] })
    );
    expect(results[0].passed).toBe(true);
  });
});

// ─── Graduation Year Tests ──────────────────────────────────────────────────
describe("checkGraduationYear", () => {
  test("PASS: graduation year matches", () => {
    const result = checkGraduationYear(
      createStudent({ graduationYear: 2025 }),
      createJob({ graduationYear: 2025 })
    );
    expect(result.passed).toBe(true);
  });

  test("PASS: no graduation year required", () => {
    const result = checkGraduationYear(
      createStudent({ graduationYear: 2024 }),
      createJob({ graduationYear: null })
    );
    expect(result.passed).toBe(true);
  });

  test("FAIL: graduation year mismatch", () => {
    const result = checkGraduationYear(
      createStudent({ graduationYear: 2024 }),
      createJob({ graduationYear: 2025 })
    );
    expect(result.passed).toBe(false);
  });
});

// ─── Full Eligibility Evaluation Tests ─────────────────────────────────────
describe("evaluateEligibility", () => {
  test("ELIGIBLE: student meets all criteria (the demo scenario)", () => {
    const student = createStudent({
      cgpa: 7.44,
      backlogs: 0,
      branch: "AI & ML",
      skills: ["Python", "SQL", "React"],
      graduationYear: 2025,
    });
    const job = createJob({
      minimumCGPA: 7.0,
      maximumBacklogs: 0,
      eligibleBranches: ["AI & ML", "CSE"],
      requiredSkills: ["Python", "SQL"],
      graduationYear: 2025,
    });

    const result = evaluateEligibility(student, job);

    expect(result.eligible).toBe(true);
    expect(result.score).toBe(100);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  test("NOT ELIGIBLE: low CGPA fails", () => {
    const result = evaluateEligibility(
      createStudent({ cgpa: 6.5 }),
      createJob({ minimumCGPA: 7.0 })
    );
    expect(result.eligible).toBe(false);
    expect(result.checks.find((c) => c.name === "CGPA").passed).toBe(false);
  });

  test("NOT ELIGIBLE: high backlogs fails", () => {
    const result = evaluateEligibility(
      createStudent({ backlogs: 2 }),
      createJob({ maximumBacklogs: 0 })
    );
    expect(result.eligible).toBe(false);
    expect(result.checks.find((c) => c.name === "Backlogs").passed).toBe(false);
  });

  test("NOT ELIGIBLE: wrong branch fails", () => {
    const result = evaluateEligibility(
      createStudent({ branch: "Mechanical" }),
      createJob({ eligibleBranches: ["CSE", "AI & ML"] })
    );
    expect(result.eligible).toBe(false);
    expect(result.checks.find((c) => c.name === "Branch").passed).toBe(false);
  });

  test("NOT ELIGIBLE: missing required skills", () => {
    const result = evaluateEligibility(
      createStudent({ skills: ["AutoCAD", "MATLAB"] }),
      createJob({ requiredSkills: ["Python", "SQL"] })
    );
    expect(result.eligible).toBe(false);
    const skillChecks = result.checks.filter(
      (c) => c.name === "Python" || c.name === "SQL"
    );
    expect(skillChecks.every((c) => !c.passed)).toBe(true);
  });

  test("Score is partial when some checks fail", () => {
    const result = evaluateEligibility(
      createStudent({ cgpa: 6.5, backlogs: 0, branch: "AI & ML", skills: ["Python", "SQL"] }),
      createJob({ minimumCGPA: 7.0, maximumBacklogs: 0, eligibleBranches: ["AI & ML"], requiredSkills: ["Python", "SQL"] })
    );
    expect(result.eligible).toBe(false);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(100);
  });

  test("Returns structured check array", () => {
    const result = evaluateEligibility(createStudent(), createJob());
    expect(Array.isArray(result.checks)).toBe(true);
    result.checks.forEach((check) => {
      expect(check).toHaveProperty("name");
      expect(check).toHaveProperty("passed");
      expect(check).toHaveProperty("message");
    });
  });
});
