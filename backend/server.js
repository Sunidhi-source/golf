require("dotenv").config();
const express = require("express");
const cors = require("cors");
const webhookController = require("./controllers/webhookController");
const scoreRoutes = require("./routes/scoreRoutes");
const charityRoutes = require("./routes/charityRoutes");
const drawRoutes = require("./routes/drawRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(cors());
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  webhookController.handleStripeWebhook,
);
app.use(express.json());

// Link your routes
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
