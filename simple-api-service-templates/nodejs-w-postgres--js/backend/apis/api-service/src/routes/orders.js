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
    res.log.info("listing orders");
    res.json(await listOrders());
  }),
);

router.get(
  "/pending-totals",
  asyncHandler(async (_req, res) => {
    res.log.info("listing pending order totals");
    res.json(await listPendingOrderTotals());
  }),
);

router.get(
  "/:id/items",
  asyncHandler(async (req, res) => {
    res.log.info({orderId: req.params.id}, "listing order items by order id");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderId: req.params.id}, "invalid order id");
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = await findOrderById(id);
    if (!order) {
      res.log.warn({orderId: req.params.id}, "order not found");
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.log.info({orderId: req.params.id}, "listing order items by order id");
    res.json(await listOrderItemsByOrderId(id));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderId: req.params.id}, "listing order by id");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderId: req.params.id}, "invalid order id");
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = await findOrderById(id);
    if (!order) {
      res.log.warn({orderId: req.params.id}, "order not found");
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.log.info({orderId: req.params.id}, "listing order by id");
    res.json(order);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    res.log.info("creating order");
    const { customer_id, status } = req.body;
    if (!customer_id) {
      res.log.warn("customer_id is required");
      res.status(400).json({ error: "customer_id is required" });
      return;
    }
    if (status !== undefined && !isOrderStatus(status)) {
      res.log.warn("status must be pending, shipped, or delivered");
      res.status(400).json({ error: "status must be pending, shipped, or delivered" });
      return;
    }

    const order = await createOrder({ customer_id, status });
    res.log.info("order created");
    res.status(201).json(order);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderId: req.params.id}, "updating order");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderId: req.params.id}, "invalid order id");
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const { customer_id, status } = req.body;
    if (!customer_id) {
      res.log.warn({orderId: req.params.id}, "customer_id is required");
      res.status(400).json({ error: "customer_id is required" });
      return;
    }
    if (status !== undefined && !isOrderStatus(status)) {
      res.log.warn({orderId: req.params.id}, "status must be pending, shipped, or delivered");
      res.status(400).json({ error: "status must be pending, shipped, or delivered" });
      return;
    }

    const order = await updateOrder(id, { customer_id, status });
    if (!order) {
      res.log.warn({orderId: req.params.id}, "order not found");
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.log.info({orderId: req.params.id}, "order updated");
    res.json(order);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderId: req.params.id}, "patching order");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderId: req.params.id}, "invalid order id");
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const { status } = req.body;
    if (status !== undefined && !isOrderStatus(status)) {
      res.log.warn({orderId: req.params.id}, "status must be pending, shipped, or delivered");
      res.status(400).json({ error: "status must be pending, shipped, or delivered" });
      return;
    }

    const order = await patchOrder(id, req.body);
    if (!order) {
      res.log.warn({orderId: req.params.id}, "order not found");
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.log.info({orderId: req.params.id}, "order patched");
    res.json(order);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({orderId: req.params.id}, "deleting order");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({orderId: req.params.id}, "invalid order id");
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = await deleteOrder(id);
    if (!order) {
      res.log.warn({orderId: req.params.id}, "order not found");
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.log.info({orderId: req.params.id}, "order deleted");
    res.json(order);
  }),
);

export default router;
