## 🚀 Getting Started

### 1. Start the Environment

Run this command from the `Docker-Solana` folder:

```bash
./run-docker.sh
```

_(Alternatively: `docker compose -f docker-compose.solana.yml up -d --build`)_

### 2. Enter the Container

```bash
./enter-docker.sh
```

_(Alternatively: `docker exec -it solana-tooling bash`)_

---

## Solana Version

```bash
solana --version
```

## 🔑 Keypair Management

### Create a new Wallet

```bash
solana-keygen new --outfile /root/.config/solana/futurus.json
```

# peace company laugh scorpion border trouble outside gap add treat type patrol

=================================================================================

# pubkey: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF

=================================================================================

# Save this seed phrase and your BIP39 passphrase to recover your new keypair:

# lake party together crunch coast blade scrap prevent member tower example predict

=================================================================================

### Create a new Wallet BOSS

# ```bash

# solana-keygen new --outfile /root/.config/solana/mnt2.json

# ```

## Set the keypair and check the address

# ```bash

# solana config set --keypair id.json

#

# solana address

# ```

## Wrote new keypair to /root/.config/solana/mnt2.json

===========================================================================

# pubkey: DWgVKANCvWxoGY7sM3pJeYWCo1Eg4mzppiWgnCS6i4Ji

===========================================================================

# Save this seed phrase and your BIP39 passphrase to recover your new keypair:

# analyst act maze crime injury liar marble size reject glory current curious

===========================================================================

```bash
solana config set --keypair ~/.config/solana/futurus.json

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
# Format: solana transfer <RECIPIENT_ADDRESS> <SOL_AMOUNT> --allow-unfunded-recipient
solana transfer 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF  1 --allow-unfunded-recipient
```

# Signature: 2moZzQRCxLRY4zDJrBJKRYcseAaTazUupw2fpnBrLfM3hLbH18SB9XjFx1XDNBZXCA1BYq4tqcm3uB6merUp14mE

## 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ

spl-token --program-2022 create-token --enable-metadata --url devnet

## To initialize metadata inside the mint, please run `spl-token initialize-metadata EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

## Address: EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Decimals: 9

## Signature: 5GLyyj7aW8GLffxLKamruWfFaP9B7UK1LLMkieRHD3xLYWnieuLPU9fu94vUfrEcRiVanHEXQmz3wutZRwhu4s8s

spl-token create-account EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj --url devnet

## Creating account 4pmZQkvXdLCr5AR8bEiKgmyLZA7HLbmErxDKa2GhVhCq

## Signature: 2yAxM1qftHqwMQMKTtvmn4PUxnooNjULXZ9g3t2Lmc7ruNstPgtFWaadLC41oAEuQeDxLWG7RsG73HEPEgm1vkbz

spl-token mint EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj 2000000000 --url devnet

## Minting 2000000000 tokens

## Token: EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Recipient: 4pmZQkvXdLCr5AR8bEiKgmyLZA7HLbmErxDKa2GhVhCq

## Signature: vNoGv5s6imyb5JyMNbSvdicopqUqn8NoMczPM4QwTwLTHJVX22GUfeL63ENqoh49KTdaXNeriY3NsGY3AtjPsyV

spl-token initialize-metadata EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj "Futurus Coin" "FUT" "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju" --url devnet

## Signature: 2pt1AP97ptxQC3w42R3odkxDbKkt1zqhFyLaC12DAUGV7n9xZcRAFoEUgwZWYAtmE1xohiavp67AxgTjfBFdwbKy

spl-token authorize EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj mint --disable --url devnet

## Updating EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Current mint: 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ

## New mint: disabled

## Signature: 4BCGTFUC9UMTZP3SkLnktMUwM7NGuJz8JgNA6eYxVis3Xejv22hJUvBuSBdKbJcFkqDaiJGi1rGj8Q2J9UF8hz4h

