require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");
const { User, Student, Company, Job, Application, Interview, Placement } = require("../models");

// ─── Realistic Indian Company Data ─────────────────────────────────────────
const companiesData = [
  { name: "TCS", email: "campus@tcs.com", phone: "1800-209-3111", industry: "IT Services", website: "https://tcs.com", location: "Mumbai, Maharashtra", description: "Tata Consultancy Services is an IT services, consulting and business solutions organization.", logo: "https://logo.clearbit.com/tcs.com" },
  { name: "Infosys", email: "campus@infosys.com", phone: "080-28520261", industry: "IT Services", website: "https://infosys.com", location: "Bengaluru, Karnataka", description: "Infosys is a global leader in next-generation digital services and consulting.", logo: "https://logo.clearbit.com/infosys.com" },
  { name: "Wipro", email: "campus@wipro.com", phone: "080-28440011", industry: "IT Services", website: "https://wipro.com", location: "Bengaluru, Karnataka", description: "Wipro is a technology services and consulting company.", logo: "https://logo.clearbit.com/wipro.com" },
  { name: "Accenture", email: "campus@accenture.com", phone: "1800-419-8805", industry: "Consulting", website: "https://accenture.com", location: "Mumbai, Maharashtra", description: "Accenture is a global professional services company with leading capabilities in digital, cloud and security.", logo: "https://logo.clearbit.com/accenture.com" },
  { name: "Capgemini", email: "campus@capgemini.com", phone: "080-67147777", industry: "IT Consulting", website: "https://capgemini.com", location: "Pune, Maharashtra", description: "Capgemini is a global leader in partnering with companies to transform and manage their business.", logo: "https://logo.clearbit.com/capgemini.com" },
  { name: "Tech Mahindra", email: "campus@techmahindra.com", phone: "020-66601000", industry: "IT Services", website: "https://techmahindra.com", location: "Pune, Maharashtra", description: "Tech Mahindra offers innovative and customer-centric digital experiences.", logo: "https://logo.clearbit.com/techmahindra.com" },
  { name: "Persistent Systems", email: "campus@persistent.com", phone: "020-66009999", industry: "Software", website: "https://persistent.com", location: "Pune, Maharashtra", description: "Persistent Systems is a technology company delivering digital business acceleration.", logo: "https://logo.clearbit.com/persistent.com" },
  { name: "Zoho Corporation", email: "campus@zoho.com", phone: "044-71817070", industry: "SaaS", website: "https://zoho.com", location: "Chennai, Tamil Nadu", description: "Zoho is a multinational technology company that makes web-based business tools.", logo: "https://logo.clearbit.com/zoho.com" },
  { name: "Deloitte India", email: "campus@deloitte.com", phone: "022-61854000", industry: "Consulting", website: "https://deloitte.com/in", location: "Mumbai, Maharashtra", description: "Deloitte provides audit, consulting, financial advisory and risk management services.", logo: "https://logo.clearbit.com/deloitte.com" },
  { name: "Thinqloud", email: "campus@thinqloud.com", phone: "079-40092929", industry: "Cloud Solutions", website: "https://thinqloud.com", location: "Ahmedabad, Gujarat", description: "Thinqloud specializes in Salesforce solutions and cloud-based enterprise software.", logo: "https://logo.clearbit.com/thinqloud.com" },
];

// ─── Branch Data ────────────────────────────────────────────────────────────
const branches = ["CSE", "AI & ML", "IT", "ECE", "EEE", "Mechanical", "Civil", "Data Science"];

const skillSets = {
  "CSE": ["Java", "Python", "JavaScript", "React", "Node.js", "SQL", "Git", "DSA"],
  "AI & ML": ["Python", "Machine Learning", "Deep Learning", "SQL", "TensorFlow", "Pandas", "NumPy", "React"],
  "IT": ["JavaScript", "React", "Node.js", "SQL", "PHP", "HTML/CSS", "Git"],
  "ECE": ["Embedded C", "Python", "MATLAB", "IoT", "Signal Processing"],
  "EEE": ["AutoCAD", "MATLAB", "Python", "PLC Programming"],
  "Mechanical": ["AutoCAD", "SolidWorks", "MATLAB", "Python"],
  "Civil": ["AutoCAD", "STAAD Pro", "MS Project"],
  "Data Science": ["Python", "R", "SQL", "Machine Learning", "Tableau", "Power BI", "Statistics"],
};

