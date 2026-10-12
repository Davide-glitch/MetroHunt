# Metro Hunt: Real-Time Multiplayer Real Estate Tycoon & Simulation Game

[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-cyan.svg)](https://tailwindcss.com/)
[![SignalR](https://img.shields.io/badge/SignalR-WebSockets-orange.svg)](https://dotnet.microsoft.com/apps/aspnet/signalr)
[![SQL Server](https://img.shields.io/badge/Database-SQL_Server_2022-red.svg)](https://www.microsoft.com/sql-server)

**Metro Hunt** is a modern, full-stack, real-time multiplayer real estate tycoon and economic simulation platform. Investors compete in live market cycles, acquiring commercial and residential properties across metropolitan districts, managing credit facilities and debt leverage, renovating assets, and racing to achieve target net worth milestones ($2M Sprint, $10M Standard, $100M Marathon, or $1 Trillion Empire).

---

## 🏛️ System Architecture

```
                                  +-----------------------------------+
                                  |     React 18 + Vite Frontend      |
                                  | (Fintech Dark UI + Tailwind CSS)  |
                                  +-----------------+-----------------+
                                                    |
                                      HTTP REST / WebSocket (SignalR)
                                                    |
                                  +-----------------v-----------------+
                                  |      ASP.NET Core Web API         |
                                  |  (.NET 9 Controller / Service)    |
                                  +--------+------------------+-------+
                                           |                  |
                           +---------------+                  +---------------+
                           |                                                  |
                [Optimistic Concurrency]                             [Identity & Storage]
                           |                                                  |
          +----------------v------------------+              +----------------v------------------+
          |    SimulationEngine.cs            |              |      Microsoft SQL Server         |
          | - Transactional Acquisitions      |              | (Docker or LocalDB / SSMS 20)     |
          | - Concurrency Token (RowVersion)  |              | - AspNetUsers / Roles / Logins    |
          | - Economic Formula Engine         |              | - Properties (RowVersion token)   |
          | - Atomic Win Condition Adjudication|             | - Loans, MarketEvents, GameSessions|
          | - Dynamic Multi-Room SignalR Hub  |              | - AuditLogs Financial Ledger      |
          +-----------------------------------+              +-----------------------------------+
```

---

## 🚀 Key Features

1. **Decoupled Modern Stack**:
   * **Backend:** ASP.NET Core 9 Web API with strongly-typed controllers, DTOs, SignalR Core Hubs, and dependency-injected simulation engine.
   * **Frontend:** React 18, Vite, TypeScript, Lucide Icons, and custom dark-mode fintech glassmorphism design.

2. **Real-Time Multi-Room Matchmaking (SignalR)**:
   * Dynamic syndicate room creation with isolated game sessions.
   * Concurrency-safe room groups allowing players to play independently in private rooms or head-to-head in competitive rooms.
   * Real-time portfolio synchronization, ready status toggles, and instant victory broadcasts.

3. **High-Fidelity Real Estate Market**:
   * Distinct property catalog with 100% unique architectural photography across 4 districts: *Downtown, Financial, Suburbs, and Industrial*.
   * Dynamic asset classes (*Apartment, House, Commercial, HighRise*) with condition degradation, yield calculations, and renovation mechanics.

4. **Commercial Bank Credit Facility & Macro Economy**:
   * Flexible credit lines, mortgage amortizations, and risk management.
   * Central Bank interest rate fluctuations and macro economic market yield cycles advancing per turn.

5. **Financial Regulatory Audit Ledger**:
   * Every transaction (acquisitions, renovations, loans, rent yields) writes an immutable record to `AuditLogs` in SQL Server with timestamp, actor GUID, cash delta, and post-transaction balance.

6. **Optimistic Concurrency & ACID Integrity**:
   * High-frequency property purchases are protected against race conditions using SQL Server `RowVersion` timestamp tokens and explicit database transactions.

---

## 🛠️ Quick Start

### 1. Prerequisites
* [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
* [Node.js (v18+) & npm](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/) (running Linux containers)

### 2. Start SQL Server Container
```powershell
docker run -d --name metrohunt-sql -p 1433:1433 -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Run Application
```powershell
# In root directory:
.\start.bat
```
* **Client App:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`
* **Swagger API Docs:** `http://localhost:5000/swagger`

---

## 🎮 How to Play

1. **Authentication**: Register a new investor profile or sign in using Google Single Sign-On / email credentials.
2. **Lobby & Matchmaking**: Create or join a Syndicate Room, configure the race target, and toggle Ready.
3. **Acquisitions**: Scout high-yield real estate in the market, inspect condition grades, and expand your portfolio.
4. **Leverage & Yield**: Borrow from the Commercial Bank facility to scale equity; collect rent every economic cycle while managing maintenance costs.
5. **Victory**: Cross the target net worth milestone first to claim victory!
