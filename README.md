# PRG Batch System — Vision & Future

> A place to discuss the **purpose**, **who it serves**, **what problem it solves**, and **where it could go**. No tech—just the “why” and “who.”

**Technical stack & implementation:** see [TECH.md](./TECH.md). **MVP build stages and pipeline:** see [MVP.md](./MVP.md).

**Context:** Panda Express (or similar quick-service) — replacing verbal order calling between front of house (FOH) and back of house (BOH) with a screen-based ticket system for batches.

---

## Problem Statement

**Current situation:** Front of house associates call food to the back of house **verbally**. That creates real pain:

- **Orders get messed up** — Misheard items, wrong quantities, or items dropped in the rush.
- **Delays** — Repeats, clarifications, and re-calls slow the line and frustrate everyone.
- **No reliable record** — Nothing written or on-screen; if someone forgets or gets distracted, the order is wrong.
- **Peak pressure** — When it’s busy, verbal calling breaks down first.

**Who is affected:** FOH (stress, having to repeat), BOH (confusion, rework), and ultimately **customers** (wrong order, longer wait).

---

## Purpose

**One sentence:** Replace verbal order calling with a system where FOH “calls” food from screens and BOH receives clear, consistent tickets on their own screens—creating a **robust ticket system for batches**.

**Supporting goals:**

- FOH can call food from **two positions:** (1) **front of house tablet**, (2) **drive-thru tablet**. Calls become tickets that route to **the right BOH tablet** by food category (see Tablets and screens).
- Every call becomes a **ticket** that appears on the **correct BOH tablet(s)** so each station sees what it needs to make.
- **Batches** are clear and traceable—no “did we get that order?” or “which batch is this?”
- Reduce wrong orders and delays by making the handoff visual and consistent instead of verbal.

---

## How to use: defined on a screen

**How to use the app and what to do in it** should be defined **on a screen in the app** — e.g. an instructions or help screen that anyone with access can read. No separate manual required; the app explains itself.

---

## Tablets and screens (5 total)

**Total: 5 tablets** — 2 for calling food (FOH + drive-thru), 3 for BOH display (by category). What each one does and where food goes:

### Calling food (tablets 1 & 2)

| Tablet | Purpose | What people do | Where the food goes |
|--------|---------|----------------|---------------------|
| **1. Front of house** | Call food with appropriate batches | Same function: select item, choose batch, call it | Food goes to **front of house steam table** |
| **2. Drive-thru** | Call food with appropriate batches | Same function: select item, choose batch, call it | Food goes to **drive-thru steam table** |

Tablets 1 and 2 are **the same app / same function** — the only difference is **where the food is returned**: FOH steam table vs drive-thru steam table. So drive-thru orders are called from tablet 2 and go to the drive-thru steam table; FOH orders from tablet 1 go to the FOH steam table.

### Food categories and routing to BOH

Menu items are grouped into **categories**. When food is called from tablet 1 or 2, tickets are sent to **different BOH tablets** depending on category:

| Category | Goes to BOH tablet |
|----------|---------------------|
| Sides | **Tablet 5** |
| Grill | **Tablet 5** |
| Fry item | **Tablet 4** |
| Appetizer | **Tablet 4** |
| Stir fry | **Tablet 3** |

**Which items are in each category:**

| Category | Item codes |
|----------|------------|
| **Stir fry** | B1, C2, C3, CB1, V1 |
| **Fry item** | F4, CB3, B5, C1, CB5 |
| **Sides** | M1, R1, R2 |
| **Appetizer** | E1, E2, E3 |
| **Grill** | C4 only |

So:

- **Tablet 3** — shows **stir fry** only (from both FOH and drive-thru).
- **Tablet 4** — shows **fry item + appetizer** (from both FOH and drive-thru).
- **Tablet 5** — shows **sides + grill** (from both FOH and drive-thru).

### Summary

| # | Screen | Function | Sees / receives |
|---|--------|----------|------------------|
| 1 | Front of house | Call food (batches) | Own calls only; food → FOH steam table |
| 2 | Drive-thru | Call food (batches) | Own calls only; food → drive-thru steam table |
| 3 | BOH | Display tickets | Stir fry only (from 1 + 2) |
| 4 | BOH | Display tickets | Fry item + Appetizer (from 1 + 2) |
| 5 | BOH | Display tickets | Sides + Grill (from 1 + 2) |

### Switching between screens / pages

The app has a **menu** (navigation) that lets the user **switch between screens/pages** on any physical tablet. So a tablet can be set to “this tablet is now **1** (FOH)” or “now **5** (sides + grill)” etc. — and **one of the pages is the menu editor**. So we stay with **5** screen types (1–5) plus a **menu** page; any physical device can switch to any of them. Menu editing is done from the same tablets by switching to the menu page.

