# Metro Hunt

Metro Hunt is a single-player real estate investing simulation. Build a rental portfolio, manage cash and debt, and see how property costs affect your net worth over time. It is designed for learning and reflection: the numbers are simplified examples, not investment advice or a forecast of real returns.

## What you can practice

- Compare a property's asking price with its expected rent and condition.
- Track rent against maintenance and loan payments instead of treating rent as profit.
- Decide how much cash to keep available for repairs and other costs.
- See how borrowing changes both available cash and net worth.
- Review transactions in the audit ledger and watch how choices affect your portfolio.

The simulation is intentionally simplified. It allows for a basic vacancy reserve and routine maintenance, but does not model taxes, insurance, closing costs, changing interest rates, local regulations, or unpredictable major repairs. Use the game to explore basic trade-offs rather than make real financial decisions.

## Technology

- ASP.NET Core 9 Web API
- React, TypeScript, and Vite
- SQL Server with Entity Framework Core
- Tailwind CSS and Lucide icons

## Run locally

Prerequisites: .NET 9 SDK, Node.js with npm, and SQL Server.

1. Start SQL Server and make sure `MetroHunt.Server/appsettings.json` or user secrets has a valid `ConnectionStrings:DefaultConnection` value.
2. From the project root, run:

   ```powershell
   .\start.bat
   ```

3. Open the client at `http://localhost:5173`. The API runs at `http://localhost:5000`; Swagger is available at `http://localhost:5000/swagger` in Development.

The startup script starts the API and client. It does not start SQL Server. If using the included Docker Compose service, start it separately with `docker compose up -d`.

## Start a career

Choose an investor profile name and a net-worth goal, then start the career. Use the marketplace to compare listings, buy a property, and follow rent, upkeep, and debt through each market cycle. Renovations and loans use cash or create liabilities, so check your balance and net worth after each decision.

Use the audit ledger to review what changed and why. A high rent estimate by itself does not guarantee a good investment: purchase price, condition, operating costs, debt, and available reserves all matter.

