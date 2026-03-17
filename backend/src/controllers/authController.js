const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone, address } = req.body;

        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already exists' });

        const user = new User({ name, email, password, role, phone, address });
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, profileImage } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (profileImage) user.profileImage = profileImage;

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin only: Get list of delivery boys
exports.getDeliveryBoys = async (req, res) => {
    try {
        const deliveryBoys = await User.find({ role: 'delivery' }).select('name email phone isActive');
        res.json(deliveryBoys);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin only: Create new delivery boy
exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email/ID already exists' });

        const user = new User({
            name,
            email,
            password,
            phone,
            role: 'delivery'
        });

        await user.save();
        res.status(201).json({ message: 'Staff account created successfully', user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin only: Delete staff member
exports.deleteStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        await User.findByIdAndDelete(staffId);
        res.json({ message: 'Staff member removed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Temporary Admin check for old routes if needed
exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        let user = await User.findOne({ email: username, role: 'admin' });

        if (!user) {
            // Create the admin user if they don't exist yet
            user = new User({
                name: 'Admin',
                email: username,
                password: password, // Will be hashed by pre-save
                role: 'admin'
            });
            await user.save();
        }

        const token = jwt.sign({ role: 'admin', userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return res.json({
            token,
            message: 'Logged in successfully',
            user: {
                id: user._id,
                role: 'admin',
                name: user.name,
                email: user.email
            }
        });
    }

    res.status(401).json({ message: 'Invalid credentials' });
};

