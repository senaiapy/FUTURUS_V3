# 🏷️ Metadata & Token Creation Instructions (Futurus Coin)

---

This guide provides the exact steps to create the **Futurus Coin (FUT)** with native metadata using the Token-2022 program in your new high-performance ARM64 environment.

## 📋 Token Details

- **Name:** Futurus Coin
- **Symbol:** FUT
- **Supply:** 2,000,000,000
- **Decimals:** 9 (default)
- **Metadata URI:** `https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju`

---

## 🛠️ Step 1: Create the Mint

Run this inside the Docker container (`./enter-docker.sh`):

````bash
# Set network (Change to 'mainnet-beta' for production)
NETWORK=devnet

Run this inside the Docker container (`./run-docker.sh`):

##

## Solana Version

```bash
solana --version
````

## 🔑 Keypair Management

### Create a new Wallet

```bash
solana-keygen new --outfile /root/.config/solana/futurus.json
```

```bash
solana config set --keypair /root/.config/solana/futurus.json

solana address
```

## 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF

### Check Balance

```bash
solana balance --url devnet
```

### Airdrop SOL (Devnet only)

```bash
solana airdrop 2 --url devnet
```

## https://faucet.solana.com/

---

## ################## SEND TOKEN TO WALLET

## SET SENDER

```bash
solana account 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ --url devnet
```

## Public Key: 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ

## Balance: 11.99408772 SOL

## Owner: 11111111111111111111111111111111

## Executable: false

## Rent Epoch: 18446744073709551615

## 🪙 Token Management (SPL Token)

solana config get

## Config File: /Users/galo/.config/solana/cli/config.yml

## RPC URL: https://api.devnet.solana.com

## WebSocket URL: wss://api.devnet.solana.com/ (computed)

## Keypair Path: /Users/galo/.config/solana/id.json

## Commitment: confirmed

solana address

# For Devnet

solana config set --url devnet

# For Mainnet

# solana config set --url mainnet-beta

### Step B: Execute Transfer

```bash
# Format: solana transfer  <SENDER_ADDRESS> <SOL_AMOUNT> <RECIPIENT_ADDRESS> --funded-recipient  --allow-unfunded-recipient

# Format: solana transfer <RECIPIENT_ADDRESS> <SOL_AMOUNT> --allow-unfunded-recipient
solana transfer 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF  1 --allow-unfunded-recipient
```

# Signature: 2moZzQRCxLRY4zDJrBJKRYcseAaTazUupw2fpnBrLfM3hLbH18SB9XjFx1XDNBZXCA1BYq4tqcm3uB6merUp14mE

##

## 🪙 Create Futurus Token (Token-2022)

```bash
# 1. Create the Mint
spl-token create-token --program-2022 --enable-metadata --url devnet
```
## MINNET MINT ADDRESS FaLTtz5ngcFfftA4AZaPVHSpHdzYoh7a36hTMrXEV4ST
## Creating account JswudjXNhfRERynu7pANc4u4qjqLrhAYFuyQnvks92W
## Signature: zsbom5FvihtKPjmSYfnTqUQxtVe6CHNXHvLKYNbvQFkmVZEH1kfq3SgTeQZ1eibD76bac8i2gQ4i8swJHnSSFTJ
## Token: FaLTtz5ngcFfftA4AZaPVHSpHdzYoh7a36hTMrXEV4ST
## Recipient: JswudjXNhfRERynu7pANc4u4qjqLrhAYFuyQnvks92W
## Signature: 49RFFqc5WCqHY283ZcdqWT8W7eR5PkQNZpQPZjJrTWDBqUrVVQce2FMJCJnyS81gm9bPQP494gJVnpJWq16HbGoB
####  MINT
## Minting 2000000000 tokens
## Token: FaLTtz5ngcFfftA4AZaPVHSpHdzYoh7a36hTMrXEV4ST
## Recipient: JswudjXNhfRERynu7pANc4u4qjqLrhAYFuyQnvks92W
## Signature: 49RFFqc5WCqHY283ZcdqWT8W7eR5PkQNZpQPZjJrTWDBqUrVVQce2FMJCJnyS81gm9bPQP494gJVnpJWq16HbGoB
## INITIALIZE METADATA
## Signature: hNZnVyq6rat7qsoN3MHZVQmwp2cKwcf9SiJo3RamsKvVsub633xifiXANidiPYSNCrMbtKs5tdzFxWpU2ZF5K29

## GAS. 0.0001 


## DEVNET
## Address: 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED

## Decimals: 9

## Signature: 9m4iuUqDN2Q7wfX76s3uF24KQUxEJHATfka6koJCF8HnBqT56zEBg8fN7sJWrBnsdHNzNUPdnn7e6mxpYZKWKMB

**Note:** Save the `Address` printed above. It is your **MINT_ADDRESS**.

```bash
# 2. Create your Token Account
spl-token create-account <MINT_ADDRESS> --url devnet

