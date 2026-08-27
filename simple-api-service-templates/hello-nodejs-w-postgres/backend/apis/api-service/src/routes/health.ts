import { asyncHandler } from "@/middleware/asyncHandler";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.json({ status: "ok" });
    return;
  }),
);

export default router;
