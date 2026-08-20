const FORM_ID = import.meta.env.VITE_GOOGLE_FORM_ID?.trim();

export const ENTRIES = {
  name: import.meta.env.VITE_ENTRY_NAME?.trim(),
  company: import.meta.env.VITE_ENTRY_COMPANY?.trim(),
  email: import.meta.env.VITE_ENTRY_EMAIL?.trim(),
  role: import.meta.env.VITE_ENTRY_ROLE?.trim(),
};

export function isGoogleFormConfigured() {
  return Boolean(
    FORM_ID && ENTRIES.name && ENTRIES.company && ENTRIES.email && ENTRIES.role
  );
}

export async function submitToGoogleForm({ name, company, email, role }) {
  if (!isGoogleFormConfigured()) {
    throw new Error("Google Form is not configured.");
  }

  const body = new URLSearchParams();
  body.set(ENTRIES.name, name);
  body.set(ENTRIES.company, company);
  body.set(ENTRIES.email, email);
  body.set(ENTRIES.role, role);

  await fetch(`https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}