---

## Screen functions: global vs per-screen

### Global (available on every screen)

Available no matter which screen (1, 2, 3, 4, 5, or Menu) is currently shown:

- **Navigation** — Switch which screen this tablet is showing (e.g. "Now this tablet is 1" / "Now 5" / "Now Menu"). User can change to screen 1, 2, 3, 4, 5, or Menu from anywhere.
- **Instructions / how to use** — Access to the in-app instructions screen (how to use the app and what to do). Can be a link, button, or dedicated area so it's reachable from any screen.

### Screen-specific (only on that screen)

| Screen | Available only on this screen |
|--------|-------------------------------|
| **1 — Front of house** | Call food from **full menu**, laid out in **3 sections** (steam table). See FOH section below. View **own** calls only. Food destination: FOH steam table. |
| **2 — Drive-thru** | Call food from **12 items only** (see below). Layout in **3 sections** on this screen. View **own** calls only. Food destination: drive-thru steam table. |
| **3 — BOH Stir fry** | View **waiting queue** (stir fry tickets only). **Start** timer on a ticket. See **in progress** and **quality check** (sound, 0, wait for Complete). Tap **Complete** to move ticket to completed queue. **Completed queue** at bottom. Max **2** timers at once. |
| **4 — BOH Fryer** | Same structure as 3: waiting queue (fry item + appetizer), Start, in progress, quality check, Complete, completed queue at bottom. **Multiple** timers at once. |
| **5 — BOH Sides + Grill** | Same structure: waiting queue (sides + grill), Start, in progress, quality check, Complete, completed queue at bottom. **One** timer at a time for sides, **one** for grill. |
| **Menu** | **Edit menu:** add/remove items, food code, title, category, available batch sizes, cook time per batch size, enable/disable item, recommended batch per daypart. |

So: **navigation** and **instructions** are global; **calling food**, **BOH queues/timers/Complete**, and **menu editing** exist only on their specific screens.

### Front of house (screen 1): full menu, 3 sections (steam table)

FOH uses the **full menu** for calling. On the FOH screen items are laid out in **3 sections** that match the steam table:

| Section | Items |
|---------|--------|
| **Section 1** | F4 Honey Walnut Shrimp, R1 White Rice, V1 Super Greens, M1 Chow Mein, R2 Fried Rice, B3 Black Pepper Sirloin Steak, C2 Mushroom Chicken |
| **Section 2** | B1 Broccoli Beef, CB3 Honey Sesame Chicken Breast, B5 Beijing Beef, C1 Orange Chicken, CB1 String Bean Chicken Breast, CB5 SweetFire Chicken Breast |
| **Section 3** | The rest — e.g. E2 Chicken Egg Roll, E1 Veggie Spring Roll, E3 Cream Cheese Rangoon (and any other items not in Section 1 or 2) |

### Drive-thru (screen 2): 12 items and 3 sections (fixed)

Drive-thru has **only 12 items** available to call. The list and section layout are **fixed** (not editable, like dayparts). On the drive-thru screen these 12 are displayed in **3 sections** as below.

**12 items:**

| Code | Title |
|------|--------|
| C1 | Orange Chicken |
| C4 | Grilled Teriyaki Chicken |
| B1 | Broccoli Beef |
| F4 | Honey Walnut Shrimp |
| B5 | Beijing Beef |
| M1 | Chow Mein |
| R2 | Fried Rice |
| R1 | White Rice |
| V1 | Super Greens |
| C3 | Kung Pao Chicken |
| C2 | Mushroom Chicken |
| CB3 | Honey Sesame Chicken Breast |

**Layout on drive-thru screen:**

| Section | Items |
|---------|--------|
| **Section 1** | M1 Chow Mein, R2 Fried Rice, V1 Super Greens, C3 Kung Pao Chicken, C2 Mushroom Chicken |
| **Section 2** | C1 Orange Chicken, C4 Grilled Teriyaki Chicken, B1 Broccoli Beef, F4 Honey Walnut Shrimp, B5 Beijing Beef, CB3 Honey Sesame Chicken Breast |
| **Section 3** | R1 White Rice |

---

## Who sees what (visibility)

