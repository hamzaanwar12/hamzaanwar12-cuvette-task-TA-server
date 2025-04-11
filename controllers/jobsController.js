const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../errors/bad-request")
const NotFoundError = require("../errors/not-found");

// @desc    Get all jobs with pagination
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  // Build query object
  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    query.appliedDate = {};
    if (startDate) query.appliedDate.$gte = new Date(startDate);
    if (endDate) query.appliedDate.$lte = new Date(endDate);
  }

  // Get total count for pagination
  const totalJobs = await Job.countDocuments(query);
  const totalPages = Math.min(Math.ceil(totalJobs / limit), 10); // Max 10 pages

  // Get paginated jobs
  const jobs = await Job.find(query)
    .sort("-appliedDate") // Newest first
    .skip(skip)
    .limit(Number(limit));

  res.status(StatusCodes.OK).json({
    success: true,
    count: jobs.length,
    totalJobs,
    totalPages,
    currentPage: Number(page),
    data: jobs,
  });
};

// @desc    Get filtered jobs based on request body with pagination
// @route   POST /api/jobs/filter
// @access  Public
const getFilteredJobs = async (req, res) => {
  const { page = 1, limit = 10, filters = {} } = req.body;
  const skip = (page - 1) * limit;

  // Build query from filters
  const query = {};

  // Add filters to query
  if (filters.company) {
    query.company = { $regex: filters.company, $options: "i" };
  }
  if (filters.role) {
    query.role = { $regex: filters.role, $options: "i" };
  }
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    query.appliedDate = {};
    if (filters.startDate) query.appliedDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.appliedDate.$lte = new Date(filters.endDate);
  }

  // Get total count for pagination
  const totalJobs = await Job.countDocuments(query);
  const totalPages = Math.min(Math.ceil(totalJobs / limit), 10); // Max 10 pages

  // Get paginated jobs
  const jobs = await Job.find(query)
    .sort("-appliedDate") // Newest first
    .skip(skip)
    .limit(Number(limit));

  res.status(StatusCodes.OK).json({
    success: true,
    count: jobs.length,
    totalJobs,
    totalPages,
    currentPage: Number(page),
    data: jobs,
  });
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Public
const getJobStats = async (req, res) => {
  // Status counts
  const statusStats = await Job.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Monthly applications
  const monthlyStats = await Job.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$appliedDate" },
          month: { $month: "$appliedDate" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      statusStats,
      monthlyStats,
    },
  });
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new NotFoundError(`No job found with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ success: true, data: job });
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Public
const createJob = async (req, res) => {
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: job });
};

// @desc    Update job
// @route   PATCH /api/jobs/:id
// @access  Public
const updateJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    throw new NotFoundError(`No job found with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({ success: true, data: job });
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Public
const deleteJob = async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    throw new NotFoundError(`No job found with id ${req.params.id}`);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: null,
    message: "Job deleted successfully",
  });
};

// @desc    Create multiple jobs at once
// @route   POST /api/jobs/bulk
// @access  Public
const createBulkJobs = async (req, res) => {
  const { jobs } = req.body;

  // Validate input
  if (!Array.isArray(jobs) || jobs.length === 0) {
    throw new BadRequestError("Please provide an array of jobs");
  }

  // Validate each job (optional but recommended)
  const validJobs = jobs.map((job) => {
    return {
      company: job.company,
      role: job.role,
      status: job.status || "Applied",
      appliedDate: job.appliedDate || Date.now(),
      jobLink: job.jobLink || undefined,
    };
  });

  // Insert into DB
  const createdJobs = await Job.insertMany(validJobs, { ordered: false }); // Continue on errors

  res.status(StatusCodes.CREATED).json({
    success: true,
    count: createdJobs.length,
    data: createdJobs,
  });
};

module.exports = {
  getAllJobs,
  getFilteredJobs,
  getJobStats,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  createBulkJobs,
};
