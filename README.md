# Metro Hunt: Full-Stack Real-Time Real Estate Tycoon Simulation

[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-cyan.svg)](https://tailwindcss.com/)
[![SignalR](https://img.shields.io/badge/SignalR-WebSockets-orange.svg)](https://dotnet.microsoft.com/apps/aspnet/signalr)
[![SQL Server](https://img.shields.io/badge/Database-SQL_Server_2022-red.svg)](https://www.microsoft.com/sql-server)

Metro Hunt is an enterprise-grade, real-time multiplayer real estate tycoon simulation built for university Web Application Design (WAD) evaluation. It features an explicit finite state machine where investors compete in a live financial sprint to reach a targeted Net Worth ($100M standard, with configurable sprint thresholds).

---

## Architecture Overview

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
              +-----------------------------------+              +-----------------------------------+
```

---

## Key Features & Enterprise Criteria

1. **Decoupled Architecture (MVC / SPA):**
   * **Backend:** ASP.NET Core Web API with strongly-typed controllers, DTOs, and dependency-injected simulation engine.
   * **Frontend:** Decoupled React + Vite + TypeScript application styled with custom dark-mode fintech tokens.
2. **Relational Database & ORM:**
   * Microsoft SQL Server (`Microsoft.EntityFrameworkCore.SqlServer`) running in Docker or SSMS 20.
   * Decimal precisions (`(18,2)` for financial assets, `(5,4)` for interest/tax multipliers) configured in `MetroHuntDbContext`.
3. **Optimistic Concurrency Control:**
   * High-stakes multiplayer real estate markets suffer from race conditions when two players attempt to buy the same building at the same millisecond.
   * Handled using `[Timestamp] byte[] RowVersion` column and catching `DbUpdateConcurrencyException` inside explicit transactions (`BeginTransactionAsync`).
4. **Security & Identity:**
   * ASP.NET Core Identity with password hashing, secure token generation, and multi-provider architecture (Google OAuth + standard local email fallback).
5. **Real-Time Multiplayer Network (SignalR):**
   * WebSockets hub at `/hubs/game` broadcasting:
     * `VictoryAchieved` (atomic win adjudication locking opponent's screen)
     * `RaceProgressUpdated` (live dual-player progress bar telemetry)
     * `PropertyPurchased` (instant UI status lock without page refresh)
     * `TurnAdvanced` & `MarketEventTriggered` (macroeconomic shifts)
6. **Procedural Economic Simulation:**
   * Ported mathematical formulas from legacy tycoon engines:
     * District yield multipliers (Downtown: $1.4\times$, Financial: $1.6\times$, Suburbs: $1.0\times$, Industrial: $0.8\times$).
     * Maintenance decay (0.5%–1.0% per turn; unpaid maintenance penalizes safety and rent).
     * 24-turn amortized commercial credit facility (6.5% APR).

---

## Quick Start Guide

### 1. Prerequisites
* [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
* [Node.js (v18+) & npm](https://nodejs.org/)
* [Docker Desktop](https://www.docker.com/) (or local SQL Server)

### 2. Start SQL Server Container
```powershell
docker run -d --name metrohunt-sql -p 1433:1433 -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Launch Metro Hunt (One-Click)
```powershell
.\start.bat
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`
* **Swagger Documentation:** `http://localhost:5000/swagger`

---

## Live Multiplayer Race Demonstration

To demonstrate real-time multiplayer functionality to evaluators:
1. Open **Google Chrome** on the left half of the monitor:
   * Navigate to `http://localhost:5173`.
   * Click **Sign In** $\to$ select **Investor 1 (Left Window)**.
2. Open **Microsoft Edge or Incognito** on the right half:
   * Navigate to `http://localhost:5173`.
   * Click **Sign In** $\to$ select **Investor 2 (Right Window)**.
3. Both windows reflect live dual-player telemetry on the **Race Tracker** bar.
4. Select **$2M (Sprint)** for a quick evaluation demo. Acquire assets, borrow commercial capital via **Credit Facility**, and click **Advance Turn**.
5. Once an investor crosses the threshold, the server broadcasts `VictoryAchieved`, instantly freezing the opponent's view and displaying the victory screen.
