const User = require("../models/User");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
    try {
        console.log("Signup request received");
        console.log(req.body);

        const { name, email, password, group } = req.body;

        // 1. Validate fields
        if (!name || !email || !password || !group) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 2. Check existing user
        console.log("Checking existing user...");

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        console.log("Existing user:", existingUser);

        if (existingUser) {
            console.log("Duplicate email detected");

            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // 3. Hash password
        console.log("Hashing password...");

        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        console.log("Creating user...");

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            group: group.trim(),
        });

        console.log("User created:", user._id);

        // 5. Remove password from response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            group: user.group,
            role: user.role,
            avatar: user.avatar,
        };

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: userResponse,
            },
        });

    } catch (error) {
        console.error("Signup error:", error);

        // Duplicate MongoDB email
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during signup",
            error: error.message,
        });
    }
};


// =====================================================
// LOGIN
// =====================================================

const login = async (req, res) => {
    try {
        console.log("Login request received");
        console.log(req.body);

        const { email, password } = req.body;

        // 1. Validate fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // 2. Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // 3. Find user
        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 4. Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // 5. Remove password from response
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            group: user.group,
            role: user.role,
            avatar: user.avatar,
        };

        // 6. Login successful
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userResponse,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message,
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    signup,
    login,
};