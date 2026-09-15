# 🚩 FlagOps 

> **Because testing in production is a lifestyle, not a mistake.**

Welcome to **FlagOps**. We all know that heart-dropping moment when you merge to `main`, deploy to production, and immediately realize you've broken the checkout flow. FlagOps is a feature management and targeted rollout platform that lets you hide your buggy code behind an elegant toggle switch. 

Now, when things go south, you can just flip a switch instead of aggressively typing `git revert` while your product manager breathes down your neck.

---

## 🎭 What Does It Actually Do?

At its core, FlagOps is a glorified interface for `if/else` statements. But it's *enterprise-grade* `if/else` statements. It allows you to decouple deployment from release. You can ship half-baked features to production, keep them turned off, and then slowly release them to the wild to see what breaks.

### ✨ Features (or, "Ways to avoid blame")

- **🎛️ Feature Toggles:** The bread and butter. Turn features on or off without redeploying your entire application.
- **🎲 Percentage-Based Rollouts:** Want to test a new feature but terrified it will crash the DB? Roll it out to exactly 10% of your users. Let *them* be the sacrifice.
- **🎯 Whitelists & Blacklists:** Explicitly enable a feature for your QA team, while explicitly blacklisting that one user who always finds edge cases.
- **👥 Group Targeting:** Group your users (e.g., "beta-testers", "internal-staff") and turn features on for them simultaneously because treating users as individuals is exhausting.
- **🚧 Route-Level Flags:** Completely block access to specific backend API routes when things go horribly wrong.
- **🕵️ Audit Logs:** A meticulously maintained ledger of exactly who changed what, and when. Perfect for post-mortem finger-pointing.
- **📊 Analytics Dashboard:** Pretty charts so management thinks you know what you're doing.

---

## 🧠 Concepts Learned (The Developer Trauma)

Building this wasn't just about slapping a UI on a database. Here's what we actually learned while crying into our keyboards:

1. **The Illusion of Control (Feature Evaluation Logic):** We learned how to build complex evaluation chains (Is it globally off? Is the user whitelisted? Blacklisted? In an allowed group? Did they win the percentage rollout lottery?). It turns out, evaluating rules accurately and fast requires actual thinking.
2. **State Management Sanity:** Used TanStack Query so we don't accidentally DDoS our own backend every time someone clicks a tab. Caching is hard, but refetching everything constantly is worse.
3. **Optimistic UI Updates:** Making the toggle switch flip instantly on the frontend before the backend actually confirms it. We call this "lying to the user to improve UX."
4. **Relational Data Modeling:** Using Prisma to link Users, Groups, Feature Flags, Route Flags, and Audit Logs without creating a circular dependency nightmare.
5. **Modern Frontend Architecture:** Building a slick, interactive dashboard with React, Vite, Tailwind CSS, and Shadcn UI. Because if the code under the hood is a mess, the UI should at least look like a million bucks.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI, TanStack Query, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM.
- **Database:** Postgres / SQLite (depending on how much pain you want).
- **Package Manager:** Bun (because we are impatient and `npm install` takes too long).

---

## 🚀 Setup & Installation

Follow these instructions exactly. If it doesn't work, it's definitely your environment and not my code.

### Prerequisites
- Node.js (v18+)
- [Bun](https://bun.sh/) (Seriously, install it, it's fast)
- A working keyboard and a sense of optimism

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/feature-flagging.git
cd feature-flagging
```

### 2. Backend Setup (Where the magic happens)
```bash
cd backend

# Install dependencies (blazingly fast)
bun install

# Set up your environment variables
# Copy .env.example to .env and pretend you read it
cp .env.example .env

# Push the Prisma schema to your database 
# (Hope you have a local DB running, otherwise use SQLite)
bunx prisma db push

# Start the backend server
bun run dev
```
*Note: If the server crashes on startup, read the red text. It's usually a missing `.env` variable.*

### 3. Frontend Setup (The pretty part)
Open a new terminal window because we aren't savages.

```bash
cd frontend

# Install dependencies
bun install

# Start the Vite development server
bun run dev
```

### 4. Witness the Glory
Open `http://localhost:5173` in your browser. Log in, create a flag, roll it out to 50%, and bask in the glory of controlled chaos.

---

## 🤝 Contributing

Found a bug? Obviously you did. Feel free to open a Pull Request. Just make sure your code doesn't break my code, and we'll get along fine.

## 📄 License

MIT License. Do whatever you want with it, just don't blame me if you toggle off your payment gateway in production.

