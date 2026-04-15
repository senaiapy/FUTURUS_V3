import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Prediction } from "../target/types/prediction";
import { PublicKey, SystemProgram, Keypair, Transaction, Connection, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  GLOBAL_SEED, PREDICTION_ID, FUT_USDC_FEED, MARKET_SEED, TOKEN_METADATA_PROGRAM_ID,
  tokenAAmount, tokenBAmount, feeAuthority, METADATA_SEED, MINT_SEED_A, MINT_SEED_B,
  USER_POSITION_SEED,
} from "./const";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getOrCreateATAInstruction, getAssociatedTokenAccount } from "./utils";
import BN from "bn.js";

let owner: Keypair;
let tokenA: PublicKey;
let tokenB: PublicKey;
let provider: anchor.AnchorProvider;
let market: PublicKey;
const marketId = "test_market_1";
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

describe("prediction", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  owner = anchor.Wallet.local().payer;
  provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.Prediction as Program<Prediction>;

  before(async () => {
    // Derive market PDA using market_id string
    market = PublicKey.findProgramAddressSync(
      [Buffer.from(MARKET_SEED), Buffer.from(marketId)],
      PREDICTION_ID
    )[0];

    tokenA = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED_A), market.toBuffer()],
      PREDICTION_ID
    )[0];
    tokenB = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED_B), market.toBuffer()],
      PREDICTION_ID
    )[0];

    console.log("market ====>", market.toBase58());
    console.log("tokenA ====>", tokenA.toBase58());
    console.log("tokenB ====>", tokenB.toBase58());

    // Event listeners
    program.addEventListener("OracleResUpdated", (event, slot, signature) => {
      console.log("👻 OracleResUpdated 👻", Number(event.oracleRes));
    });

    program.addEventListener("GlobalInitialized", (event, slot, signature) => {
      console.log("👻 GlobalInitialized 👻", event);
    });

    program.addEventListener("MarketCreated", (event, slot, signature) => {
      console.log("👻 MarketCreated 👻", event);
    });

    program.addEventListener("BettingEvent", (event, slot, signature) => {
      console.log("👻 BettingEvent 👻", event);
    });

    program.addEventListener("MarketResolved", (event, slot, signature) => {
      console.log("👻 MarketResolved 👻", event);
    });

    program.addEventListener("WinningsClaimed", (event, slot, signature) => {
      console.log("👻 WinningsClaimed 👻", event);
    });

    program.addEventListener("PositionCreated", (event, slot, signature) => {
      console.log("👻 PositionCreated 👻", event);
    });
  });

  // ─── 1. Initialize Global State ──────────────────────────────────────
  it("Initializes global state", async () => {
    const global = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID
    )[0];
    console.log("global ====>", global.toBase58());

    const tx = await program.methods
      .initialize({
        feeAuthority: feeAuthority,
        creatorFeeAmount: new BN(0.001 * 10 ** 9),
        marketCount: new BN(0.1 * 10 ** 9),
        decimal: 9,
        bettingFeePercentage: 2.0,
        fundFeePercentage: 1.0,
      })
      .accounts({
        global,
        payer: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("🤖 Initialize tx:", tx);
    const globalAccount = await program.account.global.fetch(global);
    console.log("🎫 Global Account:", globalAccount);
  });

  // ─── 2. Create Market ────────────────────────────────────────────────
  it("Creates a prediction market", async () => {
    const global = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID
    )[0];

    const pdaTokenAAccount = await getAssociatedTokenAccount(market, tokenA);
    const pdaTokenBAccount = await getAssociatedTokenAccount(market, tokenB);

    const metadata_a = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenA.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
    const metadata_b = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenB.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    )[0];

    // Resolution date: 1 hour from now
    const resolutionDate = Math.floor(Date.now() / 1000) + 3600;

    // Create market tx
    const tx = await program.methods
      .initMarket({
        quest: new BN(190),
        value: 190.0,
        range: 2, // "below" — Yes wins if oracle < value
        date: new BN(resolutionDate),
        tokenAmount: new BN(tokenAAmount),
        tokenPrice: new BN(0.00005 * 10 ** 9),
        marketId: marketId,
        nameA: "FUT-YES",
        nameB: "FUT-NO",
        symbolA: "FYES",
        symbolB: "FNO",
        urlA: "https://futurus.app/yes",
        urlB: "https://futurus.app/no",
      })
      .accounts({
        user: owner.publicKey,
        feeAuthority: feeAuthority,
        market,
        globalPda: global,
        feed: new PublicKey("5mXfTYitRFsWPhdJfp2fc8N6hK8cw6NB5jAYpronQasj"),
        metadataA: metadata_a,
        metadataB: metadata_b,
        tokenMintA: tokenA,
        tokenMintB: tokenB,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    // Mint tokens tx
    const mintTx = await program.methods
      .mintToken(marketId)
      .accounts({
        pdaTokenAAccount,
        pdaTokenBAccount,
        user: owner.publicKey,
        feeAuthority: feeAuthority,
        market,
        global,
        metadataA: metadata_a,
        metadataB: metadata_b,
        tokenMintA: tokenA,
        tokenMintB: tokenB,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const createTx = new Transaction();
    createTx.add(tx);
    createTx.add(mintTx);
    createTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    createTx.feePayer = owner.publicKey;

    const sim = await connection.simulateTransaction(createTx);
    console.log("🎫 Create market sim:", sim);

    const sig = await connection.sendTransaction(createTx, [owner], { skipPreflight: true });
    await connection.confirmTransaction(sig, "confirmed");
    console.log("🤖 Create market tx:", sig);
  });

  // ─── 3. Deposit Liquidity ────────────────────────────────────────────
  it("Deposits liquidity to activate market", async () => {
    const global = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID
    )[0];

    const tx = await program.methods
      .addLiquidity(new BN(0.1 * 10 ** 9))
      .accounts({
        user: owner.publicKey,
        feeAuthority: feeAuthority,
        market,
        global,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const depositTx = new Transaction();
    depositTx.add(tx);
    depositTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    depositTx.feePayer = owner.publicKey;

    const sim = await connection.simulateTransaction(depositTx);
    console.log("🎫 Deposit liquidity sim:", sim);

    const sig = await connection.sendTransaction(depositTx, [owner], { skipPreflight: true });
    await connection.confirmTransaction(sig, "confirmed");
    console.log("🤖 Deposit liquidity tx:", sig);
  });

  // ─── 4. Place a Bet (Buy Yes Tokens) ────────────────────────────────
  it("Places a bet (buys Yes tokens)", async () => {
    const global = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID
    )[0];

    const pdaTokenAAccount = await getAssociatedTokenAccount(market, tokenA);
    const [userTokenAAccount, createAtaIx] = await getOrCreateATAInstruction(
      tokenA, owner.publicKey, connection
    );

    // Derive user position PDA
    const userPosition = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POSITION_SEED), market.toBuffer(), owner.publicKey.toBuffer()],
      PREDICTION_ID
    )[0];

    const tx = await program.methods
      .createBet({
        marketId: marketId,
        amount: new BN(10000),
        isYes: true,
      })
      .accounts({
        user: owner.publicKey,
        creator: owner.publicKey,
        tokenMint: tokenA,
        pdaTokenAccount: pdaTokenAAccount,
        userTokenAccount: userTokenAAccount,
        feeAuthority: feeAuthority,
        market,
        global,
        userPosition,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const betTx = new Transaction();
    if (createAtaIx) betTx.add(createAtaIx);
    betTx.add(tx);
    betTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    betTx.feePayer = owner.publicKey;

    const sim = await connection.simulateTransaction(betTx);
    console.log("🎫 Betting sim:", sim);

    const sig = await connection.sendTransaction(betTx, [owner], { skipPreflight: true });
    await connection.confirmTransaction(sig, "confirmed");
    console.log("🤖 Betting tx:", sig);

    // Verify user position was created
    const positionAccount = await program.account.userPosition.fetch(userPosition);
    console.log("🎫 User Position:", positionAccount);
  });

  // ─── 5. Admin Close Market (Manual Resolution) ──────────────────────
  it("Admin closes market (manual resolution)", async () => {
    const global = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID
    )[0];

    const tx = await program.methods
      .adminCloseMarket(marketId, true) // Yes wins
      .accounts({
        user: owner.publicKey,
        market,
        global,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("🤖 Admin close market tx:", tx);

    // Verify market is now finished
    const marketAccount = await program.account.market.fetch(market);
    console.log("🎫 Market status:", marketAccount.marketStatus);
    console.log("🎫 Market result:", marketAccount.result);
  });

  // ─── 6. Claim Winnings ──────────────────────────────────────────────
  it("Claims winnings after market resolution", async () => {
    const global = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID
    )[0];

    // Derive user position PDA
    const userPosition = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POSITION_SEED), market.toBuffer(), owner.publicKey.toBuffer()],
      PREDICTION_ID
    )[0];

    // Market result is true (Yes wins), so winning token is tokenA
    const marketAccount = await program.account.market.fetch(market);
    const winningTokenMint = marketAccount.result ? tokenA : tokenB;
    
    const [userWinningTokenAccount] = await getOrCreateATAInstruction(
      winningTokenMint, owner.publicKey, connection
    );

    const tx = await program.methods
      .claim(marketId)
      .accounts({
        user: owner.publicKey,
        market,
        global,
        userPosition,
        winningTokenMint,
        userWinningTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("🤖 Claim winnings tx:", tx);

    // Verify position is claimed
    const positionAccount = await program.account.userPosition.fetch(userPosition);
    console.log("🎫 Position claimed:", positionAccount.claimed);
  });

  // ─── 7. Oracle Resolution (requires live oracle) ────────────────────
  it("Resolves market via oracle", async () => {
    // NOTE: This test requires a live Switchboard oracle feed
    // Skip if not running against devnet with active feeds
    console.log("⚠️  Oracle resolution test requires live Switchboard feed");
    console.log("⚠️  Use resolve_market instruction in production with active oracle");
    
    // Example (uncomment for live testing):
    // const global = PublicKey.findProgramAddressSync(
    //   [Buffer.from(GLOBAL_SEED)],
    //   PREDICTION_ID
    // )[0];
    //
    // const tx = await program.methods
    //   .resolve()
    //   .accounts({
    //     user: owner.publicKey,
    //     market,
    //     global,
    //     feed: new PublicKey("5mXfTYitRFsWPhdJfp2fc8N6hK8cw6NB5jAYpronQasj"),
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .signers([owner])
    //   .rpc();
    //
    // console.log("🤖 Resolve market tx:", tx);
  });
});
