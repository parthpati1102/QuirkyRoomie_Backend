const express = require("express");
const User = require("../models/User");
const Complaint = require("../models/Complaint");

const router = express.Router();

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  const users = await User.find().sort({ karmaPoints: -1 }).limit(10);
  res.json(users);
});

// Get complaint stats
router.get("/flat/stats", async (req, res) => {
  const stats = await Complaint.aggregate([
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);
  res.json(stats);
});

module.exports = router;
