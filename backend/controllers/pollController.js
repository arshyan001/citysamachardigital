const Poll = require('../models/Poll');
const jsonDb = require('../config/jsonDb');

const DEFAULT_POLL = {
  questionEn: 'Will the new digital library under construction in Khalilabad be highly beneficial for students?',
  questionHi: 'क्या खलीलाबाद में बन रही नई डिजिटल लाइब्रेरी छात्रों के लिए बहुत मददगार होगी?',
  option1En: 'Yes, absolutely',
  option1Hi: 'हाँ, बिल्कुल',
  option2En: 'No, not helpful',
  option2Hi: 'नहीं, उपयोगी नहीं है',
  option3En: "Can't say",
  option3Hi: 'कह नहीं सकते',
  votesOption1: 72,
  votesOption2: 18,
  votesOption3: 10
};

// @desc    Get active opinion poll
// @route   GET /api/poll
// @access  Public
const getPoll = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const poll = jsonDb.getPoll();
      return res.json(poll);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    let poll = await Poll.findOne();
    if (!poll) {
      // Seed default poll
      poll = new Poll(DEFAULT_POLL);
      await poll.save();
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote in opinion poll
// @route   POST /api/poll/vote
// @access  Public
const votePoll = async (req, res) => {
  const { option } = req.body;
  const optionNum = parseInt(option);

  if (![1, 2, 3].includes(optionNum)) {
    return res.status(400).json({ message: 'Invalid vote option. Choose 1, 2, or 3.' });
  }

  if (global.useJsonDb) {
    try {
      const poll = jsonDb.votePoll(optionNum);
      if (poll) {
        return res.json(poll);
      } else {
        return res.status(404).json({ message: 'Poll not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const poll = await Poll.findOne();
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (optionNum === 1) {
      poll.votesOption1 = (poll.votesOption1 || 0) + 1;
    } else if (optionNum === 2) {
      poll.votesOption2 = (poll.votesOption2 || 0) + 1;
    } else if (optionNum === 3) {
      poll.votesOption3 = (poll.votesOption3 || 0) + 1;
    }

    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update opinion poll (Admin only)
// @route   PUT /api/poll
// @access  Private/Admin
const updatePoll = async (req, res) => {
  const {
    questionEn,
    questionHi,
    option1En,
    option1Hi,
    option2En,
    option2Hi,
    option3En,
    option3Hi,
    resetVotes
  } = req.body;

  const updateData = {
    questionEn,
    questionHi,
    option1En,
    option1Hi,
    option2En,
    option2Hi,
    option3En,
    option3Hi
  };

  const shouldReset = resetVotes === true || resetVotes === 'true';

  if (shouldReset) {
    updateData.votesOption1 = 0;
    updateData.votesOption2 = 0;
    updateData.votesOption3 = 0;
  }

  if (global.useJsonDb) {
    try {
      const poll = jsonDb.updatePoll(updateData);
      return res.json(poll);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    let poll = await Poll.findOne();
    if (!poll) {
      poll = new Poll({
        ...updateData,
        votesOption1: shouldReset ? 0 : DEFAULT_POLL.votesOption1,
        votesOption2: shouldReset ? 0 : DEFAULT_POLL.votesOption2,
        votesOption3: shouldReset ? 0 : DEFAULT_POLL.votesOption3,
      });
    } else {
      poll.questionEn = questionEn !== undefined ? questionEn : poll.questionEn;
      poll.questionHi = questionHi !== undefined ? questionHi : poll.questionHi;
      poll.option1En = option1En !== undefined ? option1En : poll.option1En;
      poll.option1Hi = option1Hi !== undefined ? option1Hi : poll.option1Hi;
      poll.option2En = option2En !== undefined ? option2En : poll.option2En;
      poll.option2Hi = option2Hi !== undefined ? option2Hi : poll.option2Hi;
      poll.option3En = option3En !== undefined ? option3En : poll.option3En;
      poll.option3Hi = option3Hi !== undefined ? option3Hi : poll.option3Hi;

      if (shouldReset) {
        poll.votesOption1 = 0;
        poll.votesOption2 = 0;
        poll.votesOption3 = 0;
      }
    }

    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPoll,
  votePoll,
  updatePoll,
};
