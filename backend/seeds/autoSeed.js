const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");
const MlReport = require("../models/MlReport");

async function autoSeedIfEmpty() {
  try {
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      return { seeded: false, message: "Database already contains users" };
    }

    console.log("🌱 Empty database detected. Auto-seeding demo users and projects...");

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
        { text: "Backend APIs and Authentication completed." },
      ],
    });

    const p2 = await Project.create({
      title: "AI-Powered Plant Disease Detection Using Edge Computing",
      abstract:
        "Deep learning system deployed on Raspberry Pi for real-time crop disease diagnosis.",
      domain: "AI/ML",
      techStack: "Python, PyTorch, OpenCV, Flask, Raspberry Pi, Flutter",
      studentId: student2._id,
      guideId: guide2._id,
      guideStatus: "accepted",
      progressPercent: 35,
      department: "CSE",
      batchYear: "2023",
      startDate: new Date("2024-07-01"),
      expectedEndDate: new Date("2025-04-01"),
      teamMembers: ["Sneha Patel"],
      milestones: [
        {
          name: "Phase 1: Topic selection + SRS",
          status: "approved",
          dueDate: new Date("2024-08-01"),
        },
        {
          name: "Phase 2: UI/Backend development",
          status: "submitted",
          dueDate: new Date("2024-11-01"),
        },
        {
          name: "Phase 3: ML integration",
          status: "pending",
          dueDate: new Date("2025-02-01"),
        },
        {
          name: "Phase 4: Final report + Demo",
          status: "pending",
          dueDate: new Date("2025-04-01"),
        },
      ],
    });

    await Review.create({
      projectId: p1._id,
      guideId: guide1._id,
      milestoneName: "Phase 1: Topic selection + SRS",
      status: "approved",
      comments: "Excellent SRS document with clear architectural diagrams.",
      score: 9,
    });

    await Review.create({
      projectId: p1._id,
      guideId: guide1._id,
      milestoneName: "Phase 2: UI/Backend development",
      status: "approved",
      comments: "Auth and project management APIs working properly.",
      score: 8.5,
    });

    await MlReport.create({
      projectId: p1._id,
      delayRisk: "low",
      performanceRisk: "low",
      delayPercentage: 15,
      detail: { risk: "low", message: "On track" },
    });

    console.log("✅ Database auto-seeded successfully with demo accounts.");
    return {
      seeded: true,
      message: "Database seeded successfully",
      users: {
        student: "leelasaisabbarapu22@gmail.com / student123",
        guide: "guide1@edutrack.com / guide123",
        admin: "admin@edutrack.com / admin123",
      },
    };
  } catch (error) {
    console.error("Auto-seed error:", error);
    return { seeded: false, error: error.message };
  }
}

module.exports = { autoSeedIfEmpty };
