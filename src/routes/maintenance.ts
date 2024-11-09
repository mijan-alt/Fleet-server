import { Router } from "express";
import { MaintenanceRecord } from "../Models/MaintenanceRecord";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const records = await MaintenanceRecord.find()
      .populate("truckId")
      .sort({ serviceDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance records" });
  }
});

router.get("/truck/:truckId", async (req, res) => {
  try {
    const records = await MaintenanceRecord.find({
      truckId: req.params.truckId,
    })
      .populate("truckId")
      .sort({ serviceDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch maintenance records" });
  }
});

router.post("/", async (req, res) => {
  try {
    const record = new MaintenanceRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to create maintenance record" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to update maintenance record" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const record = await MaintenanceRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }
    res.json({ message: "Maintenance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete maintenance record" });
  }
});

export const maintenanceRoutes = router;
