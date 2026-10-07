require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");
const MlReport = require("../models/MlReport");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/edutrack";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await User.deleteMany({});
  await Project.deleteMany({});
  await Review.deleteMany({});
  await MlReport.deleteMany({});

  const admin = await User.create({
    name: "Admin User",
    email: "admin@edutrack.com",
    password: "admin123",
    role: "admin",
    department: "IT",
  });

  const guide1 = await User.create({
    name: "Dr. Rajesh Kumar",
    email: "guide1@edutrack.com",
    password: "guide123",
    role: "guide",
    department: "CSE",
  });

  const guide2 = await User.create({
    name: "Prof. Priya Sharma",
    email: "guide2@edutrack.com",
    password: "guide123",
    role: "guide",
    department: "CSE",
  });

  const student1 = await User.create({
    name: "Leela Sai Sabbarapu",
    email: "leelasaisabbarapu22@gmail.com",
    password: "student123",
    role: "student",
    rollNumber: "MCA2026-001",
    department: "MCA",
    batchYear: "2026",
  });

  const student2 = await User.create({
    name: "Sneha Patel",
    email: "student2@edutrack.com",
    password: "student123",
    role: "student",
    rollNumber: "CSE23MCA002",
    department: "CSE",
    batchYear: "2023",
  });

  const p1 = await Project.create({
    title: "ProjectHub – Full-Stack Project Showcase Platform",
    abstract:
      "A MERN stack-based web application that enables students to upload, explore, and interact with academic projects.",
    domain: "Web",
    techStack: "React.js, Node.js, Express.js, MongoDB, Socket.io, JWT, Multer, Nodemailer",
    studentId: student1._id,
    guideId: guide1._id,
    guideStatus: "accepted",
    progressPercent: 60,
    department: "MCA",
    batchYear: "2026",
    startDate: new Date("2024-06-01"),
    expectedEndDate: new Date("2025-03-01"),
    teamMembers: ["Leela Sai Sabbarapu"],
    milestones: [
      {
        name: "Phase 1: Topic selection + SRS",
        status: "approved",
        dueDate: new Date("2024-07-15"),
      },
      {
        name: "Phase 2: UI/Backend development",
        status: "approved",
        dueDate: new Date("2024-10-01"),
      },
      {
        name: "Phase 3: ML integration",
        status: "submitted",
        dueDate: new Date("2025-01-15"),
      },
      {
        name: "Phase 4: Final report + Demo",
        status: "pending",
        dueDate: new Date("2025-03-01"),
      },
    ],
    progressUpdates: [
      { text: "Completed SRS document and got approval." },
      { text: "Frontend and API integration in progress." },
    ],
  });

  const p2 = await Project.create({
    title: "Mini Shopping Web App",
    abstract:
      "A web app using HTML, CSS, JS, and Bootstrap to display categorized product listings for men, women, and kids with basic filtering.",
    domain: "Web Development",
    techStack: "HTML, CSS, JavaScript, Bootstrap",
    studentId: student2._id,
    guideId: null,
    guideStatus: "pending",
    progressPercent: 20,
    department: "MCA",
    batchYear: "2026",
    startDate: new Date("2024-08-01"),
    expectedEndDate: new Date("2025-04-01"),
    teamMembers: ["Sneha Patel"],
    milestones: [
      {
        name: "Phase 1: UI Design + Responsiveness",
        status: "approved",
        dueDate: new Date("2024-09-01"),
      },
      {
        name: "Phase 2: Product Listings integration",
        status: "pending",
        dueDate: new Date("2024-12-01"),
      },
      {
        name: "Phase 3: Filtering logic",
        status: "pending",
        dueDate: new Date("2025-02-01"),
      },
      {
        name: "Phase 4: Final deployment",
        status: "pending",
        dueDate: new Date("2025-04-01"),
      },
    ],
  });

  await Review.create({
    projectId: p1._id,
    guideId: guide1._id,
    comments: "Good progress. Please add unit tests for API.",
    milestoneName: "Phase 2: UI/Backend development",
    status: "approved",
  });

  await MlReport.create({
    projectId: p1._id,
    delayRisk: "low",
    similarityScore: 0,
    performanceRisk: "low",
  });

  console.log(
    "Seed completed. Created: 1 admin, 2 guides, 2 students, 2 projects.",
  );
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
