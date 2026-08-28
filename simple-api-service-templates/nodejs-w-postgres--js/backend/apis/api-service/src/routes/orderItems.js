import express from "express";
import { asyncHandler, parseId } from "../middleware/asyncHandler.js";
import {
  listOrderItems,
  findOrderItemById,
  createOrderItem,
  updateOrderItem,
  patchOrderItem,
  deleteOrderItem,
} from "../entities/orderItems.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.log.info("listing order items");
    res.json(await listOrderItems());
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderItemId: req.params.id}, "listing order item by id");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderItemId: req.params.id}, "invalid order item id");
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const item = await findOrderItemById(id);
    if (!item) {
      res.log.warn({orderItemId: req.params.id}, "order item not found");
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.log.info({orderItemId: req.params.id}, "order item found");
    res.json(item);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    res.log.info("creating order item");
    const { order_id, product_id, quantity, unit_price_cents } = req.body;
    if (!order_id || !product_id || quantity === undefined || unit_price_cents === undefined) {
      res.log.warn("order_id, product_id, quantity, and unit_price_cents are required");
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
    res.log.info("order item created");
    res.status(201).json(item);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderItemId: req.params.id}, "updating order item");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderItemId: req.params.id}, "invalid order item id");
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const { order_id, product_id, quantity, unit_price_cents } = req.body;
    if (!order_id || !product_id || quantity === undefined || unit_price_cents === undefined) {
      res.log.warn({orderItemId: req.params.id}, "order_id, product_id, quantity, and unit_price_cents are required");
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
      res.log.warn({orderItemId: req.params.id}, "order item not found");
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.log.info({orderItemId: req.params.id}, "order item updated");
    res.json(item);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderItemId: req.params.id}, "patching order item");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderItemId: req.params.id}, "invalid order item id");
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const item = await patchOrderItem(id, req.body);
    if (!item) {
      res.log.warn({orderItemId: req.params.id}, "order item not found");
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.log.info({orderItemId: req.params.id}, "order item patched");
    res.json(item);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderItemId: req.params.id}, "deleting order item");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderItemId: req.params.id}, "invalid order item id");
      res.status(400).json({ error: "Invalid order item id" });
      return;
    }

    const item = await deleteOrderItem(id);
    if (!item) {
      res.log.warn({orderItemId: req.params.id}, "order item not found");
      res.status(404).json({ error: "Order item not found" });
      return;
    }

    res.log.info({orderItemId: req.params.id}, "order item deleted");
    res.json(item);
  }),
);

export default router;
