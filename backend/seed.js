const mongoose = require("mongoose");
const dotenv = require("dotenv");
const JobRequest = require("./models/JobRequest");

dotenv.config();

const sampleJobs = [
  {
    title: "Leaking kitchen tap",
    description: "My kitchen tap has been dripping constantly for a week. Needs urgent repair.",
    category: "Plumbing",
    location: "Glasgow",
    contactName: "Sarah Connor",
    contactEmail: "sarah.connor@email.com",
    status: "Open",
  },
  {
    title: "Rewire living room sockets",
    description: "Three plug sockets in the living room have stopped working. Possible wiring issue.",
    category: "Electrical",
    location: "Edinburgh",
    contactName: "John Reese",
    contactEmail: "john.reese@email.com",
    status: "Open",
  },
  {
    title: "Paint entire hallway",
    description: "Need hallway painted top to bottom including ceiling. Two coats minimum. Colour TBD.",
    category: "Painting",
    location: "Aberdeen",
    contactName: "Amy Pond",
    contactEmail: "amy.pond@email.com",
    status: "In Progress",
  },
  {
    title: "Build fitted wardrobe",
    description: "Looking for someone to build a fitted wardrobe in the master bedroom, approx 3m wide.",
    category: "Joinery",
    location: "Dundee",
    contactName: "Rory Williams",
    contactEmail: "rory.w@email.com",
    status: "Open",
  },
  {
    title: "Fix garden gate latch",
    description: "Wooden garden gate latch is broken and gate won't close properly.",
    category: "Joinery",
    location: "Stirling",
    contactName: "Clara Oswald",
    contactEmail: "clara.o@email.com",
    status: "Closed",
  },
  {
    title: "Install outdoor security light",
    description: "Need a motion-sensor security light installed above the front door.",
    category: "Electrical",
    location: "Glasgow",
    contactName: "Bruce Wayne",
    contactEmail: "bruce@waynemanor.com",
    status: "Open",
  },
  {
    title: "Bathroom ceiling repaint",
    description: "Bathroom ceiling has mould patches after a leak. Needs treating and repainting.",
    category: "Painting",
    location: "Perth",
    contactName: "Diana Prince",
    contactEmail: "diana.p@email.com",
    status: "Open",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await JobRequest.deleteMany({});
    console.log("🗑️  Cleared existing jobs");

    await JobRequest.insertMany(sampleJobs);
    console.log(`🌱 Inserted ${sampleJobs.length} sample jobs`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seedDB();