use anchor_lang::prelude::*;
pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod states;
pub mod utils;

use instructions::{
    betting::*, claim_winnings::*, close_market::*, create_market::*,
    deposite_liquidity::*, get_oracle_res::*, init::*, resolve_market::*, token_mint::*,
};
use states::{
    global::GlobalParams,
    market::{BettingParams, MarketParams},
};

declare_id!("6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY");

#[program]
pub mod prediction {
    use super::*;

    /// Initialize the global state with fee settings and admin configuration
    pub fn initialize(ctx: Context<Initialize>, params: GlobalParams) -> Result<()> {
        init(ctx, params)
    }

    /// Query the oracle for the current price feed (legacy — use resolve_market for resolution)
    pub fn get_res(ctx: Context<GetOracleRes>) -> Result<()> {
        get_oracle_res(ctx)
    }

    /// Create a new prediction market with Yes/No token mints
    pub fn init_market(ctx: Context<CreateMarket>, params: MarketParams) -> Result<()> {
        CreateMarket::create_market(ctx, params)
    }

    /// Add liquidity (SOL) to a market in Prepare status
    pub fn add_liquidity(ctx: Context<DepositLiquidity>, amount: u64) -> Result<()> {
        deposit_liquidity(ctx, amount)
    }

    /// Place a bet on a market by buying Yes or No tokens with FUT
    pub fn create_bet(ctx: Context<Betting>, params: BettingParams) -> Result<()> {
        Betting::betting(ctx, params)
    }

    /// Mint Yes/No tokens to the market's PDA token accounts
    pub fn mint_token(ctx: Context<TokenMint>, market_id: String) -> Result<()> {
        TokenMint::token_mint(ctx, market_id)
    }

    /// Resolve a market using Switchboard oracle data (admin only)
    /// Checks that resolution_date has passed, reads oracle, determines winner
    pub fn resolve(ctx: Context<ResolveMarket>) -> Result<()> {
        resolve_market(ctx)
    }

    /// Claim winnings from a resolved market
    /// Winners receive proportional share of the FUT pool
    pub fn claim(ctx: Context<ClaimWinnings>, market_id: String) -> Result<()> {
        claim_winnings(ctx, market_id)
    }

    /// Admin-only: manually close a market with a specified result
    /// Used for subjective markets or emergency resolution
    pub fn admin_close_market(ctx: Context<CloseMarket>, market_id: String, result: bool) -> Result<()> {
        close_market(ctx, market_id, result)
    }
}
