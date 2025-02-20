const express = require("express");
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");


const router = express.Router();

const punishments = [
  "Didn’t clean the dishes? You’re making chai for a week! ☕",
  "Blasted loud music? You owe everyone samosas! 🍛",
  "Forgot to take out the trash? You’re on garbage duty for 3 days! 🚮",
  "Left dirty laundry? You have to do everyone's laundry this weekend! 👕",
  "Used up all the WiFi? You must buy a new router! 📶"
];


// Create a complaint (Authenticated Users Only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const complaint = new Complaint({ ...req.body, user: req.user.id, createdAt: new Date() });
    await complaint.save();
    res.status(201).json({ message: "Complaint filed successfully!", complaint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all active complaints
router.get("/", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: "Active" }).populate("user", "name");
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote/Downvote a complaint with user-based voting
router.post("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const { vote } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Apply vote
    complaint.votes += vote === "up" ? 1 : -1;

    // If a complaint gets 10+ upvotes, assign a punishment
    if (complaint.votes >= 10 && !complaint.punishment) {
      const randomPunishment = punishments[Math.floor(Math.random() * punishments.length)];
      complaint.punishment = randomPunishment;
    }

    await complaint.save();
    res.json({ message: "Vote registered", complaint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.put("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status === "Resolved") {
      return res.status(400).json({ message: "Complaint is already resolved!" });
    }

    complaint.status = "Resolved";
    complaint.resolvedBy = req.user.id;
    await complaint.save();

    // Award karma points for resolving a complaint
    const resolver = await User.findById(req.user.id);
    if (!resolver) return res.status(404).json({ message: "User not found" });

    resolver.karmaPoints += 10;
    await resolver.save();

    res.json({ message: "Complaint resolved! You earned 10 karma points.", complaint, resolver });
  } catch (err) {
    console.error("❌ Error resolving complaint:", err);
    res.status(500).json({ error: err.message });
  }
});




// 🏆 Get Best Flatmate (User with Highest Karma Points)
router.get("/best-flatmate", authMiddleware, async (req, res) => {
  try {
    const bestFlatmate = await User.findOne().sort({ karmaPoints: -1 }).select("name karmaPoints");
    if (!bestFlatmate) return res.json({ message: "No flatmate has karma points yet." });

    res.json(bestFlatmate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/trending", authMiddleware, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topComplaint = await Complaint.findOne({
      createdAt: { $gte: oneWeekAgo }, // Complaints from last 7 days
      status: "Active",
    })
      .sort({ votes: -1 }) // Sort by highest votes
      .populate("user", "name"); // Get user details

    if (!topComplaint) {
      return res.json({ message: "No trending complaint this week." });
    }

    res.json(topComplaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📅 Auto-archive Downvoted Complaints After 3 Days (Run Daily)
const archiveDownvotedComplaints = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const archived = await Complaint.updateMany(
      { votes: { $lt: -5 }, createdAt: { $lte: threeDaysAgo } },
      { status: "Archived" }
    );

    console.log(`✅ Archived ${archived.nModified} complaints.`);
  } catch (error) {
    console.error("❌ Error archiving complaints:", error);
  }
};

// 🏆 Get Leaderboard – Most Complaints Filed Against a User
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const leaderboard = await Complaint.aggregate([
      { $group: { _id: "$user", complaintsCount: { $sum: 1 } } }, // Count complaints per user
      { $sort: { complaintsCount: -1 } }, // Sort by highest complaints
      { $limit: 5 } // Get top 5 flatmates with the most complaints
    ]);

    const users = await User.find({ _id: { $in: leaderboard.map((entry) => entry._id) } }, "name");

    const formattedLeaderboard = leaderboard.map((entry) => {
      const user = users.find((u) => u._id.toString() === entry._id.toString());
      return { name: user ? user.name : "Unknown", complaintsCount: entry.complaintsCount };
    });

    res.json(formattedLeaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Get Complaint Statistics – Most Common Complaint Types
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }, // Count complaints by type
      { $sort: { count: -1 } } // Sort by highest count
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule Auto-Archiving to Run at Midnight Daily (Better than setInterval)
const cron = require("node-cron");
cron.schedule("0 0 * * *", archiveDownvotedComplaints); // Runs at midnight every day

module.exports = router;

