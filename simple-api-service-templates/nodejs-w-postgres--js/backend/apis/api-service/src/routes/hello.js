import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    method: req.method,
    message: "Hello, world!",
  });
});

router.post("/", (req, res) => {
  const { name } = req.body;
  res.json({
    method: req.method,
    message: `Hello, ${name}!`,
  });
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  res.json({
    method: req.method,
    message: `Hello, ${name}!`,
    id: id,
  });
});

router.patch("/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  res.json({
    method: req.method,
    message: `Hello, ${name}!`,
    id: id,
  });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  res.json({
    method: req.method,
    id: id,
  });
});

export default router;
