import * as anchor from "@coral-xyz/anchor";
import IDL_JSON from "./idl/prediction.json";
import MarketModel from "../model/market";

let program = new anchor.Program(IDL_JSON as anchor.Idl);

const OracleEvent = program.addEventListener("OracleResUpdated", (event, slot, signature) => {
    console.log("👻OracleResUpdated 👻", Number((event as any).oracleRes));
});

const GlobalEvent = program.addEventListener("GlobalInitialized", (event, slot, signature) => {
    console.log("👻GlobalInitilized  👻", event);
});

const MarketEvent = program.addEventListener("MarketCreated", async (event, slot, signature) => {
    console.log("👻MarketCreated  👻", event);

    const result = await MarketModel.findOneAndUpdate(
        { market: (event as any).market.toString() },
        {
            marketStatus: "PENDING",
        },
        { upsert: true, new: true }
    );
    console.log("MarketEvent result:", result);
});