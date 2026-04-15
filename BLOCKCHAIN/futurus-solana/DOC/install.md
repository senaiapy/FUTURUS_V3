# #INSTALL FUTANA CLI

Save this seed phrase to recover your new keypair:
water multiply grape fury shrug hotel chuckle soup key release sorry enough
===========================================================================
Config File: /Users/galo/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/galo/.config/solana/id.json
Commitment: confirmed

===========================================================================
GET FUTANA DEVNET TERMINAL

solana balance --url devnet
solana airdrop 2 --url devnet

faucet.solana.com
solfaucet.com

Enter the wallet address: 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ

===========================================================================
solana address
solana config get

Method 1: The No-Code Path (Fastest)

If you aren’t a developer and want your token live in under 5 minutes, use a "Token Creator" platform.

    Connect a Wallet: Use a Solana wallet like Phantom or Solflare. Ensure you have about 0.1 to 0.5 FUT for creation fees and rent.

    Visit a Creator Tool: Popular choices in 2026 include FluxBeam, Orion Tools, or Smithii.

    Enter Details:

        Name: Futurus Coin

        Symbol: FUTUR (or whatever you prefer)

        Decimals: 9 (Standard) or 6 (Common for meme coins).

        Supply: e.g., 1,000,000,000.

        Logo: Upload a square .png or .jpg.

    Revoke Authorities (Optional but Recommended): To build trust, most creators "Revoke Mint Authority" (so no more supply can be created) and "Revoke Freeze Authority" (so you can't lock user funds).

Method 2: The Technical Path (CLI)

If you want full control and the lowest possible fees, use the Solana Command Line Interface.

1. Prerequisites

You need the Solana CLI and the SPL Token CLI installed.
Bash

# Install Solana CLI

sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install SPL Token CLI (requires Rust/Cargo)

cargo install spl-token-cli

2. Create the Token

First, set your network (use devnet for testing first!) and create the "Mint" address.
Bash

# Switch to mainnet for a real launch

solana config set --url https://api.mainnet-beta.solana.com

# Create the token

spl-token create-token

This will output a Mint Address. Copy it; this is the unique ID for Futurus Coin. 3. Initialize Metadata

As of 2025/2026, you can add the name and symbol directly via the CLI:
Bash

spl-token initialize-metadata <MINT_ADDRESS> "Futurus Coin" "FUTUR" "https://your-website.com/metadata.json"

4. Mint the Supply

You need to create a "Token Account" to hold the coins before you can mint them.
Bash

# Create an account to hold the tokens

spl-token create-account <MINT_ADDRESS>

# Mint 1 million tokens

spl-token mint <MINT_ADDRESS> 1000000

Important Considerations for 2026

    Token Extensions (Token-2022): You might consider using the newer Token-2022 standard if you want advanced features like "Transfer Hooks" or "Confidential Transfers."

    Liquidity: Simply creating the token doesn't make it tradable. You will need to go to a DEX like Raydium or Meteora, create a Liquidity Pool (LP), and pair your FUTUR with FUT.

    OpenBook Market: To list on most Solana DEXs, you may need to create an OpenBook Market ID, which costs roughly 0.4 to 2.8 FUT depending on the settings.

Would you like me to help you draft the metadata.json file you'll need for the token's logo and description?

Go to https://solfaucet.com, enter the Solana address '8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ', select 'Devnet', and click the '1 FUT' or 'Airdrop' button

https://faucet.quicknode.com/solana/devnet

++++++++

Frontend/Backend Update: Use the new Mint Address FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave for all FUT transactions.
Toolchain Upgrade (Recommended): To build the Smart Contract, you should upgrade your Solana CLI to 1.18.28 or higher, which includes a newer compiler:

++++++++

Balance
Fsz8f3fNpzpdKe1jE93sTdsaU4mfRm4oMTJY15gdgdj1 | 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ | 1.97578392 FUT

solana program close Fsz8f3fNpzpdKe1jE93sTdsaU4mfRm4oMTJY15gdgdj1 && solana ba
lance

Buffer Address | Authority | Balance
Fsz8f3fNpzpdKe1jE93sTdsaU4mfRm4oMTJY15gdgdj1 | 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ | 1.97578392 FUT

1.99211592 FUT

Updating crates.io index
Finished release [optimized] target(s) in 0.33s  
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: /Users/galo/.config/solana/id.json
Deploying program "futurus_coin"...
Program path: /Users/galo/Desktop/futurus-solana/@futurus-coin/target/deploy/futurus_coin.so...
Program Id: FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb

======================================================================
Achievements
💰 Devnet Funding Recovered & Secured:

I recovered ~2 FUT that was stuck in an orphaned build buffer and successfully returned it to your wallet.
Current Balance: ~2.0 FUT (plenty for many more Devnet deployments).
Wallet: 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ.
🪙 Futurus Coin (FUT) Deployed:

The FUT coin program is now deployed and ready for use.

### ✅ Updates (Feb 23, 2026)

- **New FUT Mint Address:** `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave`
- **Frontend/Backend Updated:** All `.env` files and SDK constants updated to use the new FUT Mint.
- **Smart Contract Updated:** `betting.rs` modified to use FUT tokens instead of FUT for bets and fees.
- **IDL Updated:** Manually synchronized `prediction.json` and `idl.ts` with the new account structure.

### ⚠️ Blockers

- **Build Issue:** Current Solana toolchain (1.75.0) has a version conflict with `wit-bindgen 0.51.0` (requires Rust 2024). Pinned workspace dependencies but some transitive dependency is still pulling the newer version.
  This forces the build system to use older versions compatible with your Rust 1.75 compiler, preventing the "edition 2024" errors that were blocking you.

======================================================================
# build smart contract

cd /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract && ~/.avm/bin/anchor build 2>&1

# balance
solana balance --url devnet --keypair /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract/prediction.json 2>&1

4.569666148 SOL
# recover old buffer balance
solana program close --buffers --url devnet --keypair /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract/prediction.json 2>&1

# deploy smart contract
solana program deploy --url devnet --keypair /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract/target/deploy/prediction.so --program-id prediction.json 2>&1

# OR
cd /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract && ~/.avm/bin/anchor deploy --provider.cluster devnet 2>&1 

Program confirmed on-chain
Idl data length: 3372 bytes                                                                
Step 0/3372 
Step 600/3372                                                                              
Step 1200/3372                                                                             
Step 1800/3372                                                                             
Step 2400/3372                                                                             
Step 3000/3372                                                                             
Idl account C1M2aMuVvCWoBj85ZUFkgCEwiQR45Pb4fAf56Tk68e8a successfully upgraded             
Deploy success

## copy idl
p /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract/target/idl/prediction.json /Users/galo/PROJECTS/futurus-solana/prediction-market-frontend/src/components/prediction_market_sdk/idl/prediction.json 2>&1 && cp /Users/galo/PROJECTS/futurus-solana/prediction-market-smartcontract/target/idl/prediction.json /Users/galo/PROJECTS/futurus-solana/prediction-market-backend/src/prediction_market_sdk/idl/prediction.json 2>&1 && echo "IDL copied successfully"

IDL copied successfully

## show program     
solana program show 6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY --url devnet 2>&1

Program Id: 6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 2oWGJ4CrG2CbEN8XhT899n6Q6AAgp9GTkmkvjjZyoLyB
Authority: 99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1
Last Deployed In Slot: 446251026
Data Length: 505232 (0x7b590) bytes
Balance: 3.5176188 SOL

Program ID	6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY
Network	Devnet
Authority	99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1
Program Size	505,232 bytes
Tx Signature	4wRgJ4Qj7CsAtp11JWFfQYbPcQNyjGDvxfzChxPmiFssMn3hDS85W9PCQ3E5AQxhrBcMQecjGMk21RWMmgfPoZLf
IDL Copied	✅ Frontend + Backend