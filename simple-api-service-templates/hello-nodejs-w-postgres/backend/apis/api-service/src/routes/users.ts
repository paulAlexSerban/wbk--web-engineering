import express, { Router, Request, Response } from "express";
import { asyncHandler, parseId } from "./asyncHandler";
import {
  listUsers,
  findUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
} from "../entities/users";

const router: Router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(await listUsers());
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const user = await findUserById(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  }),
);

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    const user = await createUser({ username, password });
    res.status(201).json(user);
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    const user = await updateUser(id, { username, password });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const user = await patchUser(id, req.body);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const user = await deleteUser(id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  }),
);

export default router;
