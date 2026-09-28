require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");
const { User, Student, Company, Job, Application, Interview, Placement } = require("../models");

// ─── Target Companies Requested by User ──────────────────────────────────────
const companiesData = [
  {
    name: "TCS",
    email: "campus.tcs@tcs.com",
    phone: "1800-209-3111",
    industry: "IT Services & Consulting",
    website: "https://www.tcs.com",
    location: "Mumbai / Pune / Bengaluru",
    description: "Tata Consultancy Services is a global leader in IT services, consulting, and business solutions.",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80",
  },
  {
    name: "Hexaware",
    email: "campus.hiring@hexaware.com",
    phone: "022-68595000",
    industry: "IT & Next-Gen Cloud Solutions",
    website: "https://hexaware.com",
    location: "Navi Mumbai / Pune / Chennai",
    description: "Hexaware is a global provider of digital IT, automation, and enterprise cloud solutions.",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=128&auto=format&fit=crop&q=80",
  },
  {
    name: "Capgemini",
    email: "campus.india@capgemini.com",
    phone: "020-66991000",
    industry: "Technology Consulting & Digital Transformation",
    website: "https://www.capgemini.com",
    location: "Pune / Bengaluru / Mumbai",
    description: "Capgemini is a global leader partnering with companies to transform and manage their business through technology.",
    logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&auto=format&fit=crop&q=80",
  },
];

