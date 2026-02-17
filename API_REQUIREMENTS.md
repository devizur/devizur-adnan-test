# Backend API Requirements

This document lists **all APIs the frontend needs** so the application can run fully on your backend (no local JSON or mock data).

---

## Environment

- **Base URL:** Set `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://api.yourdomain.com`) so all requests go to your backend.
- **Auth:** Requests use `Authorization: Bearer <token>`. Backend should return `401` when token is invalid/expired so the frontend can try token refresh.

---

## 1. Catalog APIs (Activities, Foods, Packages)

| # | Method | Path | Purpose | Request | Response |
|---|--------|------|---------|---------|----------|
| 1 | GET | `/api/activities` | List all activities | — | `Activity[]` |
| 2 | GET | `/api/activities?search={term}` | Search activities | Query: `search` | `Activity[]` |
| 3 | GET | `/api/foods` | List all foods | — | `Food[]` |
| 4 | GET | `/api/foods?search={term}` | Search foods | Query: `search` | `Food[]` |
| 5 | GET | `/api/packages` | List all packages | — | `Package[]` |
| 6 | GET | `/api/packages?search={term}` | Search packages | Query: `search` | `Package[]` |

**Optional (for performance):** Single-item endpoints so the app does not need to load full lists when showing one item:

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 7 | GET | `/api/activities/:id` | Get one activity |
| 8 | GET | `/api/foods/:id` | Get one food |
| 9 | GET | `/api/packages/:id` | Get one package |

**Catalog item shape (Activity / Food / Package):**

- `id: number`
- `title: string`
- `price: string` (e.g. `"29.99"`)
- `unit: string` (e.g. `"per person"`)
- `rating: number`
- `image: string` (URL)
- `duration: string`
- `category: string`
- `discount?: string`
- `timeSlots?: string[]`
- `games?: (1 | 2 | 3)[]` (for activities)

---

## 2. Auth APIs (OTP sign-in)

Sign-in is **email + OTP**: user enters email → backend sends OTP → user enters OTP → backend returns token.

| # | Method | Path | Purpose | Request | Response |
|---|--------|------|---------|---------|----------|
| 10 | POST | `/api/auth/request-otp` | Send OTP to email | `{ email: string }` | `{ success: boolean, message?: string }` |
| 11 | POST | `/api/auth/verify-otp` | Verify OTP and sign in | `{ email: string, otp: string }` | `{ user: { id, email, name }, token: string }` |

**Token refresh (used by frontend on 401):**

| # | Method | Path | Purpose | Request | Response |
|---|--------|------|---------|---------|----------|
| 12 | POST | `/auth/refresh` | Refresh access token | `{ refresh_token: string }` | `{ access_token }` or `{ token }` or `{ accessToken }` |

**Note:** The app uses `BaseUrl + "/auth/refresh"` (no `/api` prefix). Keep this path or change it in `src/lib/api/http.ts`.

---

## 3. Availability / Slots API (for booking: date + time of day + start time)

After the user selects **date**, **time of day** (Morning / Afternoon / Evening), **at least one activity or package**, and **guests**, the frontend requests available **start-time slots** with an availability count (e.g. “6 am”, “100 available”).

| # | Method | Path | Purpose | Query params | Response |
|---|--------|------|---------|--------------|----------|
| 15a | GET | `/api/availability/slots` | Get slots (start time + available count) | `date` (YYYY-MM-DD), `timeOfDay` (morning \| afternoon \| evening), `activityIds` (comma-separated), `packageIds` (comma-separated), `adults`, `children` | `Slot[]` |

**Slot shape:**

- `startTime: string` — e.g. `"6:00 am"`, `"6 am"`
- `available: number` — number of spots (e.g. 100)
- `discount?: number` — optional discount in dollars (e.g. 5 for “$5 off”)

When `NEXT_PUBLIC_API_BASE_URL` is not set, the app uses fallback slots (e.g. 6:00 am–1:30 pm, 100 available each).

---

## 4. Bookings APIs (to make app fully backend-driven)

The app currently stores bookings only in the cart (localStorage) and does not send them to the backend. To make “My Bookings” and booking history real, the backend should provide:

