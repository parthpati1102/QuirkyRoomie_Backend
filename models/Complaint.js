const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  type: { type: String, enum: ["Noise", "Cleanliness", "Bills", "Pets"] },
  severity: { type: String, enum: ["Mild", "Annoying", "Major", "Nuclear"] },
  votes: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
  punishment: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);