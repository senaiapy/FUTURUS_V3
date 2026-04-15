import web3, { PublicKey, TransactionMessage, AddressLookupTableProgram, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PullFeed, getDefaultDevnetQueue, asV0Tx } from "@switchboard-xyz/on-demand";
import { CrossbarClient } from "@switchboard-xyz/common";
import { auth } from "../config";
import {
  PREDICTION_ID,
  GLOBAL_SEED,
} from "./constants";
import { GlobalSettingType, WithdrawType, OracleType, FeedUpdateType } from "../type";
import { VersionedTransaction } from "@solana/web3.js";

import IDL_JSON from "./idl/prediction.json";
import { BN } from 'bn.js';

let futConnection: web3.Connection;
let provider: anchor.Provider;
let program: anchor.Program;
let globalPDA: PublicKey;
let feeAuthority: string;

export const setClusterConfig = async (cluster: web3.Cluster, rpc?: string) => {
  if (!rpc) {
    futConnection = new web3.Connection(web3.clusterApiUrl(cluster));
  } else {
    futConnection = new web3.Connection(rpc);
  }

  // Configure the client to use the local cluster.
  anchor.setProvider(
    new anchor.AnchorProvider(futConnection, auth, {
      skipPreflight: true,
      commitment: "confirmed",
    })
  );

  provider = anchor.getProvider();
  // Generate the program client from IDL.
  
  program = new anchor.Program(IDL_JSON as anchor.Idl, provider);
  feeAuthority = process.env.FEE_AUTHORITY || auth.publicKey.toBase58();
  
  globalPDA = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_SEED)], 
    PREDICTION_ID
  )[0];
};