spl-token authorize EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj freeze --disable --url devnet

## Updating EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Current freeze: disabled

## New freeze: disabled

## Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x10", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(InstructionError(0, Custom(16))), logs: Some(["Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [1]", "Program log: Instruction: SetAuthority", "Program log: Error: This token mint cannot freeze accounts", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb consumed 1029 of 1029 compute units", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x10"]), accounts: None, units_consumed: Some(1029), loaded_accounts_data_size: Some(711872), return_data: None, inner_instructions: None, replacement_blockhash: None }) }) })

solana account EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj --url devnet

## Public Key: EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Balance: 0.00396024 SOL

## Owner: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

## Executable: false

## Rent Epoch: 18446744073709551615

## Length: 441 (0x1b9) bytes

## 0000: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0010: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0020: 00 00 00 00 00 00 c8 4e 67 6d c1 1b 09 01 00 00 .......Ngm......

## 0030: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0040: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0050: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0060: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0070: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0080: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 0090: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ................

## 00a0: 00 00 00 00 00 01 12 00 40 00 75 ef 6c 22 71 bb ........@.u.l"q.

## 00b0: 56 3b 4f e5 0e 0e 6e 67 43 87 48 6e a1 da c6 19 V;O...ngC.Hn....

## 00c0: 7c 58 77 52 ef 4a d2 f9 47 bb c6 cc 9e db f8 bb |XwR.J..G.......

## 00d0: 55 41 87 b6 41 ab fb 5b b8 65 60 6d e9 3a fe 83 UA..A..[.e`m.:..

## 00e0: f4 2f fa 1d bc 3f 8b 66 78 ca 13 00 cb 00 75 ef ./...?.fx.....u.

## 00f0: 6c 22 71 bb 56 3b 4f e5 0e 0e 6e 67 43 87 48 6e l"q.V;O...ngC.Hn

## 0100: a1 da c6 19 7c 58 77 52 ef 4a d2 f9 47 bb c6 cc ....|XwR.J..G...

## 0110: 9e db f8 bb 55 41 87 b6 41 ab fb 5b b8 65 60 6d ....UA..A..[.e`m

## 0120: e9 3a fe 83 f4 2f fa 1d bc 3f 8b 66 78 ca 0c 00 .:.../...?.fx...

## 0130: 00 00 46 75 74 75 72 75 73 20 43 6f 69 6e 03 00 ..Futurus Coin..

## 0140: 00 00 46 55 54 6c 00 00 00 68 74 74 70 73 3a 2f ..FUTl...https:/

## 0150: 2f 70 65 61 63 68 2d 77 6f 72 74 68 79 2d 65 65 /peach-worthy-ee

## 0160: 6c 2d 31 34 34 2e 6d 79 70 69 6e 61 74 61 2e 63 l-144.mypinata.c

## 0170: 6c 6f 75 64 2f 69 70 66 73 2f 62 61 66 6b 72 65 loud/ipfs/bafkre

## 0180: 69 66 71 74 7a 36 70 6d 33 68 78 32 6d 61 75 32 ifqtz6pm3hx2mau2

## 0190: 63 36 36 61 71 6f 6a 7a 77 37 62 6b 67 77 6c 73 c66aqojzw7bkgwls

## 01a0: 63 75 70 37 63 71 71 63 73 36 32 7a 69 7a 32 65 cup7cqqcs62ziz2e

## 01b0: 78 6f 72 6a 75 00 00 00 00 xorju....

spl-token display EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj --url devnet

## SPL Token Mint

## Address: EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Program: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

## Supply: 2000000000000000000

## Decimals: 9

## Mint authority: (not set)

## Freeze authority: (not set)

## Extensions

## Metadata Pointer:

## Authority: 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ

## Metadata address: EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Metadata:

## Update Authority: 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ

## Mint: EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj

## Name: Futurus Coin

## Symbol: FUT

## URI: https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju
