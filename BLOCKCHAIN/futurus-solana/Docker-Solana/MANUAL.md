# 🏷️ Metadata & Token Creation Instructions (Futurus Coin)
0022007b005c002200690076005c0022003a005c0022005100310032002b0039005700790067002f
004300380044002b007600690058006400730059006100690077003d003d005c0022002c005c0022
0076005c0022003a0031002c005c00220069007400650072005c0022003a00310030003000300030
002c005c0022006b0073005c0022003a003100320038002c005c002200740073005c0022003a0036
0034002c005c0022006d006f00640065005c0022003a005c002200630063006d005c0022002c005c
002200610064006100740061005c0022003a005c0022005c0022002c005c00220063006900700068
00650072005c0022003a005c0022006100650073005c0022002c005c002200730061006c0074005c
0022003a005c00220032002b005400630032005800390064004800690030003d005c0022002c005c
002200630074005c0022003a005c00220032006600420079006a003300640076006c00700076004b
004e004300520066003700660054006c005a003400780056003400480042004300730064004b0035
005800640039006d005400610061004f003500740057003200570061004b00690052005a006f0062
005a00680050004b0061007a004b0054004e00570056007100320063006f006b0033004400510049
007a004a0069005a006400510065006600360036003300690034007700560076004800340043004e
00570054002b0075006e00560078003700520055004f0066006d007a00660049002b005a00630030
0046007700370056003700430070005900650066004c003400650071004d00590067004b00720041
006d006c004a004a007100450046002b00370062003200730068006800550032002b006b007a0050
0036004d00660074003200630052005900440042004f004600490078007500680075002f006a004c
003600750036005400420058005100710032005400670064004c004400750063002f00510075002f
00790065006a00480074004c004c003800440065007600520047004d005100690057005500700039
0076003500720031007300440078004200790031006d00430033006e007900350079005000590067
0077006e002f0064005000780056007a003500380047006d00480057004900580037003400540048
0043006e006c00320047003800530050007700480079005600360074004d00780049006b00730048
00670046004400650050007900390079007200510050006f0037006a003500520055004a0067006e
00320057006b004100450071005800590069004900720062006d0037005100750033004600390078
005300520070004a00640041003d003d005c0022007d0022
---

This guide provides the exact steps to create the **Futurus Coin (FUT)** with native metadata using the Token-2022 program in your new high-performance ARM64 environment.

## 📋 Token Details

- **Name:** Futurus Coin
- **Symbol:** FUT
- **Supply:** 2,000,000,000
- **Decimals:** 9 (default)
- **Metadata URI:** `https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju`

---
solana account JswudjXNhfRERynu7pANc4u4qjqLrhAYFuyQnvks92W --url mainnet-beta

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

solana transfer 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF  1 
--allow-unfunded-recipient

