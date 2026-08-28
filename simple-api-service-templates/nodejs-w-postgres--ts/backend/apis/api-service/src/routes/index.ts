import express, { Router } from "express";
import helloRouter from "./hello";
import customersRouter from "./customers";
import productsRouter from "./products";
import ordersRouter from "./orders";
import orderItemsRouter from "./orderItems";

const router: Router = express.Router();

router.use("/hello", helloRouter);
router.use("/customers", customersRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/order-items", orderItemsRouter);

export default router;
