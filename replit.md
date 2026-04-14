# api-node-b1

## Overview
A Node.js REST API that interfaces with SAP Business One (SAP B1) via its Service Layer (OData-based API). Provides endpoints to manage and query Business Partners ("Clientes").

## Tech Stack
- **Runtime**: Node.js 20 (CommonJS)
- **Framework**: Express 5.x
- **HTTP Client**: Axios (for SAP Service Layer requests)
- **SAP Integration**: SAP B1 Service Layer + `sapb1-connect` library
- **Dev Tools**: nodemon

## Project Structure
- `Server.js` - Entry point, Express app setup, listens on port 3000
- `routes/cliente/` - API route definitions
- `controllers/cliente/` - Request handling and response formatting
- `services/sapService.js` - SAP session auth, cookie management, OData requests
- `scripts/` - Utility scripts (SAP connection testing)
- `docs/` - SAP B1 connectivity documentation
- `config.json` - Static config (SAP_URL, SAP_COMPANY)

## Configuration
- `config.json` contains `SAP_URL` and `SAP_COMPANY`
- Environment variables: `SAP_USER`, `SAP_PASSWORD` for credentials
- Server port: 3000 (configurable via `PORT` env var)

## Running
```bash
npm start      # Production
npm run dev    # Development with auto-reload (nodemon)
```

## API Endpoints
- `GET /` - Health check
- `GET /clientes` - List business partners
- `GET /clientes/codigo/:codigo` - Get business partner by code
