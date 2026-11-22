// Country-aware phone number checks.
// - No "+" at the start  -> treated as a NEPAL number (exactly 10 digits, starts with 96/97/98)
// - Starts with "+" or "00" -> international, checked against the country's digit rules
// - Countries not in the list below are accepted if they are 8-15 digits in total (E.164)

export const COUNTRIES = [
  { code: "977", name: "Nepal",          lengths: [10], pattern: /^9[6-8]\d{8}$/ },
  { code: "91",  name: "India",          lengths: [10], pattern: /^[6-9]\d{9}$/ },
  { code: "1",   name: "USA / Canada",   lengths: [10], pattern: /^[2-9]\d{2}[2-9]\d{6}$/ },
  { code: "44",  name: "United Kingdom", lengths: [9, 10] },
  { code: "61",  name: "Australia",      lengths: [9] },
  { code: "971", name: "UAE",            lengths: [9] },
  { code: "974", name: "Qatar",          lengths: [8] },
  { code: "966", name: "Saudi Arabia",   lengths: [9] },
  { code: "965", name: "Kuwait",         lengths: [8] },
  { code: "968", name: "Oman",           lengths: [8] },
  { code: "973", name: "Bahrain",        lengths: [8] },
  { code: "972", name: "Israel",         lengths: [9] },
  { code: "60",  name: "Malaysia",       lengths: [9, 10] },
  { code: "65",  name: "Singapore",      lengths: [8] },
  { code: "880", name: "Bangladesh",     lengths: [10] },
  { code: "92",  name: "Pakistan",       lengths: [10] },
  { code: "94",  name: "Sri Lanka",      lengths: [9] },
  { code: "975", name: "Bhutan",         lengths: [8] },
  { code: "86",  name: "China",          lengths: [11] },
  { code: "852", name: "Hong Kong",      lengths: [8] },
  { code: "81",  name: "Japan",          lengths: [10] },
  { code: "82",  name: "South Korea",    lengths: [9, 10] },
  { code: "66",  name: "Thailand",       lengths: [9] },
  { code: "63",  name: "Philippines",    lengths: [10] },
  { code: "62",  name: "Indonesia",      lengths: [9, 10, 11, 12] },
  { code: "49",  name: "Germany",        lengths: [10, 11] },
  { code: "33",  name: "France",         lengths: [9] },
  { code: "90",  name: "Turkey",         lengths: [10] },
  { code: "7",   name: "Russia",         lengths: [10] },
  { code: "27",  name: "South Africa",   lengths: [9] },
  { code: "55",  name: "Brazil",         lengths: [10, 11] }
];

const BY_CODE = new Map(COUNTRIES.map(c => [c.code, c]));

export function cleanPhone(raw) {
  return String(raw ?? "").trim().replace(/[\s().-]/g, "");
}

const fail = (message) => ({ ok: false, message });
const lengthText = (lengths) =>
  lengths.length === 1 ? `exactly ${lengths[0]}` : `${lengths[0]} to ${lengths[lengths.length - 1]}`;

/** Returns { ok, message?, e164? } */
export function checkPhone(raw) {
  let value = cleanPhone(raw);
  if (!value) return fail("Mobile number is required.");
  if (value.startsWith("00")) value = "+" + value.slice(2);
  if (!/^\+?\d+$/.test(value)) {
    return fail("Use digits only. For another country, start with + and the country code.");
  }

  // ---- No country code: Nepal ----
  if (!value.startsWith("+")) {
    if (value.length !== 10) {
      return fail("Nepal numbers must be exactly 10 digits (e.g. 98XXXXXXXX). For another country, start with + and the country code.");
    }
    if (!/^9[6-8]/.test(value)) return fail("Nepal mobile numbers start with 96, 97 or 98.");
    return { ok: true, e164: "+977" + value };
  }

  // ---- International ----
  const digits = value.slice(1);
  let country = null;
  for (const size of [3, 2, 1]) {
    const found = BY_CODE.get(digits.slice(0, size));
    if (found) { country = found; break; }
  }

  if (!country) {
    if (digits.length < 8 || digits.length > 15) {
      return fail("Enter a valid international number (8 to 15 digits including the country code).");
    }
    return { ok: true, e164: "+" + digits };
  }

  const national = digits.slice(country.code.length);
  if (!country.lengths.includes(national.length)) {
    return fail(`${country.name} (+${country.code}) numbers must have ${lengthText(country.lengths)} digits after the country code.`);
  }
  if (country.pattern && !country.pattern.test(national)) {
    return fail(`That is not a valid ${country.name} (+${country.code}) mobile number.`);
  }
  return { ok: true, e164: "+" + digits };
}