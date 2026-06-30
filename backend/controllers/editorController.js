const EditorInfo = require('../models/EditorInfo');
const jsonDb = require('../config/jsonDb');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get Editor-in-Chief details
// @route   GET /api/editor
// @access  Public
const getEditorInfo = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const editor = jsonDb.getEditorInfo();
      return res.json(editor);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    let editor = await EditorInfo.findOne();
    if (!editor) {
      // Seed default if MongoDB is empty but active
      editor = new EditorInfo({
        nameEn: 'Admin Editor',
        nameHi: 'एडमिन संपादक',
        roleEn: 'Editor-in-Chief',
        roleHi: 'मुख्य संपादक',
        descriptionEn: 'Passionate journalist dedicated to delivering accurate and timely news to the local community.',
        descriptionHi: 'स्थानीय समुदाय तक सटीक और समय पर समाचार पहुंचाने के लिए समर्पित पत्रकार।',
        photoUrl: '',
      });
      await editor.save();
    }
    res.json(editor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Editor-in-Chief details
// @route   PUT /api/editor
// @access  Private/Admin
const updateEditorInfo = async (req, res) => {
  const { nameEn, nameHi, roleEn, roleHi, descriptionEn, descriptionHi } = req.body;

  let existingEditor = null;
  if (global.useJsonDb) {
    existingEditor = jsonDb.getEditorInfo();
  } else {
    try {
      existingEditor = await EditorInfo.findOne();
    } catch (err) {}
  }

  let photoUrl = existingEditor ? existingEditor.photoUrl : '';

  if (req.file) {
    try {
      // Delete old photo file
      if (existingEditor && existingEditor.photoUrl) {
        if (existingEditor.photoUrl.startsWith('/uploads/')) {
          const absolutePath = path.join(__dirname, '..', existingEditor.photoUrl);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        } else {
          await deleteFromCloudinary(existingEditor.photoUrl);
        }
      }

      // Upload new photo
      const uploadResult = await uploadToCloudinary(req.file, 'editor_photos');
      photoUrl = uploadResult.secure_url;
    } catch (err) {
      return res.status(500).json({ message: 'Photo upload/delete failed: ' + err.message });
    }
  }

  if (global.useJsonDb) {
    try {
      const updatedEditor = jsonDb.updateEditorInfo({
        nameEn: nameEn || (existingEditor ? existingEditor.nameEn : ''),
        nameHi: nameHi || (existingEditor ? existingEditor.nameHi : ''),
        roleEn: roleEn || (existingEditor ? existingEditor.roleEn : 'Editor-in-Chief'),
        roleHi: roleHi || (existingEditor ? existingEditor.roleHi : 'मुख्य संपादक'),
        descriptionEn: descriptionEn !== undefined ? descriptionEn : (existingEditor ? existingEditor.descriptionEn : ''),
        descriptionHi: descriptionHi !== undefined ? descriptionHi : (existingEditor ? existingEditor.descriptionHi : ''),
        photoUrl,
      });

      return res.json(updatedEditor);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    let editor = await EditorInfo.findOne();

    const editorData = {
      nameEn: nameEn || (editor ? editor.nameEn : ''),
      nameHi: nameHi || (editor ? editor.nameHi : ''),
      roleEn: roleEn || (editor ? editor.roleEn : 'Editor-in-Chief'),
      roleHi: roleHi || (editor ? editor.roleHi : 'मुख्य संपादक'),
      descriptionEn: descriptionEn !== undefined ? descriptionEn : (editor ? editor.descriptionEn : ''),
      descriptionHi: descriptionHi !== undefined ? descriptionHi : (editor ? editor.descriptionHi : ''),
      photoUrl,
    };

    if (editor) {
      editor = await EditorInfo.findByIdAndUpdate(editor._id, editorData, { new: true });
    } else {
      editor = new EditorInfo(editorData);
      await editor.save();
    }

    res.json(editor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEditorInfo,
  updateEditorInfo,
};
