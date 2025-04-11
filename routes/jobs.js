//routes/jobs.js

const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getFilteredJobs,
  getJobStats,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  createBulkJobs
} = require("../controllers/jobsController");


// CRUD Routes
router.route("/").get(getAllJobs);


// GET /api/jobs (with pagination)
router.route("/create-job").post(createJob); // POST /api/jobs

router.route("/filter").post(getFilteredJobs); // POST /api/jobs/filter (with body filters)

router.route("/stats").get(getJobStats); // GET /api/jobs/stats

router
  .route("/:id")
  .get(getJob) // GET /api/jobs/:id
  .patch(updateJob) // PATCH /api/jobs/:id
  .delete(deleteJob); // DELETE /api/jobs/:id


  router.route('/bulk-jobs')
  .post(createBulkJobs); // POST /api/jobs/bulk

module.exports = router;