- **Tablet 1 (FOH)** sees **only** orders called from tablet 1.
- **Tablet 2 (Drive-thru)** sees **only** orders called from tablet 2.
- **BOH tablets 3, 4, 5** each see **both** FOH and drive-thru — but **only the categories that route to that tablet** (3 = stir fry, 4 = fry + appetizer, 5 = sides + grill). **No distinction** between FOH and drive-thru on BOH; one combined queue per category.
- **Ticket order:** **last order first** — newest order at the top of the queue.
- **BOH queues:** Tickets sit in a **waiting queue**. When the cook taps **Complete**, the ticket **disappears from the waiting queue** and **goes to the completed queue**. The **completed queue** is **displayed on BOH** — under everything else on the screen (at the bottom).
- **Multiple timers:** More than one ticket can have a timer running at the same time, **per station**: **Fryer (tablet 4 — fry item + appetizer)** — **multiple** timers at once. **Stir fry (tablet 3)** — **at most 2** at once. **Sides (tablet 5)** — **only one** timer active at a time. **Grill (tablet 5)** — **only one** timer active at a time.
- **Timer (BOH) — states / functions:**
  - **Waiting** — Ticket is in the waiting queue, waiting to launch (cook has not started yet).
  - **Start** — Cook taps Start → launches the timer (cook time from the menu for that batch size). Timer displays on all BOH screens.
  - **In progress** — Timer is running / ongoing.
  - **Quality check** — Timer has reached 0; app **plays a sound** and waits for the cook to tap **Complete**. Only after Complete does the ticket move from waiting queue to **completed queue**.

---

## Access: No Authentication

The system has **no users, no roles, no sign-in, sign-out, or registration**. No auth.

The app runs on a **protected server** (or network). Access is controlled **outside** the app (e.g. who can reach that server or that network). **If they’ve got access, they’ve got access** — to everything. Call food, view tickets, edit the menu. No restrictions inside the app; the app does not distinguish who is who.

---

## Menu: Predefined and Editable

Food is **predefined** — there is a **set menu** — but the menu must be **editable** so the store can change items, batch sizes, and cook times without changing the app.

**Each menu item has:**

| Field | Description | Example |
|-------|-------------|---------|
| **Food code** | Short identifier for the item | `C1` |
| **Title** | Display name | Orange Chicken |
| **Category** | Determines which BOH tablet receives the ticket | Sides, Fry item, Stir fry, Appetizer, Grill (see Tablets and screens) |
| **Available batch sizes** | Which batch options can be called | `0.5`, `1`, `2`, `3`, Catering |
| **Time to cook** | Cook time **per batch size** (can differ by size) | See below |
| **Recommended batch per daypart** | Suggested batch size for each daypart (Breakfast, Lunch, Snack, Dinner, Late Snack) | See Dayparts section |

**Example — Orange Chicken (C1):**

| Batch size | Time to cook |
|------------|----------------|
| 0.5 batch  | 7 mins        |
| 1 batch    | 7 mins        |
| 2 batch    | 8 mins        |
| 3 batch    | *(add as needed)* |
| Catering   | 8 mins        |

- **Batch sizes and cook times vary by item.** One item might have only 1, 2, Catering; another might have 0.5, 1, 2, 3, Catering. Times are defined per batch size per item.
- **Item availability is not predefined.** By default, every menu item is **available**. The system must support **enabling or disabling** items (e.g. when something is 86’d, or not offered that day). Only enabled items can be called from FOH/drive-thru and shown on BOH; disabled items are hidden or not selectable. This is an on-the-day (or in-the-moment) control, not a fixed schedule.
- The system should support **editing the menu**: add/remove items, change codes and titles, **assign category** (sides / fry item / stir fry / appetizer / grill) for routing, set which batch sizes exist and what cook time each size has, **enable or disable** items, and set **recommended batch per daypart** (see below).

---

## Dayparts

The day is split into **dayparts**. Each item can have a **recommended batch size** for each daypart (e.g. “at lunch, recommend 1 batch; at dinner, recommend 2”). Which item gets which recommendation will be defined later; the system just needs to support this structure.

**Dayparts (fixed, not changeable):**

| Daypart     | Time   |
|-------------|--------|
| Breakfast   | 6–11   |
| Lunch       | 11–2   |
| Snack       | 2–5    |
| Dinner      | 5–8    |
| Late Snack  | 8–12   |

Daypart times are **fixed / const** — not editable in the app. Current daypart is determined by the clock; that drives recommended batch when calling.

**Per menu item:** for each daypart, we store a **recommended batch** (one of that item’s available batch sizes). So when someone is calling during Lunch, the system can suggest or default to the lunch recommendation for that item; during Dinner, the dinner recommendation, and so on. Recommendations can differ by item and by daypart.

---

## User Stories (Who & What)

### Front of house tablet

- **As a FOH associate (dine-in / counter),** I need to **call food from the front of house tablet** so that I don’t have to shout to the kitchen and I know my order was received.
- **As a FOH associate,** I need to **see only the orders I called from this tablet** so that I’m not distracted by drive-thru tickets.

### Drive-thru tablet

- **As a drive-thru associate,** I need to **call food from the drive-thru tablet** so that the kitchen gets my orders without verbal calling.
- **As a drive-thru associate,** I need to **see only the orders I called from this tablet** so that I’m not distracted by front-of-house tickets.

