import mongoose from "mongoose";
const TicketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Software", "Hardware", "network", "Access", "other"],
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["PENDING", "IN-PROGRESS", "CLOSED", "RESOLVED"],
      default: "pending",
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        internal: Boolean,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    slaDue: Date,
  },
  {
    timestamps: true,
  },
);

const Ticketmodel = mongoose.model("Ticket", TicketSchema);
export default Ticketmodel;