solana transfer 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF  1 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED --funded-recipient --allow-unfunded-recipient

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
spl-token initialize-metadata <MINT_ADDRESS> "Futurus Coin" "FUT" "{metadatos.json}" --url devnet
```


spl-token initialize-metadata FaLTtz5ngcFfftA4AZaPVHSpHdzYoh7a36hTMrXEV4ST "Futurus Coin" "FUT" "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreibhkouqju6oc4tdjvslo3dtfowdzux32fv6wrrp6ymnp7c6defauy" --url devnet
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


# create token

spl-token create-token --program-2022 --enable-metadata --url devnet

## Address:  2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY
## Decimals:  9
## Signature: 5moWGXGiYTCVU1jgUscN8GsxLVUtmMW38aufAJBuFBHk9DTPfmsUE9ZeJr2k6WYwxighZUsPjpZ9ndRmDMFrKUjQ
# create address
# Address:  2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY

spl-token create-account 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY --url devnet

## Creating account 4DB3NUNjrpHnsm9fR18XuTQR4ujz4iZT9RMnchNxhQba
## Signature: wnnLfLzMKWp3XbYCLfh3c3jBz5U3DznnAy8SzQoNfVam5nKP4NGy1RQfvrovW1Zy6bJdjnpRNawCLvuBwestjiU

spl-token mint 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY 2000000000 --url devnet

## Minting 2000000000 tokens
## Token: 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY
## Recipient: 4DB3NUNjrpHnsm9fR18XuTQR4ujz4iZT9RMnchNxhQba
## Signature: 4Q1rYfuT8MLLj5m4uVWAwXj7V9iCaWjLTToJ65YrM6SdiAdipi1poSPFSrbHb9UvhW4GcxmGkgJyLS15YKSCvExe

spl-token initialize-metadata 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY "Futurus Coin" "FUT" "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreibhkouqju6oc4tdjvslo3dtfowdzux32fv6wrrp6ymnp7c6defauy" --url devnet

## Signature: 3zb4ZfXCEiBNvTLp5uuMrv2PbXdNynjezMLd4TRQYGWk7oM9QKVG4Ty6NdehRFPD22kmsAyAxqRzv28cQH2vUfcU
## TO UPDATE METADATA

spl-token update-metadata 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY uri "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreibhkouqju6oc4tdjvslo3dtfowdzux32fv6wrrp6ymnp7c6defauy" --url devnet

## Signature: 3zb4ZfXCEiBNvTLp5uuMrv2PbXdNynjezMLd4TRQYGWk7oM9QKVG4Ty6NdehRFPD22kmsAyAxqRzv28cQH2vUfcU

spl-token balance 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY --url devnet
## 2000000000

solana account 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY --url devnet

##  Public Key: 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY
## Balance: 0.00396024 SOL
## Owner: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
## Executable: false
## Rent Epoch: 18446744073709551615
## Length: 441 (0x1b9) bytes
##  0000:   01 00 00 00  66 90 3e 04  c1 69 67 0e  76 f8 91 83   ....f.>..ig.v...
## 0010:   a1 10 8c c9  1f 0a b9 b6  7d e6 33 22  72 34 58 4e   ........}.3"r4XN
## 0020:   d7 74 03 e0  00 00 c8 4e  67 6d c1 1b  09 01 00 00   .t.....Ngm......
## 0030:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 0040:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 0050:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 0060:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 0070:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 0080:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 0090:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
## 00a0:   00 00 00 00  00 01 12 00  40 00 66 90  3e 04 c1 69   ........@.f.>..i
## 00b0:   67 0e 76 f8  91 83 a1 10  8c c9 1f 0a  b9 b6 7d e6   g.v...........}.
## 00c0:   33 22 72 34  58 4e d7 74  03 e0 12 c9  81 73 ca 63   3"r4XN.t.....s.c
## 00d0:   31 16 e1 b3  e9 ba 71 00  9f 86 18 27  a0 61 f8 c4   1.....q....'.a..
## 00e0:   56 a5 b1 97  81 b2 0b 69  d9 21 13 00  cb 00 66 90   V......i.!....f.
## 00f0:   3e 04 c1 69  67 0e 76 f8  91 83 a1 10  8c c9 1f 0a   >..ig.v.........
## 0100:   b9 b6 7d e6  33 22 72 34  58 4e d7 74  03 e0 12 c9   ..}.3"r4XN.t....
## 0110:   81 73 ca 63  31 16 e1 b3  e9 ba 71 00  9f 86 18 27   .s.c1.....q....'
## 0120:   a0 61 f8 c4  56 a5 b1 97  81 b2 0b 69  d9 21 0c 00   .a..V......i.!..
## 0130:   00 00 46 75  74 75 72 75  73 20 43 6f  69 6e 03 00   ..Futurus Coin..
## 0140:   00 00 46 55  54 6c 00 00  00 68 74 74  70 73 3a 2f   ..FUTl...https:/
## 0150:   2f 70 65 61  63 68 2d 77  6f 72 74 68  79 2d 65 65   /peach-worthy-ee
## 0160:   6c 2d 31 34  34 2e 6d 79  70 69 6e 61  74 61 2e 63   l-144.mypinata.c
## 0170:   6c 6f 75 64  2f 69 70 66  73 2f 62 61  66 6b 72 65   loud/ipfs/bafkre
## 0180:   69 62 68 6b  6f 75 71 6a  75 36 6f 63  34 74 64 6a   ibhkouqju6oc4tdj
## 0190:   76 73 6c 6f  33 64 74 66  6f 77 64 7a  75 78 33 32   vslo3dtfowdzux32
## 01a0:   66 76 36 77  72 72 70 36  79 6d 6e 70  37 63 36 64   fv6wrrp6ymnp7c6d
## 01b0:   65 66 61 75  79 00 00 00  00                         efauy....

spl-token authorize 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY mint --disable --url devnet

## Updating 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY
## Current mint: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF
## New mint: disabled
## Signature: 4V9xcjfcysCDHJwZMduZCRKKBRzDPfAQdRs578Num7tbN1pZRucGsWq9TdQJuagHXbApWt2RegtiBBAVoptmaK9f

pl-token authorize 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY freeze --disable --url devnet
## Updating 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY
## Current freeze: disabled
## New freeze: disabled
## Signature: 4V9xcjfcysCDHJwZMduZCRKKBRzDPfAQdRs578Num7tbN1pZRucGsWq9TdQJuagHXbApWt2RegtiBBAVoptmaK9f




## spl-token create-token --program-2022 --enable-metadata --url mainnet-beta

Creating token H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.
Address:  H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1
Decimals:  9
Signature: bpGaajF5ppJ7RkoN5n6PrbWuGtBZ5c5ZSUWxNJtKcc3XiwGgPEfKEK8gXXu6FFjrANzpWj7f3R5mSpLHBye4VWy

## spl-token create-account H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 --url mainnet-beta

Creating token H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1
Decimals:  9

Signature: bpGaajF5ppJ7RkoN5n6PrbWuGtBZ5c5ZSUWxNJtKcc3XiwGgPEfKEK8gXXu6FFjrANzpWj7f3R5mSpLHBye4VWy

root@4acdc332a99a:/workspace# spl-token create-account H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 --url mainnet-beta
Creating account 8pEp7c5fJVkmoTJSHeEgfMF9qUDTs1rVqYxp1NirLngr

Signature: 4ZbgiNaKfmLb4nsBrUwhBCTYG6NToaJ5MmnSNfR7UKAqArtFSE9Lr5cdP9hVLhAChQH2WgWrgvLszhvkrZTskVVp

## spl-token mint H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 2000000000 --url mainnet-beta  

spl-token mint H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 2000000000 --url mainnet-beta
Minting 2000000000 tokens
  Token: H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1
  Recipient: 8pEp7c5fJVkmoTJSHeEgfMF9qUDTs1rVqYxp1NirLngr

Signature: e8oRHz4fZdm4BVsybRqHk1tHF33ekJjnKMBd3y7ewECdg4hGRxQamfLJy7F7AN2XY7vebnqF5ynBYzmsFBYnsda

## spl-token initialize-metadata H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 "Futurus Coin" "FUT" "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreibhkouqju6oc4tdjvslo3dtfowdzux32fv6wrrp6ymnp7c6defauy" --url mainnet-beta


Signature: 5JQz5xdYtY27qDw8iJFDvnuX3Kq46VLGMvujN2TQf5migBEzfbMGfqyTtQVSsj2YA7gCLgDwDs58xA8tusniazS8

## spl-token authorize H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 mint --disable --url mainnet-beta

Updating H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1
  Current mint: 7uN9vEy1qgb5ebZYYEALabZyaLU4BCEKp2V2jVn84wnF
  New mint: disabled

Signature: KRgd8DEHDk3pimJ1V3y6G9z22wdjf9NLw3fbtJHLfXPD8kX1s59932N3gki2n8SHMvynAQiBG2gee5vSu6RZwBA

## spl-token authorize H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 freeze --disable --url mainnet-beta  

Updating H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1
  Current freeze: disabled
  New freeze: disabled
Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x10", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(UiTransactionError(InstructionError(0, Custom(16)))), logs: Some(["Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [1]", "Program log: Instruction: SetAuthority", "Program log: Error: This token mint cannot freeze accounts", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb consumed 1029 of 1029 compute units", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x10"]), accounts: None, units_consumed: Some(1029), loaded_accounts_data_size: Some(1382880), return_data: None, inner_instructions: None, replacement_blockhash: None, fee: Some(5000), pre_balances: None, post_balances: None, pre_token_balances: None, post_token_balances: None, loaded_addresses: None }) }) })

## spl-token balance H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 --url mainnet-beta

4000000000

## solana account H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 --url mainnet-beta

Public Key: H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1
Balance: 0.00396024 SOL
Owner: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
Executable: false
Rent Epoch: 18446744073709551615
Length: 441 (0x1b9) bytes
0000:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0010:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0020:   00 00 00 00  00 00 90 9d  ce da 82 37  09 01 00 00   ...........7....
0030:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0040:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0050:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0060:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0070:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0080:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0090:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
00a0:   00 00 00 00  00 01 12 00  40 00 66 90  3e 04 c1 69   ........@.f.>..i
00b0:   67 0e 76 f8  91 83 a1 10  8c c9 1f 0a  b9 b6 7d e6   g.v...........}.
00c0:   33 22 72 34  58 4e d7 74  03 e0 ef 35  a2 bc 73 96   3"r4XN.t...5..s.
00d0:   26 43 77 ff  5e a8 cc ee  fe 58 72 1d  7f 09 67 ea   &Cw.^....Xr...g.
00e0:   9a a6 67 93  13 a0 47 04  ba e0 13 00  cb 00 66 90   ..g...G.......f.
00f0:   3e 04 c1 69  67 0e 76 f8  91 83 a1 10  8c c9 1f 0a   >..ig.v.........
0100:   b9 b6 7d e6  33 22 72 34  58 4e d7 74  03 e0 ef 35   ..}.3"r4XN.t...5
0110:   a2 bc 73 96  26 43 77 ff  5e a8 cc ee  fe 58 72 1d   ..s.&Cw.^....Xr.
0120:   7f 09 67 ea  9a a6 67 93  13 a0 47 04  ba e0 0c 00   ..g...g...G.....
0130:   00 00 46 75  74 75 72 75  73 20 43 6f  69 6e 03 00   ..Futurus Coin..
0140:   00 00 46 55  54 6c 00 00  00 68 74 74  70 73 3a 2f   ..FUTl...https:/
0150:   2f 70 65 61  63 68 2d 77  6f 72 74 68  79 2d 65 65   /peach-worthy-ee
0160:   6c 2d 31 34  34 2e 6d 79  70 69 6e 61  74 61 2e 63   l-144.mypinata.c
0170:   6c 6f 75 64  2f 69 70 66  73 2f 62 61  66 6b 72 65   loud/ipfs/bafkre
0180:   69 62 68 6b  6f 75 71 6a  75 36 6f 63  34 74 64 6a   ibhkouqju6oc4tdj
0190:   76 73 6c 6f  33 64 74 66  6f 77 64 7a  75 78 33 32   vslo3dtfowdzux32
01a0:   66 76 36 77  72 72 70 36  79 6d 6e 70  37 63 36 64   fv6wrrp6ymnp7c6d
01b0:   65 66 61 75  79 00 00 00  00                         efauy....

Futurus Coin devnet 1 2GLYyESNUjz3oWExavRaSCkUryE9CA6FG5M2Wm8A1CYY 20000000000
Futurus Coin mainnet-beta 1 FaLTtz5ngcFfftA4AZaPVHSpHdzYoh7a36hTMrXEV4ST 20000000000
Futurus Coin mainnet-beta 2 H6msmyipENhDUwnwE7oSRQeaXbYHMok4nu8WW2D6VBM1 40000000000
Futurus Coin devnet 2 447r6rAmj8bU9esRJxxExRqNeDEpM7Q24yxSmr7PnoED 20000000000

pool AAMID
7DMRC7H873BJzpTDDeiBo6JHQCbGSQB3T6tkahfmBqNp