export const global = async (param: GlobalSettingType) => {
  try {
    const globalInfo = await futConnection.getAccountInfo(globalPDA);
    
    if (globalInfo) {
      return {
        new: false,
        globalPDA
      }
    }

    const tx = await program.methods
      .initialize({
        feeAuthority: new PublicKey(feeAuthority),
        creatorFeeAmount: new BN(param.creatorFeeAmount),
        marketCount: new BN(param.marketCount),
        decimal: param.decimal,
        fundFeePercentage: param.fundFeePercentage,
        bettingFeePercentage: param.bettingFeePercentage,
      })
      .accounts({
        global: globalPDA,
        payer: auth.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .instruction();
    const creatTx = new web3.Transaction();
    creatTx.add(tx);
    creatTx.recentBlockhash = (
      await futConnection.getLatestBlockhash()
    ).blockhash;
    creatTx.feePayer = auth.publicKey;
    const preInxSim = await futConnection.simulateTransaction(creatTx);
    console.log("🎫init global preInxSim 🎫", preInxSim);
  
    const sig = await futConnection.sendTransaction(creatTx, [auth.payer], {
      skipPreflight: true,
    });
  
    const confirm = await futConnection.confirmTransaction(sig, "confirmed");
    console.log("🤖init global setting tx 🤖", sig);

    const globalsettings = await (program.account as any).global.fetch(globalPDA, "confirmed")
    console.log(globalsettings, feeAuthority);
    return {
      new: true,
      globalPDA
    };
  } catch (error) {
    console.log("😒 error:", error);
    return null
  }
};

export const withdraw = async (params: WithdrawType) => {
  const withdrawInstruction = await program.methods.withdraw(new BN(10000)).accounts({
    user: params.signer,
    reciever: params.reciever, 
    global: globalPDA,
    market: params.market_id,
  }).instruction();

  return withdrawInstruction
}

export const claimFee = async (address: String, amount: number) =>{
  try {
    const claimPubkey = new PublicKey(address);
    const transferIx = SystemProgram.transfer({
      fromPubkey: auth.publicKey,
      toPubkey: claimPubkey,
      lamports: Math.floor(amount),
    })

    let latestBlockHash = await provider.connection.getLatestBlockhash(
      provider.connection.commitment
    );

    const lutMsg1 = new TransactionMessage({
      payerKey: auth.publicKey,
      recentBlockhash: latestBlockHash.blockhash,
      instructions: [transferIx]
    }).compileToV0Message();

    const lutVTx1 = new VersionedTransaction(lutMsg1);
    lutVTx1.sign([auth.payer]);
  
    const lutId1 = await provider.connection.sendTransaction(lutVTx1);
    console.log("send fut tx:", lutId1);
    
    const lutConfirm1 = await provider.connection.confirmTransaction(lutId1, 'finalized');
    console.log("send fut confirm:", lutConfirm1);
  } catch (error) {
    
  }
}

export const buildVT = async (list: TransactionInstruction[]) => {
  const result: TransactionInstruction[][] = [];

  for (let i = 0; i < list.length; i += 20) {
    result.push(list.slice(i, i + 20));
  }
   
  for (let index = 0; index < result.length; index++) {
    const chunk = result[index];
    
    let latestBlockHash = await provider.connection.getLatestBlockhash(
      provider.connection.commitment
    );
  
    const addressesMain: PublicKey[] = [];
    chunk.forEach((ixn) => {
      ixn.keys.forEach((key) => {
        addressesMain.push(key.pubkey);
      });
    });
    
    ///////////////////////////////////Lookup table building//////////////////////////////////////
    const slot = await provider.connection.getSlot()
  
    const [lookupTableInst, lookupTableAddress] =
        AddressLookupTableProgram.createLookupTable({
            authority: auth.publicKey,
            payer: auth.publicKey,
            recentSlot: slot - 200,
        });
  
    const addAddressesInstruction1 = AddressLookupTableProgram.extendLookupTable({
      payer: auth.publicKey,
      authority: auth.publicKey,
      lookupTable: lookupTableAddress,
      addresses: addressesMain.slice(0, 30)
    });
  
    latestBlockHash = await provider.connection.getLatestBlockhash(
      provider.connection.commitment,
    );
  
    const lutMsg1 = new TransactionMessage({
      payerKey: auth.publicKey,
      recentBlockhash: latestBlockHash.blockhash,
      instructions: [lookupTableInst, addAddressesInstruction1]
    }).compileToV0Message();
  
    const lutVTx1 = new VersionedTransaction(lutMsg1);
    lutVTx1.sign([auth.payer]);
  
    const lutId1 = await provider.connection.sendTransaction(lutVTx1);
    const lutConfirm1 = await provider.connection.confirmTransaction(lutId1, 'finalized');
    
    await sleep(2000);
    const lookupTableAccount = await provider.connection.getAddressLookupTable(lookupTableAddress, { commitment: 'finalized' });
  
    ///////////////////////////////////end///////////////////////////////////////
  
    const messageV0 = new TransactionMessage({
      payerKey: auth.publicKey,
      recentBlockhash: latestBlockHash.blockhash,
      instructions: chunk,
    }).compileToV0Message([lookupTableAccount.value!]);
  
    const vtx = new VersionedTransaction(messageV0);
    const sim = await provider.connection.simulateTransaction(vtx);
    console.log("🤖simulate log🤖:", sim);
    
    if (sim.value.err) {
      console.log("🤖Simulation error🤖:", sim.value.err);
    }
  
    vtx.sign([auth.payer]);
    const createV0Tx = await futConnection.sendTransaction(vtx);
    console.log("🤖tx🤖:", createV0Tx);
    
    const vTxSig = await futConnection.confirmTransaction(createV0Tx, 'finalized');
    console.log("🤖confirmation🤖", vTxSig);
  }
}

export const getOracleResult = async (params: OracleType) => {
  console.log("feed:", params.feed);
  
  const res_instruction = await program.methods.getRes().accounts({
    user: auth.publicKey,
    market: new PublicKey(params.market_id),
    global: globalPDA,
    feed: new PublicKey("EzXYYhb6K5JyPGLiBChL2e84gHWoWfXCjM6iujKCgyAY"),
    systemProgram: SystemProgram.programId,
  }).instruction();

  const udpateFeedData = await udpateFeed(params.feed);

  let latestBlockHash = await provider.connection.getLatestBlockhash(
    provider.connection.commitment
  );

  if (!udpateFeedData.pullIx) {
    return
  }
  const tx = await asV0Tx({
    connection: futConnection,
    ixs: [...udpateFeedData.pullIx, res_instruction],
    signers: [auth.payer],
    computeUnitPrice: 200_000,
    computeUnitLimitMultiple: 1.3,
    lookupTables: udpateFeedData.luts,
  });
  
  const info = await (program.account as any).market.fetch(new PublicKey(params.market_id), "confirmed");
  const betting_result = (info as any).result;
  console.log("market info:", betting_result);
}

export const udpateFeed = async (feedKey: String) => {
  let queue = await getDefaultDevnetQueue("https://api.devnet.solana.com");
  const feedAccount = new PullFeed(queue.program, "4ZM78DGSfS8AtZ3UKGyfKN6vw7ZJSpRueYE6kPLbKsTK");
  const crossbar = CrossbarClient.default();

  const [pullIx, responses, success, luts] = await feedAccount.fetchUpdateIx({
    crossbarClient: crossbar,
    gateway: "",
    chain: "solana"
  }, false, auth.publicKey);

  return {pullIx, luts};
} 

function sleep(ms: number): Promise<void> { 
  return new Promise(resolve => setTimeout(resolve, ms)); 
} 