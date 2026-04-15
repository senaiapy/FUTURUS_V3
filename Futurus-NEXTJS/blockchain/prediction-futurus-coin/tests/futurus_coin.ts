import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Futurus Coin } from "../target/types/futurus_coin";

describe("futurus_coin", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Futurus Coin as Program<Futurus Coin>;

  it("Is initialized!", async () => {
    const mint = anchor.web3.Keypair.generate();
    const [metadata] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const tx = await program.methods
      .initialize("https://raw.githubusercontent.com/user/repo/main/@futurus-coin/metadata.json")
      .accounts({
        mint: mint.publicKey,
        tokenMetadataProgram: new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .signers([mint])
      .rpc();
    console.log("Your transaction signature", tx);
    console.log("Mint Address:", mint.publicKey.toBase58());
  });
});
