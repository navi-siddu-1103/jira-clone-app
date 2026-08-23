const Issue = require("../models/Issue");
const Project = require("../models/Project");
const User = require("../models/User");


// =====================================================
// CREATE ISSUE
// =====================================================

const createIssue = async (req, res) => {
    try {
        console.log("=================================");
        console.log("CREATE ISSUE CONTROLLER CALLED");
        console.log("Request body:", req.body);

        const {
            title,
            description,
            type,
            priority,
            projectId,
            assignee,
            dueDate,
        } = req.body;

        // 1. Validate required fields
        if (!title || !projectId) {
            return res.status(400).json({
                success: false,
                message: "Title and projectId are required",
            });
        }

        // 2. Check project
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // 3. Check assignee if provided
        if (assignee) {
            const user = await User.findById(assignee);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Assignee not found",
                });
            }
        }

        // 4. Create issue
        const issue = await Issue.create({
            title: title.trim(),
            description: description ? description.trim() : "",
            type: type || "TASK",
            priority: priority || "MEDIUM",
            status: "TODO",
            projectId,
            assignee: assignee || null,
            dueDate: dueDate || null,
        });

        console.log("Issue created:", issue._id);

        // 5. Fetch populated issue
        const populatedIssue = await Issue.findById(issue._id)
            .populate("projectId", "name key")
            .populate("assignee", "name email");

        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: {
                issue: populatedIssue,
            },
        });

    } catch (error) {
        console.error("Create issue error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating issue",
            error: error.message,
        });
    }
};

const getAllIssues = async (req, res) => {
    try {
        console.log("GET ALL ISSUES CONTROLLER CALLED");

        const issues = await Issue.find()
            .populate("projectId", "name key")
            .populate("assignee", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: issues.length,
            data: {
                issues,
            },
        });

    } catch (error) {
        console.error("Get all issues error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching issues",
            error: error.message,
        });
    }
};

// GET ISSUES BY PROJECT

const getIssuesByProject = async (req, res) => {
    try {
        console.log("GET ISSUES BY PROJECT CONTROLLER CALLED");

        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID is required",
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const issues = await Issue.find({
            projectId,
        })
            .populate("projectId", "name key")
            .populate("assignee", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: issues.length,
            data: {
                issues,
            },
        });

    } catch (error) {
        console.error("Get project issues error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while fetching project issues",
            error: error.message,
        });
    }
};

// UPDATE ISSUE
// =====================================================

const updateIssue = async (req, res) => {
    try {
        console.log("UPDATE ISSUE CONTROLLER CALLED");
        console.log("Issue ID:", req.params.id);
        console.log("Request body:", req.body);

        const { id } = req.params;

        const {
            title,
            description,
            type,
            priority,
            status,
            assignee,
            dueDate,
        } = req.body;

        // 1. Find issue
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
            });
        }

        // 2. Update only provided fields
        if (title !== undefined) {
            issue.title = title.trim();
        }

        if (description !== undefined) {
            issue.description = description;
        }

        if (type !== undefined) {
            issue.type = type;
        }

        if (priority !== undefined) {
            issue.priority = priority;
        }

        if (status !== undefined) {
            issue.status = status;
        }

        if (assignee !== undefined) {
            if (assignee) {
                const user = await User.findById(assignee);

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "Assignee not found",
                    });
                }
            }

            issue.assignee = assignee || null;
        }

        if (dueDate !== undefined) {
            issue.dueDate = dueDate || null;
        }

        // 3. Save changes
        await issue.save();

        // 4. Populate related data
        const updatedIssue = await Issue.findById(issue._id)
            .populate("projectId", "name key")
            .populate("assignee", "name email");

        return res.status(200).json({
            success: true,
            message: "Issue updated successfully",
            data: {
                issue: updatedIssue,
            },
        });

    } catch (error) {
        console.error("Update issue error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while updating issue",
            error: error.message,
        });
    }
};

module.exports = {
    createIssue,
    getAllIssues,
    getIssuesByProject,
    updateIssue,
};