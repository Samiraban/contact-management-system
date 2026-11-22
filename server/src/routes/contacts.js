import { Router } from "express";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";
import { normalizeContact, validateContact } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

function duplicateMessage(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return field === "mobileNumber" ? "A contact with this mobile number already exists." : "A contact with this email address already exists.";
  }
  return null;
}

router.get("/stats", async (_req, res, next) => {
  try {
    const [total, favourite] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ isFavourite: true })
    ]);
    res.json({ total, favourite, unfavourite: total - favourite });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
    const search = String(req.query.search || "").trim();
    const favouriteOnly = req.query.favourite === "true";
    const filter = {};
    if (favouriteOnly) filter.isFavourite = true;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["contactName", "companyName", "mobileNumber", "emailAddress", "fullAddress"].map(key => ({ [key]: { $regex: escaped, $options: "i" } }));
    }
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Contact.countDocuments(filter)
    ]);
    res.json({ contacts, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid contact ID." });
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found." });
    res.json({ contact });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const errors = validateContact(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: "Please correct the highlighted fields.", errors });
    const contact = await Contact.create(normalizeContact(req.body));
    res.status(201).json({ message: "Contact added successfully.", contact });
  } catch (error) {
    const duplicate = duplicateMessage(error);
    if (duplicate) return res.status(409).json({ message: duplicate });
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid contact ID." });
    const errors = validateContact(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: "Please correct the highlighted fields.", errors });
    const contact = await Contact.findByIdAndUpdate(req.params.id, normalizeContact(req.body), { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ message: "Contact not found." });
    res.json({ message: "Contact updated successfully.", contact });
  } catch (error) {
    const duplicate = duplicateMessage(error);
    if (duplicate) return res.status(409).json({ message: duplicate });
    next(error);
  }
});

router.patch("/:id/favourite", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid contact ID." });
    if (typeof req.body.isFavourite !== "boolean") return res.status(400).json({ message: "isFavourite must be true or false." });
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isFavourite: req.body.isFavourite }, { new: true });
    if (!contact) return res.status(404).json({ message: "Contact not found." });
    res.json({ message: contact.isFavourite ? "Added to favourites." : "Removed from favourites.", contact });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid contact ID." });
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: "Contact not found." });
    res.json({ message: "Contact deleted successfully." });
  } catch (error) { next(error); }
});

export default router;
