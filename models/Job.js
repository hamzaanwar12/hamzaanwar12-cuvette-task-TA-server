const mongoose = require('mongoose');

// Define the Job Schema
const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
      maxlength: [50, 'Company name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      required: [true, 'Please provide a job role'],
      trim: true,
      maxlength: [100, 'Job role cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now, // Automatically sets to current date
    },
    jobLink: {
      type: String,
      trim: true,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please provide a valid URL (http/https)',
      ],
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Create indexes for faster querying
jobSchema.index({ company: 1, role: 1 }); // For duplicate checks
jobSchema.index({ status: 1 }); // For filtering by status
jobSchema.index({ appliedDate: -1 }); // For sorting by newest first

// Export the model
module.exports = mongoose.model('Job', jobSchema);