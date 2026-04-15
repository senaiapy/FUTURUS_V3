use crate::constants::{GLOBAL_SEED, MARKET_SEED, USER_POSITION_SEED};
use crate::errors::ContractError;
use crate::events::WinningsClaimed;
use crate::states::{global::Global, market::{Market, MarketStatus}, user_position::UserPosition};
use crate::utils::token_transfer;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
#[instruction(market_id: String)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    /// CHECK: The FUT (Futurus Coin) token mint
    pub fut_mint: Box<InterfaceAccount<'info, Mint>>,

    /// User's FUT token account to receive winnings
    #[account(
        mut,
        associated_token::mint = fut_mint,
        associated_token::authority = user.key()
    )]
    pub user_fut_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Market's FUT token account holding the pool
    #[account(
        mut,
        associated_token::mint = fut_mint,
        associated_token::authority = market
    )]
    pub market_fut_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [MARKET_SEED.as_bytes(), market_id.as_bytes()],
        bump = market.bump,
        constraint = market.market_status == MarketStatus::Finished @ ContractError::MarketNotFinished,
    )]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [GLOBAL_SEED.as_bytes()],
        bump
    )]
    pub global: Account<'info, Global>,

    /// User position tracking their bets
    #[account(
        mut,
        seeds = [USER_POSITION_SEED.as_bytes(), market.key().as_ref(), user.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.user == user.key() @ ContractError::InvalidCreator,
        constraint = !user_position.claimed @ ContractError::AlreadyClaimed,
    )]
    pub user_position: Account<'info, UserPosition>,

    /// User's winning token account (Yes or No token)
    #[account(
        mut,
        associated_token::mint = winning_token_mint,
        associated_token::authority = user.key()
    )]
    pub user_winning_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The winning token mint (token_a for Yes, token_b for No)
    #[account(mut)]
    pub winning_token_mint: Box<InterfaceAccount<'info, Mint>>,

    pub token_program: Interface<'info, TokenInterface>,
    /// CHECK: associated token program account
    pub associated_token_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn claim_winnings(ctx: Context<ClaimWinnings>, market_id: String) -> Result<()> {
    let market = &ctx.accounts.market;
    let user_position = &mut ctx.accounts.user_position;

    // Verify the correct winning token mint is provided
    let expected_mint = if market.result {
        market.token_a // Yes token wins
    } else {
        market.token_b // No token wins
    };
    require!(
        ctx.accounts.winning_token_mint.key() == expected_mint,
        ContractError::InvalidTokenMint
    );

    // Get user's winning token amount
    let winning_amount = user_position.get_winning_amount(market.result);
    require!(winning_amount > 0, ContractError::NoWinningPosition);

    // Calculate proportional winnings from the FUT pool
    // Total winning tokens = total_yes_sold or total_no_sold based on result
    let total_winning_tokens = if market.result {
        market.total_yes_sold
    } else {
        market.total_no_sold
    };

    // User gets: (user_winning_tokens / total_winning_tokens) * total_fut_in_pool
    let market_fut_balance = ctx.accounts.market_fut_account.amount;
    let user_winnings = (winning_amount as u128)
        .checked_mul(market_fut_balance as u128)
        .ok_or(ContractError::ArithmeticError)?
        .checked_div(total_winning_tokens as u128)
        .ok_or(ContractError::ArithmeticError)? as u64;

    require!(user_winnings > 0, ContractError::NoWinningPosition);
    require!(
        user_winnings <= market_fut_balance,
        ContractError::InsufficientMarketBalance
    );

    msg!("🏆 User winning amount: {} tokens", winning_amount);
    msg!("🏆 Total winning tokens in market: {}", total_winning_tokens);
    msg!("🏆 Market FUT balance: {}", market_fut_balance);
    msg!("🏆 User FUT winnings: {}", user_winnings);

    // Transfer FUT from market to user
    let mint_authority_signer: [&[u8]; 3] =
        Market::get_signer(&ctx.accounts.market.bump, market_id.as_bytes());
    let mint_auth_signer_seeds = &[&mint_authority_signer[..]];

    token_transfer(
        ctx.accounts.market_fut_account.to_account_info(),
        ctx.accounts.user_fut_account.to_account_info(),
        ctx.accounts.market.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        mint_auth_signer_seeds,
        user_winnings,
    )?;

    // Mark position as claimed
    user_position.claimed = true;

    emit!(WinningsClaimed {
        user: ctx.accounts.user.key(),
        market_id: ctx.accounts.market.key(),
        amount: user_winnings,
        is_yes: market.result,
    });

    Ok(())
}