| # | Method | Path | Purpose | Request | Response |
|---|--------|------|---------|---------|----------|
| 16 | POST | `/api/bookings` | Create booking (submit cart) | Booking payload (holder, persons, date, timeSlot, activities, packages, foods) | `{ id, ...booking }` |
| 17 | GET | `/api/bookings` | List current user’s bookings | Optional: `?status=...&search=...` | `Booking[]` |
| 18 | GET | `/api/bookings/:id` | Get one booking (e.g. View) | — | `Booking` |
| 19 | PATCH | `/api/bookings/:id` | Update booking (Edit) | Partial booking | `Booking` |
| 20 | POST or PATCH | `/api/bookings/:id/cancel` | Cancel booking | — | `Booking` (e.g. status: Cancelled) |
| 21 | POST or PATCH | `/api/bookings/:id/check-in` | Check in (Upcoming only) | — | `Booking` (e.g. status: CheckedIn) |

**My Bookings page – API mapping**

| UI action | API | Notes |
|-----------|-----|--------|
| **List** (page load) | GET `/api/bookings` | Optional query: `status`, `search` for filter/sort. |
| **View** (button) | GET `/api/bookings/:id` | Load full booking details for detail view / modal. |
| **Edit** (button) | PATCH `/api/bookings/:id` | Only for Upcoming. Body: partial booking (date, timeSlot, persons, activities, etc.). |
| **Cancel** (button) | POST/PATCH `/api/bookings/:id/cancel` | Only for Upcoming. Backend may return refund info. |
| **Check In** (button) | POST/PATCH `/api/bookings/:id/check-in` | Only for Upcoming. Marks booking as checked in. |

**Booking payload (minimal from frontend):**

- Holder: name, email, phone, notes  
- Persons: adults, children  
- date, timeSlot, timeOfDay  
- activities: `{ id, gameNo }[]`  
- packages: `{ id }[]`  
- foods: `{ id, quantity }[]`

---

## 5. Payment APIs (optional but recommended)

Payment is currently UI-only (cart cleared locally). To record payments in the backend:

| # | Method | Path | Purpose | Request | Response |
|---|--------|------|---------|---------|----------|
| 22 | POST | `/api/orders` or `/api/payments` | Create order / process payment | Cart items, amount, payment method, booking ids | `{ orderId, status, ... }` |

After this, “My Bookings” can show payment status from the backend.

---

## Summary Count

| Category        | Required for current UI | Optional / recommended |
|----------------|-------------------------|-------------------------|
| Catalog        | 6 (list + search)       | 3 (get by id)           |
| Auth           | 2 (request-otp, verify-otp) | —                  |
| Token refresh  | 1                       | —                       |
| Availability   | 1 (slots)               | —                       |
| Bookings       | 0 (currently mock)      | 5 (CRUD + cancel)       |
| Payment        | 0 (currently local)     | 1                       |

- **Minimum to replace local/mock data today:** **10 APIs** (6 catalog + 2 auth OTP + 1 refresh + 1 availability slots).  
- **For a full backend-dependent app (bookings + optional payment):** **16–17 APIs** (add 5 bookings + 1 payment; optionally 3 catalog get-by-id).

---

## File reference

- **API base URL:** `src/config/index.ts` → `NEXT_PUBLIC_API_BASE_URL`
- **Catalog + Auth calls:** `src/lib/api/services.ts`
- **HTTP client + refresh:** `src/lib/api/http.ts`
- **Types:** `src/lib/api/types.ts`
- **My Bookings (mock):** `src/app/my-bookings/page.tsx` → replace with `GET /api/bookings`
- **Cart submit:** Booking dialog adds to cart only; to persist, add call to `POST /api/bookings` and then clear or sync cart from server.
- **Slots:** `src/lib/api/services.ts` → `availabilityApi.getSlots()`; `Step1AvailabilitySelection.tsx` uses `useAvailabilitySlots()` to show start time + “X available” per slot.
- **Sign-in (OTP):** `src/app/sign-in/page.tsx` — user enters email → “Send OTP” → user enters OTP → “Verify & Sign In”. Auth: `authApi.requestOtp()`, `authApi.verifyOtp()`; hooks: `useRequestOtp()`, `useVerifyOtp()`. Sign-up and forgot-password pages have been removed.
