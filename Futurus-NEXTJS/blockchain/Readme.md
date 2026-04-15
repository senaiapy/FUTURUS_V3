
# 🚀 DecentraPredict: A Decentralized Prediction Market

DecentraPredict is an open-source, decentralized prediction market platform built on Solana. It empowers users to create, participate in, add liquidity to, and resolve prediction events through trustless smart contracts.

> ⚖️ Bet on real-world outcomes. Earn rewards if your prediction is correct. Designed for transparency, fairness, and community governance.

---

## 🧠 How It Works

- **Create Market:** Users can establish prediction events, such as "Will BTC reach $80k by December 2025?"  
- **Add Liquidity:** Users can fund markets to boost liquidity and trading volume  
- **Place Bets:** Participants stake tokens on outcomes like "Yes" or "No"  
- **Locking Period:** Markets close at the designated deadline; no further bets are accepted  
- **Resolution:** An oracle fetches and verifies the actual outcome of the event  
- **Payout:** Winners receive rewards proportionally based on their stakes  

## ✨ Features

- 📊 Create custom markets with clearly defined outcomes  
- 💰 Add liquidity to enhance market depth and trading activity  
- 🔐 Trustless, decentralized smart contracts ensuring security  
- 🧾 Transparent resolution and reward distribution processes  
- 💸 Token-based betting and reward mechanisms  
- 🧠 Oracle integration for automatic result fetching  
- 👨🏿‍🤝‍👨🏿 Referral system to foster community growth  

---

## 🏗️ Tech Stack

- **Blockchain:** Solana  
- **Smart Contracts:** Anchor / Rust  
- **Frontend:** Next.js + Tailwind CSS  
- **Backend:** Node.js + Express + MongoDB  
- **Oracles:** Switchboard  

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+  
- Anchor v0.29.0+  
- Next.js v15.2.1+  
- MongoDB Atlas (for backend data storage)  

### Installation

```bash
# Clone the repository
git clone https://github.com/solzarr/Prediction-Market-Solana
cd decentrapredict

# Install dependencies
npm install

# Run frontend
npm run dev

# Run backend
npm start
```

### Backend Environment Variables

Create a `.env` file in the root directory with the following content:

```env
PORT=YourPortNumber
DB_URL=YourMongoDBConnectionString
PASSKEY=YourSecurePasskey
FEE_AUTHORITY=YourFeeAuthorityPublicKey
```

---

## 💬 Contact

For inquiries, support, or custom development requests, please reach out via:

---
# futurus-solana
