1 - create a react native app + expo and add related packages according to mvp plan

The MVP combines 5 modules into a single daily ritual. The goal is for the user to complete a “connection” action in 30–90 seconds each day and carry it to their partner via WhatsApp—while the Daily Question reveals only after both partners answer.

⸻

0) Product backbone

Daily home screen (Home) = 3 cards
	1.	Photo Deck (Swipe)
	2.	Question of the Day (Mutual Reveal)
	3.	Today’s Mood

Bottom tabs
	•	Home
	•	Bucket List
	•	Archive / Recap (weekly)
	•	Settings

Key MVP change: Partner pairing is now required (for Mutual Reveal)
	•	MVP now uses a “paired couple + optional WhatsApp share” model.
	•	Pairing is lightweight: invite code / QR, no chat.

⸻

1) Photo Swipe + WhatsApp share (Deck-based)

User stories
	•	I can upload photos (from my gallery) and add them to the “Us” album.
	•	The app shows photos like stacked swipeable cards (deck).
	•	I can only swipe right → heart animation + “liked”.
	•	I can swipe up → opens WhatsApp share sheet + lets me add a pre-written message.

MVP scope
	•	Albums/tags not required: single album “Us”.
	•	Deck logic:
	•	If user has N photos, the deck shows N cards.
	•	Each right swipe removes the top card and reveals the next.
	•	When deck ends: “Done for today” + CTA to add photos.
	•	Swipe rules:
	•	Right: Like (local log)
	•	Left: Disabled (bounce back)
	•	Up: Share → WhatsApp share sheet + message templates (3 options)
	•	Event for shared photo: photo_shared
	•	(Optional gamification) Daily swipe milestones change heart theme (10/15/20+).

Success metrics
	•	≥ 1 photo swipe/day
	•	≥ 2 shares/week

⸻

2) Daily Question (Mutual Reveal)

Core rule (updated)
	•	The daily question and answers become visible only after both partners submit their answers.
	•	This requires:
	•	Couple pairing
	•	Server-side state to know if both answered
	•	Controlled reveal

Flow (updated)
	•	Show 1 question per day (same question for both users in the couple).
	•	User taps “Answer” → short text (max 280–500 chars) → submit to server.
	•	Until the partner answers, the user sees “Waiting for your partner…” (no partner answer shown).
	•	When the partner answers too, the card becomes “Unlocked” and both answers are revealed.

Card states (Home UX)

State A — Not answered
	•	“Answer to unlock”
	•	CTA: Answer now

State B — Answered, waiting
	•	“You answered ✓”
	•	“Waiting for your partner…”
	•	CTA: Send a nudge (WhatsApp template or push)

State C — Unlocked (Mutual Reveal)
	•	Show:
	•	Question
	•	Your answer
	•	Partner answer
	•	CTA: Share highlight (WhatsApp text; optionally include one selected line)

State D — Missed day (optional MVP)
	•	If day ends and partner didn’t answer:
	•	“Not unlocked today”
	•	“Try again tomorrow”
	•	(Keep MVP simple: no retroactive unlock.)

MVP scope (updated)
	•	Minimal onboarding:
	•	Relationship type (dating / married / long-distance)
	•	Relationship duration (optional)
	•	Pair partner: invite code / QR
	•	Question bank: 100–200 questions (with category tags)
	•	Selection algorithm (server-side):
	•	Don’t repeat same question within 60 days (per couple)
	•	Weight by relationship type

Success metrics (updated)
	•	Daily question answer rate
	•	Unlock rate (days where both answered)
	•	Nudge → completion lift

⸻

3) One-tap Mood check-in

Flow
	•	5 emojis: 🙂 😐 😞 😠 😴
	•	Select → save (1 selection/day)
	•	Optional: “Send to partner” → WhatsApp

MVP scope
	•	No “reason” tags (adds complexity). Later.
	•	UI: “How are you today?” + emoji row

Success metrics
	•	Mood completion rate
	•	Impact on daily retention

⸻

4) Bucket List

Flow
	•	3 categories: Places / Things to Try / Movies to Watch
	•	Add item (text)
	•	Mark as completed (date auto-set)
	•	On completion, optional “Share” (WhatsApp)

