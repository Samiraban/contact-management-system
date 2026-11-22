import { checkPhone } from "./phone.js";

export function validateContact(input) {
  const errors = {};
  const fields = ["contactName", "companyName", "mobileNumber", "emailAddress", "fullAddress", "websiteUrl"];

  for (const field of fields) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      errors[field] = "This field is required.";
    }
  }

  if (input.contactName && input.contactName.trim().length > 100) errors.contactName = "Maximum 100 characters.";
  if (input.companyName && input.companyName.trim().length > 120) errors.companyName = "Maximum 120 characters.";

  if (input.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.emailAddress.trim())) {
    errors.emailAddress = "Enter a valid email address.";
  }

  if (typeof input.mobileNumber === "string" && input.mobileNumber.trim()) {
    const phone = checkPhone(input.mobileNumber);
    if (!phone.ok) errors.mobileNumber = phone.message;
  }

  if (input.websiteUrl) {
    try {
      const url = new URL(input.websiteUrl.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.websiteUrl = "Enter a valid website URL starting with https:// or http://.";
    }
  }

  if (input.fullAddress && input.fullAddress.trim().length > 500) errors.fullAddress = "Maximum 500 characters.";
  if (input.isFavourite !== undefined && typeof input.isFavourite !== "boolean") errors.isFavourite = "Favourite must be true or false.";

  return errors;
}

export function normalizeContact(input) {
  return {
    contactName: input.contactName.trim(),
    companyName: input.companyName.trim(),
    mobileNumber: checkPhone(input.mobileNumber).e164,
    emailAddress: input.emailAddress.trim().toLowerCase(),
    fullAddress: input.fullAddress.trim(),
    websiteUrl: input.websiteUrl.trim(),
    isFavourite: Boolean(input.isFavourite)
  };
}