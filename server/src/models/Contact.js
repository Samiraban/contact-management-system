import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  contactName: { type: String, required: true, trim: true, maxlength: 100 },
  companyName: { type: String, required: true, trim: true, maxlength: 120 },
  mobileNumber: { type: String, required: true, trim: true },
  emailAddress: { type: String, required: true, trim: true, lowercase: true },
  fullAddress: { type: String, required: true, trim: true, maxlength: 500 },
  websiteUrl: { type: String, required: true, trim: true },
  isFavourite: { type: Boolean, default: false }
}, { timestamps: true });

contactSchema.index({ emailAddress: 1 }, { unique: true });
contactSchema.index({ mobileNumber: 1 }, { unique: true });
contactSchema.index({ contactName: "text", companyName: "text", emailAddress: "text", mobileNumber: "text" });

export default mongoose.model("Contact", contactSchema);
