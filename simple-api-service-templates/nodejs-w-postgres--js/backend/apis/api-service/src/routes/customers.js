import express from "express";
import { asyncHandler, parseId } from "../middleware/asyncHandler.js";
import {
  listCustomers,
  findCustomerById,
  createCustomer,
  updateCustomer,
  patchCustomer,
  deleteCustomer,
} from "../entities/customers.js";
import { listOrdersByCustomerId } from "../entities/orders.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listCustomers());
  }),
);

router.get(
  "/:id/orders",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await findCustomerById(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(await listOrdersByCustomerId(id));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await findCustomerById(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const customer = await createCustomer({ email, password });
    res.status(201).json(customer);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const customer = await updateCustomer(id, { email, password });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await patchCustomer(id, req.body);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await deleteCustomer(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  }),
);

export default router;
