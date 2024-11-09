// src/routes/revenue.ts
import { Router } from "express";
import { Revenue } from "../Models/Revenue";
import { Trip } from "../Models/Trip";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const revenues = await Revenue.find().populate("tripId").sort({ date: -1 });
    res.json(revenues);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue records" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery: any = {};
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const summary = await Revenue.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue summary" });
  }
});

router.get("/trip/:tripId", async (req, res) => {
  try {
    const revenues = await Revenue.find({ tripId: req.params.tripId }).sort({
      date: -1,
    });
    res.json(revenues);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue records" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id).populate("tripId");
    if (!revenue) {
      return res.status(404).json({ error: "Revenue record not found" });
    }
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revenue record" });
  }
});

router.post("/", async (req, res) => {
  try {
    const revenue = new Revenue(req.body);
    await revenue.save();

    // Update trip revenue if it exists
    if (revenue.tripId) {
      await Trip.findByIdAndUpdate(revenue.tripId, {
        $inc: { revenue: revenue.amount },
      });
    }

    res.status(201).json(revenue);
  } catch (error) {
    res.status(500).json({ error: "Failed to create revenue record" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const oldRevenue = await Revenue.findById(req.params.id);
    const revenue = await Revenue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!revenue) {
      return res.status(404).json({ error: "Revenue record not found" });
    }

    // Update trip revenue if amount changed
    if (oldRevenue && oldRevenue.amount !== revenue.amount) {
      const difference = revenue.amount - oldRevenue.amount;
      await Trip.findByIdAndUpdate(revenue.tripId, {
        $inc: { revenue: difference },
      });
    }

    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: "Failed to update revenue record" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id);
    if (!revenue) {
      return res.status(404).json({ error: "Revenue record not found" });
    }

    // Decrease trip revenue before deleting
    if (revenue.tripId) {
      await Trip.findByIdAndUpdate(revenue.tripId, {
        $inc: { revenue: -revenue.amount },
      });
    }

    await revenue.deleteOne();
    res.json({ message: "Revenue record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete revenue record" });
  }
});

export const revenueRoutes = router;
