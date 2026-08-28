import express from "express";
import { asyncHandler, parseId } from "../middleware/asyncHandler.js";
import {
  listOrders,
  findOrderById,
  createOrder,
  updateOrder,
  patchOrder,
  deleteOrder,
  listPendingOrderTotals,
} from "../entities/orders.js";
import { listOrderItemsByOrderId } from "../entities/orderItems.js";

const router = express.Router();
const ORDER_STATUSES = ["pending", "shipped", "delivered"];

const isOrderStatus = (value) =>
  typeof value === "string" &&
  ORDER_STATUSES.includes(value);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listOrders());
  }),
);

router.get(
  "/pending-totals",
  asyncHandler(async (_req, res) => {
    res.json(await listPendingOrderTotals());
  }),
);

router.get(
  "/:id/items",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = await findOrderById(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(await listOrderItemsByOrderId(id));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = await findOrderById(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { customer_id, status } = req.body;
    if (!customer_id) {
      res.status(400).json({ error: "customer_id is required" });
      return;
    }
    if (status !== undefined && !isOrderStatus(status)) {
      res.status(400).json({ error: "status must be pending, shipped, or delivered" });
      return;
    }

    const order = await createOrder({ customer_id, status });
    res.status(201).json(order);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const { customer_id, status } = req.body;
    if (!customer_id) {
      res.status(400).json({ error: "customer_id is required" });
      return;
    }
    if (status !== undefined && !isOrderStatus(status)) {
      res.status(400).json({ error: "status must be pending, shipped, or delivered" });
      return;
    }

    const order = await updateOrder(id, { customer_id, status });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const { status } = req.body;
    if (status !== undefined && !isOrderStatus(status)) {
      res.status(400).json({ error: "status must be pending, shipped, or delivered" });
      return;
    }

    const order = await patchOrder(id, req.body);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = await deleteOrder(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  }),
);

export default router;
