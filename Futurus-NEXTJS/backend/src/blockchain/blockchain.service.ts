import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  SOLANA_RPC_URL,
  PREDICTION_ID,
  FUT_MINT,
  FEE_AUTHORITY,
  GLOBAL_SEED,
  MARKET_SEED,
  MINT_SEED_A,
  MINT_SEED_B,
  USER_POSITION_SEED,
  TOKEN_METADATA_PROGRAM_ID,
  DEFAULT_MARKET_CONFIG,
  LAMPORTS_PER_FUT,
} from './sdk/constants';
import idl from './sdk/idl/prediction.json';
import bs58 from 'bs58';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private connection: Connection;
  private program: anchor.Program;
  private globalPDA: PublicKey;
  private feeAuthorityKeypair: Keypair | null = null;

  async onModuleInit() {
    this.initConnection();
  }

  private initConnection() {
    this.connection = new Connection(SOLANA_RPC_URL, { commitment: 'confirmed' });
    this.program = new anchor.Program(idl as anchor.Idl, { connection: this.connection });

    this.globalPDA = PublicKey.findProgramAddressSync(
      [Buffer.from(GLOBAL_SEED)],
      PREDICTION_ID,
    )[0];

    // Load fee authority keypair if available (for server-side signing)
    const feeAuthorityKey = process.env.FEE_AUTHORITY_PRIVATE_KEY;
    if (feeAuthorityKey) {
      try {
        this.feeAuthorityKeypair = Keypair.fromSecretKey(bs58.decode(feeAuthorityKey));
        this.logger.log('Fee authority keypair loaded successfully');
      } catch (e) {
        this.logger.warn('Failed to load fee authority keypair');
      }
    }

    this.logger.log(`Connected to Solana RPC: ${SOLANA_RPC_URL}`);
  }

  getConnection(): Connection {
    return this.connection;
  }

  getProgram(): anchor.Program {
    return this.program;
  }

  getGlobalPDA(): PublicKey {
    return this.globalPDA;
  }

  getFeeAuthorityKeypair(): Keypair | null {
    return this.feeAuthorityKeypair;
  }

  // Derive Market PDA
  deriveMarketPDA(marketId: string): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(MARKET_SEED), Buffer.from(marketId)],
      PREDICTION_ID,
    )[0];
  }

  // Derive Token Mint PDAs
  deriveTokenMints(marketPDA: PublicKey): { tokenA: PublicKey; tokenB: PublicKey } {
    const tokenA = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED_A), marketPDA.toBuffer()],
      PREDICTION_ID,
    )[0];
    const tokenB = PublicKey.findProgramAddressSync(
      [Buffer.from(MINT_SEED_B), marketPDA.toBuffer()],
      PREDICTION_ID,
    )[0];
    return { tokenA, tokenB };
  }

  // Derive User Position PDA
  deriveUserPositionPDA(marketPDA: PublicKey, userPubkey: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POSITION_SEED), marketPDA.toBuffer(), userPubkey.toBuffer()],
      PREDICTION_ID,
    )[0];
  }

  // Get Associated Token Account
  async getAssociatedTokenAccount(owner: PublicKey, mint: PublicKey): Promise<PublicKey> {
    const [ata] = PublicKey.findProgramAddressSync(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    return ata;
  }

  // Fetch on-chain market data
  async fetchMarketInfo(marketPDA: PublicKey): Promise<any | null> {
    try {
      const info = await (this.program.account as any).market.fetch(marketPDA, 'confirmed');
      return info;
    } catch (error) {
      this.logger.warn(`Failed to fetch market info: ${error.message}`);
      return null;
    }
  }

  // Fetch user position
  async fetchUserPosition(marketPDA: PublicKey, userPubkey: PublicKey): Promise<any | null> {
    try {
      const positionPDA = this.deriveUserPositionPDA(marketPDA, userPubkey);
      const info = await (this.program.account as any).userPosition.fetch(positionPDA, 'confirmed');
      return info;
    } catch (error) {
      return null;
    }
  }

  // Get SOL balance
  async getSolBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  // Get FUT token balance
  async getFutBalance(publicKey: PublicKey): Promise<number> {
    try {
      const ata = await this.getAssociatedTokenAccount(publicKey, FUT_MINT);
      const balance = await this.connection.getTokenAccountBalance(ata);
      return Number(balance.value.amount) / LAMPORTS_PER_FUT;
    } catch (error) {
      return 0;
    }
  }

  // Send and confirm transaction
  async sendAndConfirmTx(
    transaction: VersionedTransaction,
    signers: Keypair[],
  ): Promise<string> {
    for (const signer of signers) {
      transaction.sign([signer]);
    }

    const signature = await this.connection.sendTransaction(transaction, {
      skipPreflight: false,
    });

    await this.connection.confirmTransaction(signature, 'finalized');
    return signature;
  }

  // Simulate transaction
  async simulateTransaction(transaction: VersionedTransaction): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.connection.simulateTransaction(transaction);
      if (result.value.err) {
        return { success: false, error: JSON.stringify(result.value.err) };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Build versioned transaction
  async buildVersionedTransaction(
    payer: PublicKey,
    instructions: anchor.web3.TransactionInstruction[],
  ): Promise<VersionedTransaction> {
    const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');

    const messageV0 = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
  }

  // Airdrop SOL (devnet only)
  async airdropSol(publicKey: PublicKey, amount: number = 1): Promise<string> {
    if (process.env.SOLANA_CLUSTER !== 'devnet') {
      throw new Error('Airdrop only available on devnet');
    }

    const signature = await this.connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL,
    );
    await this.connection.confirmTransaction(signature, 'confirmed');
    return signature;
  }
}
