const Subdivision = require('../models/Subdivision');
const jsonDb = require('../config/jsonDb');

const defaultSubdivisions = ['Khalilabad', 'Mehdawal', 'Dhanghata'];

// @desc    Get all subdivisions (default + custom)
// @route   GET /api/subdivisions
// @access  Public
const getSubdivisions = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const custom = jsonDb.getSubdivisions();
      const unique = Array.from(new Set([...defaultSubdivisions, ...custom]));
      return res.json(unique);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const dbSubs = await Subdivision.find({});
    const custom = dbSubs.map(s => s.name);
    const unique = Array.from(new Set([...defaultSubdivisions, ...custom]));
    res.json(unique);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new subdivision
// @route   POST /api/subdivisions
// @access  Private/Admin
const createSubdivision = async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Subdivision name is required' });
  }

  const trimmedName = name.trim();

  // Check if it exists in defaults
  if (defaultSubdivisions.map(s => s.toLowerCase()).includes(trimmedName.toLowerCase())) {
    return res.status(400).json({ message: 'Subdivision already exists as a default' });
  }

  if (global.useJsonDb) {
    try {
      const created = jsonDb.createSubdivision(trimmedName);
      if (!created) {
        return res.status(400).json({ message: 'Subdivision already exists' });
      }
      return res.status(201).json({ name: created });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const exists = await Subdivision.findOne({ name: { $regex: new RegExp('^' + trimmedName + '$', 'i') } });
    if (exists) {
      return res.status(400).json({ message: 'Subdivision already exists' });
    }

    const subdivision = new Subdivision({ name: trimmedName });
    await subdivision.save();
    res.status(201).json(subdivision);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a subdivision
// @route   DELETE /api/subdivisions/:name
// @access  Private/Admin
const deleteSubdivision = async (req, res) => {
  const { name } = req.params;
  if (defaultSubdivisions.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
    return res.status(400).json({ message: 'Cannot delete default subdivisions' });
  }

  if (global.useJsonDb) {
    try {
      const deleted = jsonDb.deleteSubdivision(name);
      if (!deleted) {
        return res.status(404).json({ message: 'Subdivision not found' });
      }
      return res.json({ message: 'Subdivision deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const deleted = await Subdivision.findOneAndDelete({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (!deleted) {
      return res.status(404).json({ message: 'Subdivision not found' });
    }
    res.json({ message: 'Subdivision deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSubdivisions,
  createSubdivision,
  deleteSubdivision,
};