### Back of house (BOH)

- **As a BOH associate,** I need to **see every called order (FOH + drive-thru) as clear tickets on the same screens** so that I’m not relying on hearing someone and I have one place to look.
- **As a BOH associate,** I need **the same tickets on multiple BOH screens** so that everyone in the kitchen sees the same batches and nothing gets missed.

### Menu editing

- The system must allow **editing the menu** so that we can add or remove items, change food codes and titles, assign categories (for BOH routing), and match what we actually serve.
- The system must allow **setting available batch sizes and cook time per batch size for each item** so that different items can have different options (e.g. 0.5, 1, 2, 3, Catering) and accurate cook times.
- The system must allow **disabling or enabling menu items** so that we can turn items off when we’re out or not offering them (e.g. 86’d), and turn them back on when we are—by default everything is available; we just need the option to flip items on or off.
- The system must allow **setting the recommended batch for each daypart per item** so that the system can suggest the right batch size for the time of day (breakfast vs lunch vs dinner, etc.); which item gets which recommendation will be configured later.

### Beneficiaries (indirect)

- **Customers** — Faster, more accurate orders and shorter waits.
- **Store / shift leads** — Fewer remakes, less stress, and a clearer view of what’s in progress (no app role—just who benefits).

---

## Success Criteria (Outcomes, Not Tech)

- Fewer wrong or missing items because orders are on-screen, not verbal.
- Less delay from repeats and clarifications between FOH and BOH.
- **Five screen types:** 2 call (FOH, drive-thru) + 3 BOH (by category); plus menu page; user can switch any tablet to any screen.
- **Visibility:** BOH sees both streams (combined, no FOH vs drive-thru label); FOH tablet sees only FOH; drive-thru only drive-thru.
- A clear “batch” or ticket flow so the team knows what’s live and what’s done.

---

## Future / Open Questions

*(None right now; previous questions are captured in Decisions & Notes below.)*

---

## Decisions & Notes

*Record key decisions and assumptions here as the team aligns.*

| Date | Decision / assumption |
|------|------------------------|
| — | **5 tablets/screen types** at launch (2 call + 3 BOH). Stay with 5 for now. |
| — | **Menu editing:** User switches between screens/pages on any tablet; one page is the **menu** (edit menu there). No dedicated device. |
| — | **Ticket timing:** No “when called / when completed” for accountability. **Last order first** in queue (newest at top). |
| — | **Cook time on BOH:** Yes. When BOH taps **Start**, timer launches (cook time from menu for that batch); timer **displays on all BOH screens**. About how long item is in cooking, not “due” time. |
| — | **FOH vs drive-thru on BOH:** No distinction. Combined queue; it doesn’t matter. |
| — | **POS:** No. Standalone “call / display” only; no POS integration. |
| — | **Tablet down:** User can **switch another tablet** to that screen (1–5 or menu), or fall back to verbal. |
| — | **Current daypart:** Breakfast 6–11, Lunch 11–2, Snack 2–5, Dinner 5–8, Late Snack 8–12. Fixed/const; app uses clock for recommended batch. |
| — | **Timer when done:** When cook timer runs out → **sound**, then **wait for cook to tap Complete**; ticket moves from waiting queue to **completed queue**. |
| — | **Dayparts:** Fixed / const — not changeable in the app. |
| — | **Timer states:** Waiting (waiting to launch) → **Start** (launch timer) → In progress (timer ongoing) → Quality check (sound, 0, wait for Complete) → ticket to completed queue. |
| — | **Completed queue:** Displayed on BOH under everything on the screen (at the bottom). |
| — | **Multiple timers:** Fryer (4) — multiple; Stir fry (3) — at most 2; Sides (5) — one at a time; Grill (5) — one at a time. |
| — | **Screen functions:** Global = navigation (switch screen 1–5 or Menu) + instructions. Per-screen = call food (1, 2), BOH queues/timers/Complete (3, 4, 5), menu editing (Menu). |
| — | **Drive-thru:** Only **12 items** callable; **fixed** list and 3 sections (not editable). Section 1: M1, R2, V1, C3, C2; Section 2: C1, C4, B1, F4, B5, CB3; Section 3: R1. |
| — | **FOH:** **Full menu** for calling; **3 sections** on screen (steam table). Section 1: F4, R1, V1, M1, R2, B3, C2; Section 2: B1, CB3, B5, C1, CB1, CB5; Section 3: the rest (e.g. E2, E1, E3). |
| — | **Category → items:** Stir fry: B1, C2, C3, CB1, V1. Fry: F4, CB3, B5, C1, CB5. Sides: M1, R1, R2. Appetizer: E1, E2, E3. Grill: C4 only. |

---

*This README is a living doc. Update it as the vision and scope become clearer.*
