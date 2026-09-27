/**
 * Eligibility Service
 *
 * This is the core business logic of CampusHire.
 * It checks if a student meets ALL eligibility criteria for a given job.
 *
 * Rules are deterministic — no AI, no randomness.
 * Every decision is explainable with a clear reason.
 */

/**
 * Check if student's CGPA meets the job's minimum requirement.
 * @param {Object} student - Student record
 * @param {Object} job - Job record
 * @returns {{ passed: boolean, message: string }}
 */
const checkCGPA = (student, job) => {
  const studentCGPA = parseFloat(student.cgpa);
  const minimumCGPA = parseFloat(job.minimumCGPA);

  if (studentCGPA >= minimumCGPA) {
    return {
      passed: true,
      message: `CGPA ${studentCGPA.toFixed(2)} meets the required ${minimumCGPA.toFixed(2)}`,
    };
  }

  return {
    passed: false,
    message: `CGPA ${studentCGPA.toFixed(2)} is below required ${minimumCGPA.toFixed(2)}`,
  };
};

/**
 * Check if student's backlogs are within the allowed limit.
 * @param {Object} student - Student record
 * @param {Object} job - Job record
 * @returns {{ passed: boolean, message: string }}
 */
const checkBacklogs = (student, job) => {
  const studentBacklogs = parseInt(student.backlogs);
  const maximumBacklogs = parseInt(job.maximumBacklogs);

  if (studentBacklogs <= maximumBacklogs) {
    return {
      passed: true,
      message:
        maximumBacklogs === 0
          ? "No active backlogs — requirement satisfied"
          : `${studentBacklogs} backlog(s) within the allowed ${maximumBacklogs}`,
    };
  }

  return {
    passed: false,
    message: `${studentBacklogs} backlog(s) exceeds the maximum allowed ${maximumBacklogs}`,
  };
};

/**
 * Check if student's branch is in the list of eligible branches.
 * @param {Object} student - Student record
 * @param {Object} job - Job record
 * @returns {{ passed: boolean, message: string }}
 */
const checkBranch = (student, job) => {
  const eligibleBranches = job.eligibleBranches || [];

  // If no branches specified, all branches are eligible
  if (eligibleBranches.length === 0) {
    return {
      passed: true,
      message: "Open to all branches",
    };
  }

  const studentBranch = student.branch;
  const isEligible = eligibleBranches.some(
    (branch) => branch.toLowerCase().trim() === studentBranch.toLowerCase().trim()
  );

  if (isEligible) {
    return {
      passed: true,
      message: `${studentBranch} is an eligible branch`,
    };
  }

  return {
    passed: false,
    message: `${studentBranch} is not in the eligible branches: ${eligibleBranches.join(", ")}`,
  };
};

/**
 * Check if student has all the required skills for the job.
 * Returns a check result for each required skill individually.
 * @param {Object} student - Student record
 * @param {Object} job - Job record
 * @returns {Array<{ passed: boolean, message: string, skillName: string }>}
 */
const checkSkills = (student, job) => {
  const requiredSkills = job.requiredSkills || [];
  const studentSkills = (student.skills || []).map((skill) =>
    skill.toLowerCase().trim()
  );

  // If no skills required, no skill check needed
  if (requiredSkills.length === 0) {
    return [
      {
        passed: true,
        message: "No specific skills required",
        skillName: "Skills",
      },
    ];
  }

  // Check each required skill individually
  return requiredSkills.map((requiredSkill) => {
    const hasSkill = studentSkills.includes(requiredSkill.toLowerCase().trim());
    return {
      passed: hasSkill,
      message: hasSkill
        ? `${requiredSkill} skill satisfied`
        : `Missing required skill: ${requiredSkill}`,
      skillName: requiredSkill,
    };
  });
};

/**
 * Check if student's graduation year matches the job's requirement.
 * @param {Object} student - Student record
 * @param {Object} job - Job record
 * @returns {{ passed: boolean, message: string }}
 */
const checkGraduationYear = (student, job) => {
  // If no graduation year specified in job, all years are eligible
  if (!job.graduationYear) {
    return {
      passed: true,
      message: "Open to all graduation years",
    };
  }

  const studentYear = parseInt(student.graduationYear);
  const requiredYear = parseInt(job.graduationYear);

  if (studentYear === requiredYear) {
    return {
      passed: true,
      message: `Graduation year ${studentYear} matches requirement`,
    };
  }

  return {
    passed: false,
    message: `Graduation year ${studentYear} does not match required ${requiredYear}`,
  };
};

/**
 * Main eligibility evaluation function.
 * Runs all eligibility checks and returns a comprehensive result.
 *
 * @param {Object} student - Student record from database
 * @param {Object} job - Job record from database
 * @returns {{
 *   eligible: boolean,
 *   score: number,
 *   checks: Array<{ name: string, passed: boolean, message: string }>
 * }}
 */
const evaluateEligibility = (student, job) => {
  const checks = [];

  // --- Check CGPA ---
  const cgpaCheck = checkCGPA(student, job);
  checks.push({
    name: "CGPA",
    passed: cgpaCheck.passed,
    message: cgpaCheck.message,
  });

  // --- Check Backlogs ---
  const backlogCheck = checkBacklogs(student, job);
  checks.push({
    name: "Backlogs",
    passed: backlogCheck.passed,
    message: backlogCheck.message,
  });

  // --- Check Branch ---
  const branchCheck = checkBranch(student, job);
  checks.push({
    name: "Branch",
    passed: branchCheck.passed,
    message: branchCheck.message,
  });

  // --- Check Graduation Year ---
  const yearCheck = checkGraduationYear(student, job);
  checks.push({
    name: "Graduation Year",
    passed: yearCheck.passed,
    message: yearCheck.message,
  });

  // --- Check Skills (one check per required skill) ---
  const skillChecks = checkSkills(student, job);
  skillChecks.forEach((skillCheck) => {
    checks.push({
      name: skillCheck.skillName,
      passed: skillCheck.passed,
      message: skillCheck.message,
    });
  });

  // Student is eligible ONLY if ALL checks pass
  const allPassed = checks.every((check) => check.passed);

  // Score = percentage of checks passed
  const passedCount = checks.filter((check) => check.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    eligible: allPassed,
    score,
    checks,
  };
};

module.exports = {
  checkCGPA,
  checkBacklogs,
  checkBranch,
  checkSkills,
  checkGraduationYear,
  evaluateEligibility,
};