MVP scope
	•	Sorting: creation date
	•	Filter: active / completed
	•	MVP decision: keep bucket list personal (no shared sync)
	•	Rationale: reduces backend scope; sharing still drives connection.

Success metrics
	•	Weekly items added
	•	Completion rate

⸻

5) Streak + Weekly recap (updated for Mutual Reveal)

Streak definition (updated)

Keep it explicit and frictionless:

Personal streak (counts if at least 1 action/day):
	•	Like/share a photo
	•	Answer the daily question (submit)
	•	Select a mood

Optional (recommended) Couple streak:
	•	Counts only if Daily Question unlocks (both answered).
	•	This becomes the “relationship-strength” metric.

Streak screen
	•	Current streak (personal)
	•	Longest streak (personal)
	•	Active days this week
	•	(Optional) Couple unlock streak

Weekly recap

Every Sunday (or first open of the week), show Weekly Recap:
	•	Active days this week
	•	Photos liked/shared count
	•	Questions answered count
	•	Questions unlocked count (new, key metric)
	•	Bucket items completed count
	•	“Highlight of the week” (user selects: a photo or an unlocked answer)

Share button → WhatsApp text + optional selected photo.

⸻

Screen list (MVP) — updated
	1.	Onboarding (2–4 screens)
	•	Relationship info
	•	Notification time
	•	Pair partner (create/join code)
	2.	Home (3 cards)
	3.	Photo Swipe Deck screen
	4.	Daily Question (answer + waiting + reveal screen or modal)
	5.	Mood selection bottom sheet
	6.	Bucket List (list + add)
	7.	Weekly Recap (share)
	8.	Settings (notification time, language, privacy)
	9.	(Optional) Pairing management screen (invite code regenerate / unlink)



    Create related data model

    e.g. BUT YOU CAN MAKE IT BETTER this is just an example

    Local (device)
	•	Photo { id, localUri, createdAt, likedAt?, sharedAt?, lastShownAt? }
	•	MoodEntry { dateKey, mood }
	•	BucketItem { id, type, text, createdAt, completedAt? }
	•	ActivityLog { dateKey, didPhoto?, didMood?, didBucket?, didQuestionSubmit? }

Server (required for Mutual Reveal)
	•	User { id, authProvider, createdAt }
	•	Couple { id, memberA, memberB, createdAt }
	•	DailyPrompt { coupleId, dateKey, questionId, createdAt, unlockedAt? }
	•	Answer { coupleId, dateKey, userId, text, createdAt }
	•	QuestionBank { id, text, tags }


Backend requirements (MVP minimal) // YOU CAN DECIDE  UPDATE 

Auth
	•	Phone OTP or email magic link (choose one).
	•	Must yield stable userId.

Pairing
	•	Create couple → generate invite code / QR
	•	Join couple via code → assign both to same coupleId

Daily question
	•	Create or fetch DailyPrompt(coupleId, dateKey)
	•	Store answers
	•	Unlock when 2 answers exist

API endpoints (minimum)
	•	POST /auth/start + POST /auth/verify (or equivalent)
	•	POST /couple/create
	•	POST /couple/join
	•	GET /daily → returns question + myStatus + unlocked flag
	•	POST /daily/answer
	•	GET /daily/reveal → returns both answers only if unlocked

Push notifications (recommended)
	•	1/day: “Today’s question is ready”
	•	Follow-up: if A answered and B not answered by X hours → notify B

⸻

Notification strategy (updated)
	•	Daily: “Your daily question is ready”
    -   Daily: 'Your partner looked 25 fotos of yours' ( think about it )
	•	Optional: “Pick today’s photo”
	•	Conditional:
	•	“Your partner answered—unlock it by answering too” (only once/day)

User selects the notification time during onboarding.

⸻

MVP scope guardrails (to keep it shippable)
	•	No in-app chat.
	•	No retroactive question unlocks.
	•	No shared bucket list sync (yet).
	•	Answers: either no edit after submit, or 5-minute edit window (pick one and lock it).
	•	Don’t show “who is late” aggressively—keep phrasing neutral.

⸻

If you want, I can also rewrite the Daily Question section copy for the UI (microcopy for the 4 states) so the “waiting/unlock” feels supportive, not pressure-inducing.