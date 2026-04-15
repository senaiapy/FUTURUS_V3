use crate::constants::GLOBAL_SEED;
use crate::errors::ContractError;
use crate::events::{MarketResolved, MarketStatusUpdated, OracleResUpdated};
use crate::states::global::Global;
use crate::states::market::{Market, MarketStatus};
use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        mut,
        constraint = user.key() == global.admin @ ContractError::InvalidAdmin
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = market.market_status == MarketStatus::Active @ ContractError::MarketNotActive,
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(
        seeds = [GLOBAL_SEED.as_bytes()],
        bump
    )]
    pub global: Box<Account<'info, Global>>,

    /// CHECK: via switchboard sdk
    pub feed: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn resolve_market(ctx: Context<ResolveMarket>) -> Result<()> {
    let market_key = ctx.accounts.market.key();
    let market = &mut ctx.accounts.market;

    // Verify resolution date has passed
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp >= market.resolution_date,
        ContractError::ResolutionDateNotReached
    );

    let feed_account = ctx.accounts.feed.data.borrow();
    let feed: std::cell::Ref<'_, PullFeedAccountData> =
        PullFeedAccountData::parse(feed_account).unwrap();

    msg!("🎫 Oracle price 🎫 {:?}", feed.value(300));
    msg!("🎫 Market range 🎫 {:?}", market.range);

    let feed_value: f64 = feed.value(300).unwrap().try_into().unwrap();

    // Determine result based on range:
    // range 0 = "above" (Yes wins if oracle value > market value)
    // range 1 = "equal" (Yes wins if oracle value == market value)
    // range 2 = "below" (Yes wins if oracle value < market value)
    market.result = match market.range {
        0 => feed_value > market.value,
        1 => (feed_value - market.value).abs() < f64::EPSILON,
        2 => feed_value < market.value,
        _ => false,
    };

    market.market_status = MarketStatus::Finished;

    msg!("🎫 Result: {} wins 🎫", if market.result { "YES" } else { "NO" });

    emit!(OracleResUpdated {
        oracle_res: feed_value,
    });

    emit!(MarketResolved {
        market_id: market_key,
        result: market.result,
        oracle_value: feed_value,
        market_value: market.value,
    });

    emit!(MarketStatusUpdated {
        market_id: market_key,
        market_status: MarketStatus::Finished,
    });

    Ok(())
}
