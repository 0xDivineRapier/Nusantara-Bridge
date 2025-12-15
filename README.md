# 🇮🇩 Nusantara Bridge

**Nusantara Bridge** is Indonesia's premier crypto-to-fiat bridge, designed to facilitate instant settlements from EVM-compatible blockchains (Ethereum, BSC, Polygon) directly to Indonesian bank accounts (IDR).

Built with performance, security, and permissionless access in mind, this application acts as an orchestration layer between decentralized wallets, centralized exchanges (Indodax), and payment gateways (Xendit).

![Status](https://img.shields.io/badge/Status-Beta-blue)
![Stack](https://img.shields.io/badge/Stack-Next.js_14-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📸 Product Overview

### 1. Landing Page
The gateway to the ecosystem, featuring localized Indonesian aesthetics (Batik motifs) and real-time market data.

![Landing Page](https://via.placeholder.com/800x450/0f172a/ef4444?text=Nusantara+Bridge+Landing+Page)

### 2. Permissionless Dashboard
A unified view of your cross-chain assets with an integrated bridging interface. No KYC required for the UI.

![Dashboard Interface](https://via.placeholder.com/800x450/1e293b/3b82f6?text=Dashboard+and+Swap+Interface)

---

## 🎮 Demo Walkthrough

Experience the flow of bridging assets from an EVM wallet to a local Bank BCA account:

1.  **Connect Wallet**: 
    - Click **"Connect Wallet"** on the top right.
    - The app authenticates via `viem` (simulating a MetaMask connection).
    - *Note: No sign-up or KYC forms are required to access the dashboard.*

2.  **Analyze Market with AI**:
    - Select **Ethereum** network.
    - Enter `1.5 ETH` in the "From" field.
    - **Google Gemini AI** automatically analyzes the `ETH/IDR` chart and provides a trading recommendation (e.g., *"Volatility is high, consider waiting"* or *"Good rate based on 7-day avg"*).

3.  **Execute Bridge**:
    - Select **BCA** as the destination bank.
    - Input the account number.
    - Click **"Confirm Swap"**.

4.  **Real-Time Settlement Tracking**:
    - The transaction appears in the "Recent Transactions" table.
    - Watch the status update live:
        1.  `PENDING_DEPOSIT`: Waiting for blockchain confirmation.
        2.  `DEPOSIT_CONFIRMED`: Assets received by the bridge smart contract.
        3.  `EXCHANGED`: Assets sold on **Indodax** for IDR.
        4.  `PAYOUT_INITIATED`: IDR sent via **Xendit** to the user's bank.

---

## 🏗 Architecture

The system follows an event-driven architecture to bridge on-chain assets to off-chain fiat currency.

```mermaid
sequenceDiagram
    participant User
    participant Wallet as Web3 Wallet
    participant App as Next.js App
    participant Watcher as Chain Watcher
    participant DB as Postgres (Prisma)
    participant Indodax as Indodax Exchange
    participant Xendit as Xendit Payouts
    participant Bank as User Bank (BCA/Mandiri)

    User->>App: Connect Wallet & Request Bridge
    App->>Wallet: Request Transfer (USDC/ETH)
    Wallet-->>App: Tx Hash
    
    par Blockchain Listener
        Watcher->>Watcher: Detect 'Transfer' Event
        Watcher->>App: Webhook / Server Action
    end

    App->>DB: Record Transaction (PENDING)
    
    App->>Indodax: Execute Market Sell (USDC -> IDR)
    Indodax-->>App: Order Filled & Balance Updated
    
    App->>Xendit: Create Payout Request (IDR)
    Xendit->>Bank: Transfer Funds (Real-time)
    Bank-->>User: Funds Received
    
    App->>DB: Update Status (COMPLETED)
    App-->>User: Update UI Notification
```

## ✨ Key Features

- **Permissionless Access**: No KYC required for the user interface. Connect via Viem/Wagmi and bridge immediately.
- **Multi-Chain Support**: Seamlessly switch between Ethereum Mainnet, BSC, and Polygon.
- **AI Market Insights**: Integrated **Google Gemini AI** to provide real-time trading advice and volatility warnings before you bridge.
- **Real-time Settlement**: Uses Xendit's enterprise disbursement API for sub-minute fiat transfers.
- **Liquidity Aggregation**: Fetches best-bid rates from Indodax to ensure minimal slippage.
- **Responsive Dashboard**: Beautiful, dark-mode UI built with Tailwind CSS and Recharts.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS.
- **Blockchain Interaction**: `viem` (Type-safe Ethereum interface).
- **Backend Logic**: Next.js Server Actions.
- **Database**: PostgreSQL with Prisma ORM.
- **External APIs**: 
  - **Indodax** (Crypto Exchange).
  - **Xendit** (Fiat Disbursement).
  - **Google GenAI** (Gemini 2.5 Flash).
- **Monitoring**: Custom Chain Watcher script.

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL Database
- An Ethereum Wallet (Metamask, Rabby, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nusantara-bridge.git
   cd nusantara-bridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy the example environment file and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

### Running the Chain Watcher

The bridge requires a watcher to detect on-chain deposits. Run this in a separate terminal:

```bash
# Ensure you have ts-node or run via build
npx ts-node scripts/watcher.ts
```

## 📂 Project Structure

```
├── app/                # Next.js App Router pages and layouts
│   ├── actions/        # Server Actions (Bridge logic)
│   ├── api/            # Internal API routes (Webhooks)
│   └── ...
├── components/         # Reusable UI components (Charts, Swap Interface)
├── lib/                # Library wrappers (Indodax, Xendit, Prisma)
├── prisma/             # Database schema
├── services/           # Business logic services (Mock backend, AI)
├── scripts/            # Standalone scripts (Blockchain Watcher)
└── types.ts            # TypeScript definitions
```

## 🛡 Disclaimer

This project is a **Proof of Concept (PoC)**. 
- The `services/mockBackend.ts` mimics production delays and success rates.
- Real money transactions require valid API keys from Indodax and Xendit in `.env`.
- Ensure smart contracts are audited before mainnet deployment.

## 📄 License

MIT License.