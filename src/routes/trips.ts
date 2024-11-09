// src/routes/trips.ts
import { Router } from "express";
import { Trip } from "../Models/Trip";
import { Revenue } from "../Models/Revenue";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("truckId")
      .populate("driverId")
      .sort({ startDate: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

router.get("/active", async (req, res) => {
  try {
    const activeTrips = await Trip.find({ status: "IN_PROGRESS" })
      .populate("truckId")
      .populate("driverId");
    res.json(activeTrips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active trips" });
  }
});

router.get("/truck/:truckId", async (req, res) => {
  try {
    const trips = await Trip.find({ truckId: req.params.truckId })
      .populate("driverId")
      .sort({ startDate: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

router.get("/driver/:driverId", async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.params.driverId })
      .populate("truckId")
      .sort({ startDate: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("truckId")
      .populate("driverId");
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

router.post("/", async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to create trip" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("truckId")
      .populate("driverId");

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to update trip" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Also delete associated revenue records
    await Revenue.deleteMany({ tripId: req.params.id });

    res.json({ message: "Trip and associated records deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

export const tripRoutes = router;
