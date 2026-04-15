# Prediction Market Solana - Manual

This guide provides instructions on how to set up, start, and test the Prediction Market project using Docker.

## 📋 Requirements

- Docker and Docker Compose
- (Optional) Solana CLI & Anchor (if you want to build/deploy smart contracts from host)

## 🚀 Quick Start

1. **Initialize Environment**:
   Run the setup script to create `.env` files and prepare the environment.

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Start All Services**:
   The setup script already starts the services, but you can manually restart them with:

   ```bash
   docker-compose up -d
   ```

3. **Verify running services**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend**: [http://localhost:8082](http://localhost:8082)
   - **Solana Localnet**: [http://localhost:8899](http://localhost:8899)

---

## 🏗️ Smart Contract Deployment & Registration

### 1. Registering the Program

The backend automatically attempts to initialize the global state of the program on startup. If you see "Global is successfuly initialized" in the backend logs, you are good to go.

To check backend logs:

```bash
docker-compose logs -f backend
```

### 2. Deploying to Localnet (Optional)

If you modify the smart contract, you need to redeploy it.

1. **Build and Deploy**:

   ```bash
   cd prediction-market-smartcontract
   anchor build
   anchor deploy --provider.cluster localnet
   ```

2. **Update Program ID**:
   If the program ID changes, update it in:
   - `prediction-market-smartcontract/programs/prediction/src/lib.rs`
   - `prediction-market-smartcontract/Anchor.toml`
   - `prediction-market-backend/src/prediction_market_sdk/constants.ts` (if applicable)

---

## 🧪 Testing & Debugging

### Deployment Mode Testing

To run in "deploy mode" (simulating production but locally):
The `docker-compose.yml` is already configured for this.

### Common Tasks

- **Check MongoDB**: Accessible at `mongodb://localhost:27017`
- **Reset Everything**:
  ```bash
  docker-compose down -v
  rm -rf mongodb_data
  ```

## 🛠️ Configuration Details

### Backend (.env)

- `PORT`: Server port internally (default 8080, mapped to 8082 on host)
- `DB_URL`: MongoDB connection string
- `FUTANA_RPC_URL`: URL for Solana validator (internal Docker URL: http://solana-validator:8899)
- `FUTANA_CLUSTER`: devnet / mainnet-beta (Backend uses this for config)

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_FUTANA_RPC_URL`: Solana RPC URL
