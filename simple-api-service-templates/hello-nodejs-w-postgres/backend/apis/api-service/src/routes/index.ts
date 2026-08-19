import express, { Router } from "express";
import helloRouter from "./hello";
import usersRouter from "./users";
import customersRouter from "./customers";
import ordersRouter from "./orders";
import orderItemsRouter from "./orderItems";

const router: Router = express.Router();

router.use("/hello", helloRouter);
router.use("/users", usersRouter);
router.use("/customers", customersRouter);
router.use("/orders", ordersRouter);
router.use("/order-items", orderItemsRouter);

export default router;
