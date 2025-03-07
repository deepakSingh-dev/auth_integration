// src/models/iam/User.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: function () { return !this.provider; } }, 
  provider: { type: String, default: "credentials" },
    role: {
      type: String,
      enum: ['admin', 'accountant_admin', 'accountant'],
      default: 'accountant',
    },
 
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Ensure a user is associated with only one business
userSchema.index({ business: 1, email: 1 }, { unique: true, partialFilterExpression: { business: { $exists: true } } });

// Text index for search functionality
userSchema.index({ name: "text", email: "text" });
userSchema.index({ business: 1 });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.plugin(mongoosePaginate);

export default mongoose.model("User", userSchema);
