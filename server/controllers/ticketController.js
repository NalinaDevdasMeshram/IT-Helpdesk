import Ticketmodel from "../models/Ticket.js";
export const createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority, status, requester } =
      req.body;
    // validate required feild
    if (
      !subject ||
      !description ||
      !category ||
      !priority ||
      !status ||
      !requester
    ) {
      return res.status(400).json({
        success: false,
        message:
          "subject, description, category, priority, requester are required feild",
      });
    }
    // created ticket in mongodb
    const ticket = await Ticketmodel.create({
      subject,
      description,
      category,
      priority,
      status,
      requester,
    });
    return res.status(200).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to created ticket",
      error: error.message,
    });
  }
};
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticketmodel.find()
      .populate("requester", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    console.log("ticket", tickets);
    return res
      .status(200)
      .json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets." });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    // find ticket by ID
    const ticket = await Ticketmodel.findById(id)
      .populate("requester", "name email")
      .populate("assignedTo", "name email");

    //check if ticket exist
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    const userId = req.user._id.toString();
    const isRequester = ticket.requester?._id.toString();
    const isAssignedTo = ticket.assignedTo?._id.toString();
    // employee can access there own tickets
    if (
      !isRequester === userId &&
      !isAssignedTo === userId &&
      !req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this ticket",
      });
    }
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.log("error", error.message);
    // Handle invalid MongoDB IDs
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets." });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticketmodel.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const userId = req.user._id.toString();
    const requesterId = ticket.requester.toString();
    const assignedToId = ticket.assignedTo?.toString();

    // Check permissions
    if (
      req.user.role !== "admin" &&
      req.user.role !== "agent" &&
      requesterId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this ticket",
      });
    }

    // Only support agents and admins can change assignment and status
    const { subject, description, category, priority, status, assignedTo } =
      req.body;

    if (req.user.role === "employee") {
      if (assignedTo !== undefined || status !== undefined) {
        return res.status(403).json({
          success: false,
          message: "Employees cannot change assignment or ticket status",
        });
      }
    }

    if (req.user.role === "agent" && assignedToId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update tickets assigned to you",
      });
    }

    // Update allowed fields
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (category !== undefined) ticket.category = category;
    if (priority !== undefined) ticket.priority = priority;

    if (["admin", "agent"].includes(req.user.role)) {
      if (status !== undefined) ticket.status = status;
      if (assignedTo !== undefined && req.user.role === "admin") {
        ticket.assignedTo = assignedTo;
      }
    }

    const updatedTicket = await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Update ticket error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID or field value",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket",
    });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    // find ticket by ID and delete it
    const ticket = await Ticketmodel.findByIdAndDelete(id);
    // check if ticket exist
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }
    console.error("Delete ticket error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete ticket",
    });
  }
};
export const addComment = async (req, res) => {
  try {
    const { id } = req.body;
    const { text, internal = false } = req.body;
    // validate comment text
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }
    // find ticket by ID
    const ticket = await Ticketmodel.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }
    const userId = req.user._id.toString();
    const requesterId = ticket.requester?._id.toString();
    const assignedToId = ticket.assignedTo?._id.toString();
    //check ticket access permission
    const isadmin = req.user.role === "admin";
    const isagent = req.user.role === "agent";
    const isrequester = requesterId === userId;
    const isassignedTo = assignedToId === userId;

    if (!isadmin && !isagent && !isrequester && isassignedTo) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to comment on this ticket",
      });
    }
    // only support agents and admins can add internal comments
    if (internal && !isadmin && !isagent) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to add internal comments",
      });
    }
    // add comment to ticket
    ticket.comments.push({
      author: req.user._id,
      text: text.trim(),
      internal,
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: ticket.comments[ticket.comments.length - 1],
    });
  } catch (error) {
    console.error("Add comment error:", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};
