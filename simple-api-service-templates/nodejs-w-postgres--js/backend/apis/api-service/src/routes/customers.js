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
    res.log.info("listing customers");
    res.json(await listCustomers());
  }),
);

router.get(
  "/:id/orders",
  asyncHandler(async (req, res) => {
    res.log.info({customerId: req.params.id},"listing orders by customer id");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({customerId: req.params.id}, "invalid customer id");
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await findCustomerById(id);
    if (!customer) {
      res.log.warn({customerId: req.params.id}, "customer not found");
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.log.info({customerId: req.params.id}, "listing orders by customer id");
    res.json(await listOrdersByCustomerId(id));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({customerId: req.params.id}, "listing customer by id");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({customerId: req.params.id}, "invalid customer id");
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await findCustomerById(id);
    if (!customer) {
      res.log.warn({customerId: req.params.id}, "customer not found");
      res.status(404).json({ error: "Customer not found" });
      return;
    } else {
      res.log.info({customerId: req.params.id}, "customer found");
    }

    res.log.info({customerId: req.params.id}, "listing customer by id");
    res.json(customer);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    res.log.info("creating customer");
    const { email, password } = req.body;
    if (!email || !password) {
      res.log.warn("email and password are required");
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const customer = await createCustomer({ email, password });
    res.log.info("customer created");
    res.status(201).json(customer);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({customerId: req.params.id}, "updating customer");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({customerId: req.params.id}, "invalid customer id");
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.log.warn({customerId: req.params.id}, "email and password are required");
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const customer = await updateCustomer(id, { email, password });
    if (!customer) {
      res.log.warn({customerId: req.params.id}, "customer not found");
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.log.info({customerId: req.params.id}, "customer updated");
    res.json(customer);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({customerId: req.params.id}, "patching customer");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({customerId: req.params.id}, "invalid customer id");
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await patchCustomer(id, req.body);
    if (!customer) {
      res.log.warn({customerId: req.params.id}, "customer not found");
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.log.info({customerId: req.params.id}, "customer patched");
    res.json(customer);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.log.info({customerId: req.params.id}, "deleting customer");
    const id = parseId(req.params.id);
    if (id === null) {
      res.log.warn({customerId: req.params.id}, "invalid customer id");
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const customer = await deleteCustomer(id);
    if (!customer) {
      res.log.warn({customerId: req.params.id}, "customer not found");
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.log.info({customerId: req.params.id}, "customer deleted");
    res.json(customer);
  }),
);

export default router;
