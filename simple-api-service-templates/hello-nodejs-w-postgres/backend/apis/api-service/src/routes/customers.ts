import express, { Router, Request, Response } from "express";
import { asyncHandler, parseId } from "./asyncHandler";
import {
  listCustomers,
  findCustomerById,
  createCustomer,
  updateCustomer,
  patchCustomer,
  deleteCustomer,
} from "../entities/customers";
import { listOrdersByCustomerId } from "../entities/orders";

const router: Router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await listCustomers());
  }),
);

router.get(
  "/:id/orders",
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const customer = await createCustomer({ email });
    res.status(201).json(customer);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid customer id" });
      return;
    }

    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    const customer = await updateCustomer(id, { email });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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