// ─── Indian Names for Seed Students ────────────────────────────────────────
const firstNames = [
  "Aarav", "Aditya", "Akash", "Amit", "Ananya", "Anjali", "Arjun", "Ayesha",
  "Deepika", "Divya", "Gaurav", "Ishaan", "Kavya", "Kiran", "Lakshmi", "Manish",
  "Meera", "Mohit", "Neha", "Nikhil", "Pooja", "Prathmesh", "Priya", "Rahul",
  "Ravi", "Rohit", "Sakshi", "Sanjana", "Shivam", "Sneha", "Sourabh", "Sumit",
  "Swati", "Tanvi", "Tejas", "Uday", "Vaibhav", "Vipul", "Yash", "Zara",
  "Aishwarya", "Aryan", "Bhavya", "Chirag", "Darshan", "Ekta", "Farhan",
  "Hardik", "Jyoti", "Kunal",
];

const lastNames = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Joshi", "Mehta", "Shah",
  "Yadav", "Nair", "Iyer", "Reddy", "Verma", "Tiwari", "Mishra", "Rao",
  "Jain", "Agarwal", "Pandey", "Saxena",
];

const generateStudents = (count) => {
  const students = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const branch = branches[i % branches.length];
    const skills = skillSets[branch] || ["Python", "SQL"];
    const numSkills = 3 + (i % 3); // 3-5 skills per student

    const cgpa = parseFloat((6.0 + Math.random() * 4).toFixed(2));

    students.push({
      studentCode: `STU${String(2024001 + i).padStart(7, "0")}`,
      fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@college.edu`,
      phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      branch,
      degree: "B.Tech",
      graduationYear: 2025,
      cgpa: Math.min(10, Math.max(4, cgpa)),
      backlogs: i % 8 === 0 ? 1 : i % 15 === 0 ? 2 : 0, // ~85% have 0 backlogs
      skills: skills.slice(0, numSkills),
    });
  }
  return students;
};

// ─── Jobs Data ─────────────────────────────────────────────────────────────
const getJobsData = (companies) => [
  {
    companyId: companies[0].id, // TCS
    title: "Software Developer",
    description: "Join TCS as a Software Developer. Work on enterprise-scale applications using Java and cloud technologies.",
    location: "Pan India",
    employmentType: "Full-time",
    package: 7.0,
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "AI & ML"],
    requiredSkills: ["Java", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[1].id, // Infosys
    title: "Systems Engineer",
    description: "Infosys Systems Engineer role for fresh graduates. Comprehensive training and career growth.",
    location: "Bengaluru / Pune / Mysore",
    employmentType: "Full-time",
    package: 6.5,
    minimumCGPA: 6.5,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "ECE", "EEE", "AI & ML"],
    requiredSkills: ["Python", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[7].id, // Zoho
    title: "Software Development Engineer",
    description: "Build real-world SaaS products at Zoho. Work with cutting-edge web technologies.",
    location: "Chennai / Hyderabad",
    employmentType: "Full-time",
    package: 9.0,
    minimumCGPA: 8.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "AI & ML", "Data Science"],
    requiredSkills: ["JavaScript", "React", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[3].id, // Accenture
    title: "Associate Software Engineer",
    description: "Accenture is hiring Associate Software Engineers to work on client projects globally.",
    location: "Mumbai / Bengaluru / Hyderabad",
    employmentType: "Full-time",
    package: 8.0,
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "AI & ML", "Data Science"],
    requiredSkills: ["Python", "SQL", "React"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[4].id, // Capgemini
    title: "Analyst",
    description: "Join Capgemini as an Analyst. Rotational program across technology and consulting practices.",
    location: "Pune / Mumbai",
    employmentType: "Full-time",
    package: 7.5,
    minimumCGPA: 6.0,
    maximumBacklogs: 1,
    eligibleBranches: ["CSE", "IT", "ECE", "AI & ML"],
    requiredSkills: ["Python", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[6].id, // Persistent
    title: "Associate Engineer",
    description: "Persistent Systems is looking for passionate engineers to build innovative software products.",
    location: "Pune / Nagpur",
    employmentType: "Full-time",
    package: 8.5,
    minimumCGPA: 7.5,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "AI & ML"],
    requiredSkills: ["Java", "Python", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[2].id, // Wipro
    title: "Project Engineer",
    description: "Wipro Project Engineer position for engineering graduates. Training-intensive program.",
    location: "Pan India",
    employmentType: "Full-time",
    package: 6.5,
    minimumCGPA: 6.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "ECE", "EEE", "Mechanical", "AI & ML"],
    requiredSkills: ["Python"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[9].id, // Thinqloud
    title: "Salesforce Developer",
    description: "Join Thinqloud and work with Salesforce CRM platform. Training provided.",
    location: "Ahmedabad, Gujarat",
    employmentType: "Full-time",
    package: 5.5,
    minimumCGPA: 6.5,
    maximumBacklogs: 1,
    eligibleBranches: ["CSE", "IT", "AI & ML"],
    requiredSkills: ["JavaScript", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[5].id, // Tech Mahindra
    title: "Software Engineer",
    description: "Tech Mahindra Software Engineer for telecom and enterprise domains.",
    location: "Pune / Hyderabad",
    employmentType: "Full-time",
    package: 7.0,
    minimumCGPA: 6.5,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "AI & ML", "Data Science"],
    requiredSkills: ["Python", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[8].id, // Deloitte
    title: "Analyst - Technology Consulting",
    description: "Deloitte is hiring technology analysts for their consulting practice.",
    location: "Mumbai / Bengaluru",
    employmentType: "Full-time",
    package: 10.0,
    minimumCGPA: 8.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "AI & ML", "Data Science"],
    requiredSkills: ["Python", "SQL", "Machine Learning"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[0].id, // TCS
    title: "Data Engineer",
    description: "TCS Data Engineering role focused on building data pipelines and analytics platforms.",
    location: "Hyderabad / Chennai",
    employmentType: "Full-time",
    package: 8.0,
    minimumCGPA: 7.5,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "AI & ML", "Data Science"],
    requiredSkills: ["Python", "SQL", "Machine Learning"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[1].id, // Infosys
    title: "DevOps Engineer",
    description: "Infosys DevOps position focusing on CI/CD, Docker, Kubernetes, and cloud deployments.",
    location: "Bengaluru",
    employmentType: "Full-time",
    package: 8.5,
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT"],
    requiredSkills: ["Python", "SQL", "Git"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[7].id, // Zoho
    title: "Frontend Developer Intern",
    description: "6-month internship at Zoho working on their web products frontend.",
    location: "Chennai",
    employmentType: "Internship",
    package: 3.0,
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "IT", "AI & ML"],
    requiredSkills: ["JavaScript", "React", "HTML/CSS"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[3].id, // Accenture
    title: "AI/ML Engineer",
    description: "Work on cutting-edge AI/ML projects at Accenture's innovation labs.",
    location: "Bengaluru / Hyderabad",
    employmentType: "Full-time",
    package: 12.0,
    minimumCGPA: 8.5,
    maximumBacklogs: 0,
    eligibleBranches: ["AI & ML", "Data Science", "CSE"],
    requiredSkills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
  {
    companyId: companies[6].id, // Persistent
    title: "Full Stack Developer",
    description: "Build full-stack enterprise applications using React and Node.js.",
    location: "Pune",
    employmentType: "Full-time",
    package: 9.5,
    minimumCGPA: 7.5,
    maximumBacklogs: 0,
    eligibleBranches: ["CSE", "AI & ML", "IT"],
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL"],
    graduationYear: 2025,
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    status: "OPEN",
  },
];

// ─── Main Seed Function ─────────────────────────────────────────────────────
const seed = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Connect and sync schema
    const { testConnection } = require("../config/database");
    await testConnection();
    await sequelize.sync({ alter: true });

    console.log("📋 Clearing existing data...");
    // Clear in reverse order of dependencies
    await Placement.destroy({ where: {}, truncate: true, cascade: true });
    await Interview.destroy({ where: {}, truncate: true, cascade: true });
    await Application.destroy({ where: {}, truncate: true, cascade: true });
    await Job.destroy({ where: {}, truncate: true, cascade: true });
    await Student.destroy({ where: {}, truncate: true, cascade: true });
    await Company.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });

    // ─── 1. Create Admin User ─────────────────────────────────────────────
    console.log("👤 Creating demo users...");
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const adminUser = await User.create({
      name: "Placement Officer",
      email: "admin@campushire.demo",
      password: adminPassword,
      role: "ADMIN",
    });

    // ─── 2. Create Recruiter User ─────────────────────────────────────────
    const recruiterPassword = await bcrypt.hash("Recruiter@123", 10);
    const recruiterUser = await User.create({
      name: "HR Manager",
      email: "recruiter@campushire.demo",
      password: recruiterPassword,
      role: "RECRUITER",
    });

    // ─── 3. Create Demo Student User ─────────────────────────────────────
    const studentPassword = await bcrypt.hash("Student@123", 10);
    const studentUser = await User.create({
      name: "Prathmesh Sharma",
      email: "student@campushire.demo",
      password: studentPassword,
      role: "STUDENT",
    });

    // Create demo student profile
    const demoStudent = await Student.create({
      userId: studentUser.id,
      studentCode: "STU2024001",
      fullName: "Prathmesh Sharma",
      email: "student@campushire.demo",
      phone: "9876543210",
      branch: "AI & ML",
      degree: "B.Tech",
      graduationYear: 2025,
      cgpa: 7.44,
      backlogs: 0,
      skills: ["Python", "SQL", "React", "Machine Learning", "Git"],
    });

    console.log("   ✅ Admin, Recruiter, Student demo accounts created");

    // ─── 4. Create Companies ──────────────────────────────────────────────
    console.log("🏢 Creating 10 companies...");
    const companies = await Company.bulkCreate(companiesData);
    console.log(`   ✅ ${companies.length} companies created`);

    // ─── 5. Create Jobs ───────────────────────────────────────────────────
    console.log("💼 Creating 15 jobs...");
    const jobsData = getJobsData(companies);
    const jobs = await Job.bulkCreate(jobsData);
    console.log(`   ✅ ${jobs.length} jobs created`);

    // ─── 6. Create 50 Additional Students ────────────────────────────────
    console.log("👨‍🎓 Creating 50 students...");
    const studentsData = generateStudents(50);

    for (let i = 0; i < studentsData.length; i++) {
      const sData = studentsData[i];
      const userEmail = sData.email;
      const userPass = await bcrypt.hash("Student@123", 10);

      const user = await User.create({
        name: sData.fullName,
        email: userEmail,
        password: userPass,
        role: "STUDENT",
      });

      await Student.create({ ...sData, userId: user.id });
    }
    console.log(`   ✅ 50 student profiles created`);

    // ─── 7. Create Applications ───────────────────────────────────────────
    console.log("📝 Creating applications...");
    const allStudents = await Student.findAll();
    const allJobs = await Job.findAll();

    const applicationStatuses = ["APPLIED", "APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];
    const createdApplications = [];

    // Each student applies to 2 random jobs
    for (const student of allStudents) {
      const shuffledJobs = [...allJobs].sort(() => Math.random() - 0.5);
      const jobsToApply = shuffledJobs.slice(0, 2);

      for (const job of jobsToApply) {
        const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
        try {
          const app = await Application.create({
            studentId: student.id,
            jobId: job.id,
            status,
            appliedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            shortlistedAt: ["SHORTLISTED", "INTERVIEW", "SELECTED"].includes(status) ? new Date() : null,
            rejectedAt: status === "REJECTED" ? new Date() : null,
          });
          createdApplications.push(app);
        } catch (e) {
          // Skip duplicate applications silently
        }
      }
    }
    console.log(`   ✅ ${createdApplications.length} applications created`);

    // ─── 8. Create Interviews ─────────────────────────────────────────────
    console.log("📅 Creating interviews...");
    const interviewApplications = createdApplications.filter(
      (a) => a.status === "INTERVIEW" || a.status === "SELECTED"
    );

    const rounds = ["APTITUDE", "TECHNICAL", "HR"];
    let interviewCount = 0;

    for (const app of interviewApplications.slice(0, 20)) {
      const numRounds = app.status === "SELECTED" ? 2 : 1;
      for (let r = 0; r < numRounds; r++) {
        const daysFromNow = -7 + r * 3;
        const interviewDate = new Date();
        interviewDate.setDate(interviewDate.getDate() + daysFromNow);

        const isCompleted = daysFromNow < 0;

        await Interview.create({
          applicationId: app.id,
          round: rounds[r % rounds.length],
          scheduledDate: interviewDate.toISOString().split("T")[0],
          scheduledTime: "10:30:00",
          interviewer: "Senior Engineer",
          status: isCompleted ? "COMPLETED" : "SCHEDULED",
          result: isCompleted
            ? app.status === "SELECTED"
              ? "PASS"
              : "PENDING"
            : "PENDING",
        });
        interviewCount++;
      }
    }
    console.log(`   ✅ ${interviewCount} interviews created`);

    // ─── 9. Create Placements ─────────────────────────────────────────────
    console.log("🎓 Creating placements...");
    const selectedApplications = await Application.findAll({
      where: { status: "SELECTED" },
      limit: 10,
    });

    let placementCount = 0;
    for (const app of selectedApplications) {
      const job = await Job.findByPk(app.jobId);
      if (!job) continue;

      try {
        await Placement.create({
          studentId: app.studentId,
          companyId: job.companyId,
          jobId: app.jobId,
          role: job.title,
          package: job.package,
          joiningDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          placementDate: new Date(),
          status: "CONFIRMED",
        });
        placementCount++;
      } catch (e) {
        // Skip if student already placed
      }
    }
    console.log(`   ✅ ${placementCount} placement records created`);

    console.log("\n🎉 Database seeded successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("DEMO CREDENTIALS:");
    console.log("  Admin    → admin@campushire.demo    / Admin@123");
    console.log("  Student  → student@campushire.demo  / Student@123");
    console.log("  Recruiter→ recruiter@campushire.demo / Recruiter@123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
