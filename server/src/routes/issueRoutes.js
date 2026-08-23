const express = require("express");

const {
    createIssue,
    getAllIssues,
    getIssuesByProject,
    updateIssue,
} = require("../controllers/issueController");

const router = express.Router();

// Create issue
router.post("/", createIssue);
// Get all issues
router.get("/", getAllIssues);
// Get issues by project
router.get("/project/:projectId", getIssuesByProject);
// Update issue
router.put("/:id", updateIssue);

module.exports = router;