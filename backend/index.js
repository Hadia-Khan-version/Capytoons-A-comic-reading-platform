const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes (we'll fill these in one by one)
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/comics",    require("./routes/comics"));
app.use("/api/chapters",  require("./routes/chapters"));
app.use("/api/bookmarks", require("./routes/bookmarks"));
app.use("/api/reviews",   require("./routes/reviews"));
app.use("/api/history",   require("./routes/history"));

// Test route
app.get("/", (req, res) => res.json({ message: "CapyToons API running!" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));