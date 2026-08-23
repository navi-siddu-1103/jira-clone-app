const Project = require("../models/Project");

const createProject = async (req, res) => {
    try {
        console.log("=================================");
        console.log("CREATE PROJECT CONTROLLER CALLED");
        console.log("Request body:", req.body);

        const {
            name,
            key,
            description,
            ownerId,
            memberIds,
        } = req.body;

        // Validate required fields
        if (!name || !key || !ownerId) {
            return res.status(400).json({
                success: false,
                message: "Name, key and ownerId are required",
            });
        }

        const normalizedKey = key.toUpperCase().trim();

        // Check whether project key already exists
        const existingProject = await Project.findOne({
            key: normalizedKey,
        });

        if (existingProject) {
            return res.status(409).json({
                success: false,
                message: "Project with this key already exists",
            });
        }

        // Create project
        const project = await Project.create({
            name: name.trim(),
            key: normalizedKey,
            description: description ? description.trim() : "",
            ownerId,
            memberIds: memberIds || [ownerId],
        });

        console.log("Project created:", project._id);

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: {
                project,
            },
        });
    } catch (error) {
        console.error("Create project error:", error);

        // MongoDB duplicate key protection
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Project with this key already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error while creating project",
            error: error.message,
        });
    }
};

// GET ALL PROJECTS
const getProjects = async (req, res) => {
    try {
        console.log("GET PROJECTS CONTROLLER CALLED");

        const projects = await Project.find()
            .populate("ownerId", "name email")
            .populate("memberIds", "name email");

        return res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: {
                projects,
            },
        });
    } catch (error) {
        console.error("Get projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching projects",
            error: error.message,
        });
    }
};


// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("GET PROJECT BY ID:", id);

        const project = await Project.findById(id)
            .populate("ownerId", "name email")
            .populate("memberIds", "name email");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: {
                project,
            },
        });
    } catch (error) {
        console.error("Get project error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching project",
            error: error.message,
        });
    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
};