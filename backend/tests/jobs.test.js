const request = require("supertest");
const app = require("../server");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

jest.setTimeout(30000);

let mongoServer;
let authToken;

// ─── Sample job data ──────────────────────────────────────────────────────────
const sampleJob = {
  title: "Leaking kitchen tap",
  description: "Tap has been dripping for a week, needs urgent repair",
  category: "Plumbing",
  location: "Glasgow",
  contactName: "John Smith",
  contactEmail: "john@example.com",
};

const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  // Register and login to get a fresh token before each test
  const res = await request(app)
    .post("/api/auth/register")
    .send(testUser);
  authToken = res.body.token;
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
describe("GET /api/jobs", () => {
  it("should return empty array when no jobs exist", async () => {
    const res = await request(app).get("/api/jobs");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it("should return all jobs", async () => {
    // Create two jobs first
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);

    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...sampleJob, title: "Fix bathroom sink", category: "Plumbing" });

    const res = await request(app).get("/api/jobs");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.count).toBe(2);
  });

  it("should filter jobs by category", async () => {
    // Create a Plumbing job
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);

    // Create an Electrical job
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ...sampleJob,
        title: "Fix wiring",
        category: "Electrical",
      });

    const res = await request(app).get("/api/jobs?category=Plumbing");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe("Plumbing");
  });

  it("should filter jobs by status", async () => {
    // Create an open job
    const created = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);

    const jobId = created.body.data._id;

    // Update to In Progress
    await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "In Progress" });

    // Create another open job
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...sampleJob, title: "Another job" });

    const res = await request(app).get("/api/jobs?status=Open");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe("Open");
  });

  it("should search jobs by keyword in title", async () => {
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob); // title: "Leaking kitchen tap"

    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...sampleJob, title: "Paint the living room" });

    const res = await request(app).get("/api/jobs?search=kitchen");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toMatch(/kitchen/i);
  });
});

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
describe("GET /api/jobs/:id", () => {
  it("should return a single job by id", async () => {
    const created = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);

    const jobId = created.body.data._id;
    const res = await request(app).get(`/api/jobs/${jobId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(jobId);
    expect(res.body.data.title).toBe(sampleJob.title);
  });

  it("should return 404 for non-existent job id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/jobs/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for invalid id format", async () => {
    const res = await request(app).get("/api/jobs/invalid-id-format");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
describe("POST /api/jobs", () => {
  it("should create a new job when authenticated", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(sampleJob.title);
    expect(res.body.data.status).toBe("Open"); // default status
    expect(res.body.data._id).toBeDefined();
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .send(sampleJob);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if title is missing", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: "Some description" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if description is missing", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Some title" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should default status to Open", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);

    expect(res.body.data.status).toBe("Open");
  });
});

// ─── PATCH /api/jobs/:id ──────────────────────────────────────────────────────
describe("PATCH /api/jobs/:id", () => {
  let jobId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);
    jobId = res.body.data._id;
  });

  it("should update job status when authenticated", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "In Progress" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("In Progress");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .send({ status: "In Progress" });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for invalid status value", async () => {
    const res = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "InvalidStatus" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for non-existent job", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/jobs/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "Closed" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
describe("DELETE /api/jobs/:id", () => {
  let jobId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${authToken}`)
      .send(sampleJob);
    jobId = res.body.data._id;
  });

  it("should delete a job when authenticated", async () => {
    const res = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's actually deleted
    const check = await request(app).get(`/api/jobs/${jobId}`);
    expect(check.statusCode).toBe(404);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(app)
      .delete(`/api/jobs/${jobId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for non-existent job", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/jobs/${fakeId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});