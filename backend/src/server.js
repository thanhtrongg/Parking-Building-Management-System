import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import parkingSlotRoutes from "./routes/parkingSlot.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import vehicleTypeRoutes from "./routes/vehicleType.routes.js";
import zoneRoutes from "./routes/zone.routes.js";
import pricingPolicyRoutes from "./routes/pricingPolicy.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Parking Building Management System API",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW() AS current_time`;

    res.json({
      success: true,
      message: "Database connected successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/parking-slots", parkingSlotRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/pricing-policies", pricingPolicyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
