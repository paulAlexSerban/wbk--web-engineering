import express, { Router } from "express";
import helloRouter from "./hello.js";
import customersRouter from "./customers.js";
import productsRouter from "./products.js";
import ordersRouter from "./orders.js";
import orderItemsRouter from "./orderItems.js";

const router = express.Router();

router.use("/hello", helloRouter);
router.use("/customers", customersRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/order-items", orderItemsRouter);

export default router;
