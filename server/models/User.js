import mongoose from "mongoose";
import bcrypt from "bcrypt";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: "string",
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["employee", "agent", "admin"],
      default: "employee",
    },
  },
  {
    timestamps: true,
  },
);

// hash the password before save
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

//compare entered password with hashed password

UserSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
