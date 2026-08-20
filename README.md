# Mediamatch waitlist

Landing page for the **Mediamatch by Pressto** waitlist. Hosted on Cloudflare Pages. Submissions go to a Google Form (then into the linked Google Sheet).

Flow: splash → form (name, company, email, journalist or source) → thank-you.

The waitlist number on the thank-you screen is **social proof only**. It is not a real signup count. It stays in the 700–1500 range and trends up over time.

## Local

```bash
npm install
cp .env.example .env
# fill in Google Form vars (see below)
npm run dev
```

Open http://localhost:5173/

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Or: `npm run deploy`

Set the same `VITE_*` variables in the Cloudflare Pages project. Vite inlines them at **build** time, so change env → rebuild.

## Google Form backend

Signups POST to a public Google Form. There is no server.

### 1. Create the form

Fields must match exactly:

| Question | Type | Notes |
| --- | --- | --- |
| Name | Short answer | required |
| Company | Short answer | required |
| Email | Short answer | required |
| Are you a journalist or source? | Multiple choice | options must be `Journalist` and `Source` |

Turn on **Collect email addresses** only if you still keep the Email question as its own field — the page submits `Email`, not the Google account collector.

Link a Google Sheet (Responses → Link to Sheets).

### 2. Publish and copy the viewform URL

`https://docs.google.com/forms/d/e/FORM_ID/viewform`

Anyone with the link must be able to respond.

### 3. Extract entry IDs

```bash
node scripts/extract-google-form.mjs "https://docs.google.com/forms/d/e/FORM_ID/viewform"
```

Put the printed values in `.env` (local) and Cloudflare Pages env (production):

```
VITE_GOOGLE_FORM_ID=
VITE_ENTRY_NAME=entry.xxxxxxxxxx
VITE_ENTRY_COMPANY=entry.xxxxxxxxxx
VITE_ENTRY_EMAIL=entry.xxxxxxxxxx
VITE_ENTRY_ROLE=entry.xxxxxxxxxx
```

Wiring lives in `src/googleForm.js`. The form posts to `/formResponse` with `mode: "no-cors"`. If env vars are missing, local submit still shows the thank-you screen; production submit fails.

### 4. Confirm it works

Submit once from the site, then check the Form responses tab / Sheet.
