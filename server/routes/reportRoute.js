import express from "express";
const router = express.Router();
import { commentTicket, getReport } from "../controllers/reportController.js";

router.post("/ticked/:id/comments", commentTicket);
router.get("/summary", getReport);

export default router;
