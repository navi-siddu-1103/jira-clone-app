const express = require("express");

const {
    createProject,
    getProjects,
    getProjectById,
} = require("../controllers/projectController");

const router = express.Router();

// POST /api/projects
router.post("/", createProject);

// Get all projects
router.get("/", getProjects);

// Get single project
router.get("/:id", getProjectById);

module.exports = router;