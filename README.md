# Metro Hunt

Metro Hunt is a single-player real estate investment tycoon simulation. Build a rental portfolio, manage cash and credit, renovate properties, and navigate macro market cycles to grow your net worth.

---

## Prerequisites (New Device Setup)

To run Metro Hunt on any machine, ensure the following are installed:
1. **[.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)**
2. **[Node.js (v18+)](https://nodejs.org/)** with npm
3. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (recommended for SQL Server) or a local SQL Server instance

---

## Quick Start on a New Device

### 1. Clone the Repository
```bash
git clone https://github.com/Davide-glitch/MetroHunt.git
cd MetroHunt
```

### 2. One-Click Setup (Windows)
```powershell
.\setup.bat
```
*`setup.bat` checks .NET and Node.js prerequisites, spins up the SQL Server Docker container, and installs all backend and frontend dependencies automatically.*

### 3. Launch the Project

**On Windows:**
```powershell
.\start.bat
```
*`start.bat` launches both the ASP.NET Core API server and the React frontend.*

**Manual / Cross-Platform:**
- **Terminal 1 (Backend API):**
  ```bash
  cd MetroHunt.Server
  dotnet run --urls http://localhost:5000
  ```
- **Terminal 2 (Frontend Client):**
  ```bash
  cd client
  npm install
  npm run dev
  ```

### 4. Open the App
- **Game UI**: [http://localhost:5173](http://localhost:5173)
- **API Swagger**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

---

## How to Play

1. **Enter Your Investor Name**: Enter any investor profile name and select your target net-worth goal ($2M sprint, $10M standard, or $100M marathon).
2. **Acquire Properties**: Evaluate listings by district, price, rent yield, and condition. Keep reserves available for unforeseen expenses.
3. **Renovate Holdings**: Restore depreciated properties to boost occupancy, rental cashflow, and asset valuation.
4. **Credit Facility**: Take strategic commercial bank loans to acquire high-yield assets, keeping interest payments below recurring rent.
5. **Work Brokerage Deals**: Close client deals for immediate commission injections.
6. **Market Cycles**: Advance the macroeconomic cycle manually or let the auto-timer cycle through turns.
7. **Session Navigation**:
   - **`Leave`**: Return to the Career Lobby to review goals without losing portfolio progress.
   - **`Abandon`**: Forfeit holdings back to the market, clear debt, and reset reserves back to $100,000.

---

## Tech Stack

- **Backend**: ASP.NET Core 9 Web API, Entity Framework Core, SQL Server
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Database**: Microsoft SQL Server 2022