## Creating account CgEeKF8eHN8gLr4c8tZc3KdWGb4Dk3swkyuk4dBCtP4Q

## Signature: 26BAXBgrnFZbwPKXHmryTwwUKmvQDDXHPrCQuGKSfU16fxEgAzvS2z9dgqjnWTfdtH2xafqtqWEpArPiZq4Vf3mt

# 3. Mint Initial Supply (e.g., 2 Billion)
spl-token mint <MINT_ADDRESS> 2000000000 --url devnet


## Minting 2000000000 tokens
## Token: 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED
## Recipient: CgEeKF8eHN8gLr4c8tZc3KdWGb4Dk3swkyuk4dBCtP4Q

## Signature: 3ksq9unZYDKmadsgftgPBFv5ec91ogsrRHyJf7KX6a1ZriV28c7hwuyrQBELHHnaoArfD39LNPwM8ygucbFShKup

# 4. Initialize Metadata
spl-token initialize-metadata <MINT_ADDRESS> "Futurus Coin" "FUT" "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju" --url devnet
```

## Signature: 57Z3edDgEDVJCHt7L2swqwSyrcyXBNNFfRoZzP2JUGNT84MHFBmERyC2KJFZJZ5Crj5CzCJ5d1ewMd9yzkSpcVSm

---

---

## 🛡️ Step 4: Security & Immutability

Once the metadata is set and tokens are minted, revoke authorities to make the token "locked" and trustworthy.

```bash
# 1. Revoke Mint Authority (No more FUT can ever be created)
spl-token authorize $MINT_ADDRESS mint --disable --url $NETWORK

## Updating 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED
#  Current mint: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF
#  New mint: disabled
##Signature: 4s9wSzpHRRX4EC6oJymdNGgw26cvf3ijCQcxnfzEsKkV9oAUaejukD8TcLR2GU9n1wJ1DzWpbiN12yKr5gr2qo3i

# 2. Revoke Freeze Authority (Creator cannot freeze user accounts)
spl-token authorize $MINT_ADDRESS freeze --disable --url $NETWORK
```

## Updating 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED

## Current freeze: disabled

## New freeze: disabled

## Signature: 4s9wSzpHRRX4EC6oJymdNGgw26cvf3ijCQcxnfzEsKkV9oAUaejukD8TcLR2GU9n1wJ1DzWpbiN12yKr5gr2qo3i

---

## ✅ Step 5: Verification

To see the final state of your Futurus Coin:

```bash
# Check Total Supply and Metadata Info
spl-token display $MINT_ADDRESS --url $NETWORK


## SPL Token Mint

## Address: 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED
## Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
## Supply: 2000000000000000000
## Decimals: 9
## Mint authority: (not set)
## Freeze authority: (not set)
## Extensions
## Metadata Pointer:
   Authority: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF
    Metadata address: 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED
## Metadata:
    Update Authority: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF
    Mint: 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED
    Name: Futurus Coin
    Symbol: FUT
    URI: https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju
    
# Check your current wallet's balance for this token
spl-token balance $MINT_ADDRESS --url $NETWORK

## Balance: 2000000000

# Check the raw account data (using the main solana CLI)
solana account-info $MINT_ADDRESS --url $NETWORK


## SPL Token Account
      Address: CgEeKF8eHN8gLr4c8tZc3KdWGb4Dk3swkyuk4dBCtP4Q
  Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  Balance: 2000000000
  Decimals: 9
  Mint: 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED
  Owner: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF
  State: Initialized
  Delegation: (not set)
  Close authority: (not set)
##Extensions:
  Immutable owner
```

---

## ⚠️ Important for Mainnet

When you are ready for the real launch:

1. Ensure your wallet has real **SOL** for fees.
2. Change `NETWORK=devnet` to `NETWORK=mainnet-beta`.
3. Check `solana address` to ensure you are using the correct signing wallet.
https://explorer.solana.com