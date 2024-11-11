// src/routes/trucks.ts
import { Router } from "express";
import { Truck } from "../Models/Trucks";
import { UserInterface } from "../interfaces";

const router = Router();

router.get("/", async (req, res) => {
    console.log("getting these mother fucking trucks")
    const currentUser = req.user as UserInterface
    console.log("current user", currentUser)
  try {
    const trucks = await Truck.find({userId:currentUser._id}).sort({ createdAt: -1 });
    res.status(200).json(trucks)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trucks" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate(
      "maintenanceRecords"
    );
    if (!truck) {
      return res.status(404).json({ error: "Truck not found" });
    }
    res.json(truck);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch truck" });
  }
});

router.post("/", async (req, res) => {
     console.log("hit trucks")
    try {
    const truck = new Truck(req.body);
    await truck.save();
    res.status(201).json(truck);
  } catch (error) {
    res.status(500).json({ error: "Failed to create truck" });
  }
});

router.put("/:id", async (req, res) => {

    console.log(`updating truck with id ${req.params.id}`)
  try {
    const truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!truck) {
      return res.status(404).json({ error: "Truck not found" });
    }
    res.json(truck);
  } catch (error) {
    res.status(500).json({ error: "Failed to update truck" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);
    if (!truck) {
      return res.status(404).json({ error: "Truck not found" });
    }
    res.json({ message: "Truck deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete truck" });
  }
});

export const truckRoutes = router;
