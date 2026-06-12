const Contact = require('../models/Contact');
const jsonDb = require('../config/jsonDb');

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const { name, email, phone, message } = req.body;
      if (!name || !email || !phone || !message) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      const savedContact = jsonDb.submitContactForm({ name, email, phone, message });
      return res.status(201).json(savedContact);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      message,
    });

    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getContactMessages = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const messages = jsonDb.getContactMessages();
      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
const markMessageAsRead = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const updatedMessage = jsonDb.markMessageAsRead(req.params.id);
      if (updatedMessage) {
        return res.json(updatedMessage);
      } else {
        return res.status(404).json({ message: 'Message not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const message = await Contact.findById(req.params.id);

    if (message) {
      message.isRead = true;
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteContactMessage(req.params.id);
      if (success) {
        return res.json({ message: 'Message deleted' });
      } else {
        return res.status(404).json({ message: 'Message not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const message = await Contact.findById(req.params.id);

    if (message) {
      await Contact.deleteOne({ _id: req.params.id });
      res.json({ message: 'Message deleted' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitContactForm,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage,
};
