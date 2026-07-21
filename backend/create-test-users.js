const mongoose = require("mongoose");
const User = require("./models/User");

const createTestUsers = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/edutrack");
    console.log("Connected to MongoDB");

    // Check if users already exist
    const existingUsers = await User.find({});
    console.log("Existing users:", existingUsers.length);

    if (existingUsers.length === 0) {
      // Create test users
      const users = await User.create([
        {
          name: "Admin User",
          email: "admin@edutech.com",
          password: "password123",
          role: "admin",
          department: "CSE",
        },
        {
          name: "Dr. John Smith",
          email: "guide@edutech.com",
          password: "password123",
          role: "guide",
          department: "CSE",
        },
        {
          name: "Alice Johnson",
          email: "student@edutech.com",
          password: "password123",
          role: "student",
          rollNumber: "CS2021001",
          department: "CSE",
          batchYear: "2021",
        },
      ]);

      console.log("Test users created:");
      users.forEach((user) => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log("Users already exist:");
      existingUsers.forEach((user) => {
        console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUsers();
