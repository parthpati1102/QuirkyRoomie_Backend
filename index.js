
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend URL
  credentials: true, // Allow cookies/auth headers
}));


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



