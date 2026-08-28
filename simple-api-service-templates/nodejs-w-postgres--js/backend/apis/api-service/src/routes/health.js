import { asyncHandler } from "../middleware/asyncHandler.js";
import express from "express";

const router= express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) =>  {
    res.log.info("health check");
    res.json({ status: "ok" });
  }),
);

export default router;