const express = require("express");
const router = express.Router();
const JobRequest = require("../models/JobRequest");
const protect = require("../middleware/auth");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ─── GET /api/jobs ─────────────────────────────────────────────────────────
// PUBLIC
router.get("/", async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await JobRequest.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/jobs/:id ──────────────────────────────────────────────────────
// PUBLIC
router.get("/:id", async (req, res, next) => {
  try {
    const job = await JobRequest.findById(req.params.id);
    if (!job) {
      return next(createError(`Job not found with id ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/jobs ─────────────────────────────────────────────────────────
// PROTECTED 🔐
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, description, category, location, contactName, contactEmail } =
      req.body;

    if (!title || !description) {
      return next(createError("Title and description are required", 400));
    }

    const job = await JobRequest.create({
      title,
      description,
      category,
      location,
      contactName,
      contactEmail,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/jobs/:id ────────────────────────────────────────────────────
// PROTECTED 🔐
router.patch("/:id", protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Open", "In Progress", "Closed"];

    if (!status || !allowedStatuses.includes(status)) {
      return next(
        createError(`Status must be one of: ${allowedStatuses.join(", ")}`, 400)
      );
    }

    const job = await JobRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return next(createError(`Job not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/jobs/:id ───────────────────────────────────────────────────
// PROTECTED 🔐
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const job = await JobRequest.findByIdAndDelete(req.params.id);

    if (!job) {
      return next(createError(`Job not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: {},
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;