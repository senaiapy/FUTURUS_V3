import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as fs from "fs";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(
    fs.readFileSync("../futurus-coin/target/idl/futurus_coin.json", "utf8")
  );
  const programId = new PublicKey("FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb");
  const program = new Program(idl, programId, provider);

  const mintKeypair = Keypair.generate();
  const mintAddress = mintKeypair.publicKey.toBase58();
  console.log("New FUT Mint Address:", mintAddress);

  const metadataProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      metadataProgramId.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    metadataProgramId
  );

  console.log("Building instruction via accounts map...");
  
  const vault = anchor.utils.token.associatedAddress({
    mint: mintKeypair.publicKey,
    owner: provider.wallet.publicKey
  });

  // I'll try BOTH names to be absolutely sure
  const accounts: any = {
    mint: mintKeypair.publicKey,
    vault: vault,
    metadata: metadata,
    payer: provider.wallet.publicKey,
    token_program: anchor.utils.token.TOKEN_PROGRAM_ID,
    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    token_metadata_program: metadataProgramId,
    tokenMetadataProgram: metadataProgramId,
    associated_token_program: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
    associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
    system_program: anchor.web3.SystemProgram.programId,
    systemProgram: anchor.web3.SystemProgram.programId,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  };

  const ix = await program.methods
    .initialize("https://raw.githubusercontent.com/futurus-solana/metadata/main/fut.json")
    .accounts(accounts)
    .instruction();

  console.log("Instruction Keys:", ix.keys.map(k => ({ pubkey: k.pubkey.toBase58(), isSigner: k.isSigner })));

  const tx = new Transaction().add(ix);
  tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
  tx.feePayer = provider.wallet.publicKey;
  
  console.log("Partial signing...");
  // Check if mintAddress is in keys and isSigner
  const mintKeyIndex = ix.keys.findIndex(k => k.pubkey.equals(mintKeypair.publicKey));
  if (mintKeyIndex === -1) {
    console.error("MINT ADDRESS NOT FOUND IN INSTRUCTION KEYS!");
  } else {
    console.log("Mint isSigner:", ix.keys[mintKeyIndex].isSigner);
    // If it's not a signer, make it one for now (unsafe but just to debug)
    ix.keys[mintKeyIndex].isSigner = true;
  }

  tx.partialSign(mintKeypair);
  
  const signedTx = await provider.wallet.signTransaction(tx);
  const signature = await provider.connection.sendRawTransaction(signedTx.serialize());
  
  console.log("Waiting for confirmation...");
  await provider.connection.confirmTransaction(signature);

  console.log("Success! Transaction signature:", signature);
  console.log("FUT_MINT=" + mintAddress);
  
  // Update .env
  let envContent = fs.readFileSync("../.env", "utf8");
  envContent = envContent.replace(/FUT_MINT=.*/, `FUT_MINT=${mintAddress}`);
  fs.writeFileSync("../.env", envContent);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
