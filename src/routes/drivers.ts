// src/routes/drivers.ts
import { Router } from "express";
import { Driver } from "../Models/Drivers";
import { UserInterface } from "../interfaces";

const router = Router();

router.get("/", async (req, res) => {
    const user=req.user as UserInterface
  try {
    const drivers = await Driver.find({userId:user._id}).sort({ createdAt: -1 });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch driver" });
  }
});

router.post("/", async (req, res) => {

    console.log("hit add drivers")
    const user = req.user as UserInterface
    try {
    const driver = new Driver({
        ...req.body,
        userId:user._id
    });
    await driver.save();
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: "Failed to create driver" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: "Failed to update driver" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete driver" });
  }
});

export const driverRoutes = router;
