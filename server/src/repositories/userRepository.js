const User = require("../models/User");

const createUser = async (userData) => {
    return await User.create(userData);
};

const getAllUsers = async () => {
    return await User.find().select("-password");
};

const getUserById = async (id) => {
    return await User.findById(id).select("-password");
};

const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const updateUser = async (id, updateData) => {
    return await User.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");
};

const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    updateUser,
    deleteUser,
};