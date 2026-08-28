import express from "express";
import { asyncHandler, parseId } from "../middleware/asyncHandler.js";
import {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  countOrderItemsByProductId,
} from "../entities/products.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listProducts());
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const product = await findProductById(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { sku, name, unit_price_cents } = req.body;
    if (!sku || !name || unit_price_cents === undefined) {
      res.status(400).json({
        error: "sku, name, and unit_price_cents are required",
      });
      return;
    }

    const product = await createProduct({ sku, name, unit_price_cents });
    res.status(201).json(product);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const { sku, name, unit_price_cents } = req.body;
    if (!sku || !name || unit_price_cents === undefined) {
      res.status(400).json({
        error: "sku, name, and unit_price_cents are required",
      });
      return;
    }

    const product = await updateProduct(id, { sku, name, unit_price_cents });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const product = await patchProduct(id, req.body);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid product id" });
      return;
    }

    const product = await findProductById(id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const referenced = await countOrderItemsByProductId(id);
    if (referenced > 0) {
      res.status(409).json({
        error: "Product is referenced by existing order items",
      });
      return;
    }

    const deleted = await deleteProduct(id);
    res.json(deleted);
  }),
);

export default router;