// ─── Jobs with Specific CGPA Criteria ───────────────────────────────────────
const getJobsData = (companies) => [
  {
    companyId: companies[0].id, // TCS
    title: "Software Engineer (Ninja / Digital)",
    description: "TCS campus placement drive for engineering graduates. Roles in full-stack, cloud engineering, and enterprise systems.",
    location: "Pune / Bengaluru / Hyderabad",
    employmentType: "Full-time",
    package: 6.0,
    minimumCGPA: 6.0, // Requested 6.0 CGPA
    maximumBacklogs: 1,
    eligibleBranches: [
      "Computer Science and Engineering",
      "CSE (AI & ML)",
      "AI & Data Science",
    ],
    requiredSkills: ["Java", "Python", "SQL"],
    graduationYear: 2027,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[1].id, // Hexaware
    title: "Associate Software Engineer",
    description: "Hexaware Technologies hiring fresh graduates for software product engineering and modern cloud web development.",
    location: "Pune / Chennai / Mumbai",
    employmentType: "Full-time",
    package: 7.5,
    minimumCGPA: 7.5, // Requested 7.5 CGPA
    maximumBacklogs: 0,
    eligibleBranches: [
      "Computer Science and Engineering",
      "CSE (AI & ML)",
      "AI & Data Science",
    ],
    requiredSkills: ["Java", "Python", "SQL", "React"],
    graduationYear: 2027,
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[2].id, // Capgemini
    title: "Software Analyst",
    description: "Capgemini campus drive for engineering graduates. Work with cutting-edge microservices, data analytics, and cloud platforms.",
    location: "Pune / Bengaluru",
    employmentType: "Full-time",
    package: 6.5,
    minimumCGPA: 6.0, // Requested 6.0 CGPA
    maximumBacklogs: 0,
    eligibleBranches: [
      "Computer Science and Engineering",
      "CSE (AI & ML)",
      "AI & Data Science",
    ],
    requiredSkills: ["Python", "SQL", "JavaScript"],
    graduationYear: 2027,
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
];

// Department skills mapping
const deptSkills = {
  "Computer Science and Engineering": ["Java", "Python", "SQL", "React", "JavaScript", "Git", "DSA"],
  "CSE (AI & ML)": ["Python", "SQL", "React", "Machine Learning", "Deep Learning", "Git"],
  "AI & Data Science": ["Python", "SQL", "Machine Learning", "Data Analysis", "Tableau", "Git"],
};

// ─── Main Seed Function ─────────────────────────────────────────────────────
const seed = async () => {
  try {
    console.log("🌱 Starting DKTE placement database seed...\n");

    const { testConnection } = require("../config/database");
    await testConnection();
    await sequelize.sync({ alter: true });

    console.log("📋 Clearing existing data...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await Placement.destroy({ where: {}, truncate: true });
    await Interview.destroy({ where: {}, truncate: true });
    await Application.destroy({ where: {}, truncate: true });
    await Job.destroy({ where: {}, truncate: true });
    await Student.destroy({ where: {}, truncate: true });
    await Company.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    // ─── 1. Create DKTE Placement Admin User ─────────────────────────────────
    console.log("👤 Creating Admin & Recruiter accounts...");
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const adminUser = await User.create({
      name: "DKTE Placement Officer",
      email: "admin@dkte.ac.in",
      password: adminPassword,
      role: "ADMIN",
    });

    // ─── 2. Create Recruiter User ─────────────────────────────────────────
    const recruiterPassword = await bcrypt.hash("Recruiter@123", 10);
    const recruiterUser = await User.create({
      name: "Campus Hiring Manager",
      email: "recruiter@tcs.com",
      password: recruiterPassword,
      role: "RECRUITER",
    });

    // ─── 3. Create Companies ──────────────────────────────────────────────
    console.log("🏢 Creating 3 target companies (TCS, Hexaware, Capgemini)...");
    const companies = await Company.bulkCreate(companiesData);
    console.log(`   ✅ 3 companies created`);

    // ─── 4. Create Jobs ───────────────────────────────────────────────────
    console.log("💼 Creating 3 job postings with specified CGPA criteria...");
    const jobsData = getJobsData(companies);
    const jobs = await Job.bulkCreate(jobsData);
    console.log(`   ✅ 3 jobs created (TCS: 6.0 CGPA, Hexaware: 7.5 CGPA, Capgemini: 6.0 CGPA)`);

    // ─── 5. Create Demo Student: Prathmesh Chopade ─────────────────────────
    console.log("🎓 Creating Demo Student: Prathmesh Chopade...");
    const studentPassword = await bcrypt.hash("Student@123", 10);
    const demoStudentUser = await User.create({
      name: "CHOPADE PRATHMESH MAHADEV",
      email: "prathmeshchopade96@gmail.com",
      password: studentPassword,
      role: "STUDENT",
    });

    const demoStudent = await Student.create({
      userId: demoStudentUser.id,
      studentCode: "24UAM302",
      fullName: "CHOPADE PRATHMESH MAHADEV",
      email: "prathmeshchopade96@gmail.com",
      phone: "9876543210",
      branch: "CSE (AI & ML)",
      degree: "B.Tech",
      graduationYear: 2027,
      cgpa: 7.54, // Real CGPA from DKTE sheet
      backlogs: 0,
      skills: ["Python", "SQL", "React", "Machine Learning", "Git", "Java", "JavaScript"],
    });
    console.log(`   ✅ Demo Student created: ${demoStudent.fullName} (${demoStudent.studentCode}) - CGPA: ${demoStudent.cgpa}`);

    // ─── 6. Load and Insert all 326 DKTE Students ─────────────────────────
    console.log("📚 Importing DKTE students from assessment sheet...");
    const dkteRaw = JSON.parse(fs.readFileSync(path.join(__dirname, "dkte_students.json"), "utf8"));
    
    // We already inserted student 24UAM302 as demo student, so skip that one in loop
    let importedCount = 0;
    const commonPassword = await bcrypt.hash("Student@123", 10);

    for (const s of dkteRaw) {
      if (s.prn.toUpperCase() === "24UAM302") continue; // already created

      const email = `${s.prn.toLowerCase()}@dkte.ac.in`;
      const user = await User.create({
        name: s.fullName,
        email,
        password: commonPassword,
        role: "STUDENT",
      });

      const skills = deptSkills[s.branch] || ["Python", "SQL", "Java"];

      await Student.create({
        userId: user.id,
        studentCode: s.prn.toUpperCase(),
        fullName: s.fullName,
        email,
        phone: `98${String(Math.floor(10000000 + Math.random() * 90000000))}`,
        branch: s.branch,
        degree: "B.Tech",
        graduationYear: 2027,
        cgpa: s.cgpa,
        backlogs: s.cgpa < 6.0 ? 1 : 0,
        skills,
      });

      importedCount++;
    }
    console.log(`   ✅ ${importedCount + 1} total DKTE students registered!`);

    // ─── 7. Create Applications for Demo Student ──────────────────────────
    console.log("📝 Setting up active applications for Prathmesh Chopade...");
    // 1. Applied to TCS
    const tcsApp = await Application.create({
      studentId: demoStudent.id,
      jobId: jobs[0].id, // TCS
      status: "INTERVIEW",
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      shortlistedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Schedule interview round for TCS
    await Interview.create({
      applicationId: tcsApp.id,
      round: "TECHNICAL",
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      scheduledTime: "11:30:00",
      interviewer: "TCS Technical Panel",
      meetingLink: "https://meet.google.com/tcs-dkte-interview",
      location: "Central Computing Laboratory - II, DKTE",
      notes: "Please carry your college ID and updated resume.",
      status: "SCHEDULED",
      result: "PENDING",
    });

    // 2. Applied to Hexaware (Shortlisted)
    await Application.create({
      studentId: demoStudent.id,
      jobId: jobs[1].id, // Hexaware (7.5 CGPA required, Prathmesh has 7.54)
      status: "SHORTLISTED",
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      shortlistedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // ─── 8. Seed Sample DKTE Applications & Placements ─────────────────────
    console.log("📊 Seeding DKTE applications & placements across departments...");
    const sampleStudents = await Student.findAll({ limit: 60 });

    for (let i = 0; i < sampleStudents.length; i++) {
      const student = sampleStudents[i];
      if (student.id === demoStudent.id) continue;

      // TCS (min 6.0)
      if (student.cgpa >= 6.0) {
        const appStatus = student.cgpa >= 8.5 ? "SELECTED" : student.cgpa >= 7.5 ? "INTERVIEW" : "SHORTLISTED";
        const app = await Application.create({
          studentId: student.id,
          jobId: jobs[0].id,
          status: appStatus,
          appliedAt: new Date(Date.now() - (7 + (i % 5)) * 24 * 60 * 60 * 1000),
          shortlistedAt: new Date(Date.now() - (3 + (i % 3)) * 24 * 60 * 60 * 1000),
        });

        if (appStatus === "SELECTED") {
          await Placement.create({
            studentId: student.id,
            companyId: jobs[0].companyId,
            jobId: jobs[0].id,
            role: jobs[0].title,
            package: 6.0,
            joiningDate: "2027-07-01",
            placementDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            status: "CONFIRMED",
          });
        }
      }

      // Hexaware (min 7.5)
      if (student.cgpa >= 7.5 && i % 2 === 0) {
        await Application.create({
          studentId: student.id,
          jobId: jobs[1].id,
          status: student.cgpa >= 8.8 ? "SELECTED" : "SHORTLISTED",
          appliedAt: new Date(Date.now() - (6 + (i % 4)) * 24 * 60 * 60 * 1000),
        });

        if (student.cgpa >= 8.8) {
          await Placement.create({
            studentId: student.id,
            companyId: jobs[1].companyId,
            jobId: jobs[1].id,
            role: jobs[1].title,
            package: 7.5,
            joiningDate: "2027-07-15",
            placementDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: "CONFIRMED",
          });
        }
      }

      // Capgemini (min 6.0)
      if (student.cgpa >= 6.0 && i % 3 === 0) {
        await Application.create({
          studentId: student.id,
          jobId: jobs[2].id,
          status: "APPLIED",
          appliedAt: new Date(Date.now() - (4 + (i % 3)) * 24 * 60 * 60 * 1000),
        });
      }
    }

    console.log("\n🎉 DKTE Placement Database seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("DEMO ACCOUNTS:");
    console.log("  Student (Prathmesh): prathmeshchopade96@gmail.com  / Student@123");
    console.log("  Admin (Placement):   admin@dkte.ac.in             / Admin@123");
    console.log("  Recruiter:           recruiter@tcs.com            / Recruiter@123");
    console.log("COMPANIES & ELIGIBILITY:");
    console.log("  1. TCS         → Min CGPA: 6.0  | Package: ₹6.0 LPA");
    console.log("  2. Hexaware    → Min CGPA: 7.5  | Package: ₹7.5 LPA");
    console.log("  3. Capgemini   → Min CGPA: 6.0  | Package: ₹6.5 LPA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    return true;
  } catch (error) {
    console.error("❌ Seed failed:", error);
    if (require.main === module) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seed };
