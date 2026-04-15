use crate::constants::{GLOBAL_SEED, MARKET_SEED};
use crate::errors::ContractError;
use crate::events::MarketStatusUpdated;
use crate::states::{global::Global, market::{Market, MarketStatus}};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(market_id: String)]
pub struct CloseMarket<'info> {
    #[account(
        mut,
        constraint = user.key() == global.admin @ ContractError::InvalidAdmin
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED.as_bytes(), market_id.as_bytes()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [GLOBAL_SEED.as_bytes()],
        bump
    )]
    pub global: Account<'info, Global>,

    pub system_program: Program<'info, System>,
}

/// Admin-only instruction to close a market manually.
/// Sets the market result and transitions to Finished status.
/// Used for markets that cannot be resolved by oracle (e.g., subjective outcomes).
pub fn close_market(ctx: Context<CloseMarket>, _market_id: String, result: bool) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(
        market.market_status != MarketStatus::Finished,
        ContractError::MarketAlreadyResolved
    );

    market.result = result;
    market.market_status = MarketStatus::Finished;

    msg!("🔒 Market closed by admin. Result: {} wins", if result { "YES" } else { "NO" });

    emit!(MarketStatusUpdated {
        market_id: ctx.accounts.market.key(),
        market_status: MarketStatus::Finished,
    });

    Ok(())
}
