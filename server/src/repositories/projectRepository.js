const Project = require("../models/Project");

const createProject = async (projectData) => {
    return await Project.create(projectData);
};

const findProjectByKey = async (key) => {
    return await Project.findOne({
        key: key.toUpperCase().trim(),
    });
};

const findProjectById = async (id) => {
    return await Project.findById(id);
};

module.exports = {
    createProject,
    findProjectByKey,
    findProjectById,
};