import express, { Router, Request, Response } from "express";
import { asyncHandler, parseId } from "../middleware/asyncHandler";
import {
  listOrderItems,
  findOrderItemById,
  createOrderItem,
  updateOrderItem,
  patchOrderItem,
  deleteOrderItem,
} from "../entities/orderItems";

const router: Router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await listOrderItems());
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const item = await findOrderItemById(id);
    if (!item) {
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.json(item);
  }),
);

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { order_id, product_id, quantity, unit_price_cents } = req.body;
    if (!order_id || !product_id || quantity === undefined || unit_price_cents === undefined) {
      res.status(400).json({
        error: "order_id, product_id, quantity, and unit_price_cents are required",
      });
      return;
    }

    const item = await createOrderItem({
      order_id,
      product_id,
      quantity,
      unit_price_cents,
    });
    res.status(201).json(item);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const { order_id, product_id, quantity, unit_price_cents } = req.body;
    if (!order_id || !product_id || quantity === undefined || unit_price_cents === undefined) {
      res.status(400).json({
        error: "order_id, product_id, quantity, and unit_price_cents are required",
      });
      return;
    }

    const item = await updateOrderItem(id, {
      order_id,
      product_id,
      quantity,
      unit_price_cents,
    });
    if (!item) {
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.json(item);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const item = await patchOrderItem(id, req.body);
    if (!item) {
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.json(item);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const item = await deleteOrderItem(id);
    if (!item) {
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.json(item);
  }),
);

export default router;
