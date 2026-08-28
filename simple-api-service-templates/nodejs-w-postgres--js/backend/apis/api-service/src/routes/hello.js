import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.log.info("hello world");
  res.json({
    method: req.method,
    message: "Hello, world!",
  });
});

router.post("/", (req, res) => {
  res.log.info("hello world");
  const { name } = req.body;
  res.json({
    method: req.method,
    message: `Hello, ${name}!`,
  });
});

router.put("/:id", (req, res) => {
  res.log.info("hello world");
  const id = req.params.id;
  const { name } = req.body;
  res.json({
    method: req.method,
    message: `Hello, ${name}!`,
    id: id,
  });
});

router.patch("/:id", (req, res) => {
  res.log.info("hello world");
  const id = req.params.id;
  const { name } = req.body;
  res.json({
    method: req.method,
    message: `Hello, ${name}!`,
    id: id,
  });
});

router.delete("/:id", (req, res) => {
  res.log.info("hello world");
  const id = req.params.id;
  res.json({
    method: req.method,
    id: id,
  });
});

export default router;
