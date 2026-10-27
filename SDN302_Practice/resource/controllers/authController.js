const fs = require('node:fs/promises');
const path = require('node:path');
const jwt = require('jsonwebtoken');

const createToken = async (req, res, next) => {
    const { name, pass } = req.body || {};
    if (typeof name !== 'string' || typeof pass !== 'string' || !name.trim() || !pass) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    let members;
    try {
        members = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'members.json'), 'utf8'));
        if (!Array.isArray(members) || !members.every(member => member &&
            typeof member.name === 'string' && typeof member.pass === 'string')) {
            throw new Error('Invalid members format');
        }
    } catch {
        return res.status(500).json({ message: 'Authentication credential file is unavailable or invalid' });
    }

    if (!members.some(member => member.name === name && member.pass === pass)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Authentication is not configured' });
    }

    try {
        const token = jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    } catch (error) {
        return next(error);
    }
};

module.exports = { createToken };
