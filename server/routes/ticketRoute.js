import express from "express";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
const router = express.Router();
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  addComment,
} from "../controllers/ticketController.js";

router.post(
  "/tickets",
  authorizeRoles("employee", "agent", "admin"),
  createTicket,
);
router.get("/tickets", authorizeRoles("agent", "admin"), getAllTickets);
router.get("/:id", protect, getTicketById);
router.put("/:id", authorizeRoles("agent", "admin"), updateTicket);
router.delete("/:id", authorizeRoles("admin"), deleteTicket);
router.post("/:id/comments", addComment);

export default router;
