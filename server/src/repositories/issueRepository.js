const Issue = require("../models/Issue");

const createIssue = async (issueData) => {
    return await Issue.create(issueData);
};

const getAllIssues = async () => {
    return await Issue.find()
        .populate("projectId", "name key")
        .populate("assigneeId", "name email")
        .populate("reporterId", "name email")
        .sort({ createdAt: -1 });
};

const getIssuesByProject = async (projectId) => {
    return await Issue.find({ projectId })
        .populate("assigneeId", "name email")
        .populate("reporterId", "name email")
        .sort({ createdAt: -1 });
};

const getIssueById = async (id) => {
    return await Issue.findById(id)
        .populate("projectId", "name key")
        .populate("assigneeId", "name email")
        .populate("reporterId", "name email");
};

const updateIssue = async (id, updateData) => {
    return await Issue.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );
};

const deleteIssue = async (id) => {
    return await Issue.findByIdAndDelete(id);
};

module.exports = {
    createIssue,
    getAllIssues,
    getIssuesByProject,
    getIssueById,
    updateIssue,
    deleteIssue,
};