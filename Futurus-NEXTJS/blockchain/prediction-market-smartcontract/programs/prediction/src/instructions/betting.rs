use crate::constants::{GLOBAL_SEED, USER_POSITION_SEED};
use crate::errors::ContractError;
use crate::states::{global::*, market::*, user_position::UserPosition};
use anchor_lang::{prelude::*, solana_program};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::utils::token_transfer;
use crate::events::{BettingEvent, PositionCreated};

#[derive(Accounts)]
#[instruction(params: BettingParams)]
pub struct Betting<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    /// CHECK: The FUT (Futurus Coin) token mint
    pub fut_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = fut_mint,
        associated_token::authority = user.key()
    )]
    pub user_fut_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = fut_mint,
        associated_token::authority = market
    )]
    pub market_fut_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = fut_mint,
        associated_token::authority = fee_authority
    )]
    pub fee_authority_fut_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = market.creator == creator.key() @ ContractError::InvalidCreator
    )]
    /// CHECK: creator is checked in constraint
    pub creator: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK reward YES/NO token mint
    token_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = market
    )]
    pub pda_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut, 
        associated_token::mint = token_mint,
        associated_token::authority = user.key()
    )]
    pub user_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: global fee authority is checked in constraint
    #[account(
        mut,
        constraint = fee_authority.key() == global.fee_authority @ ContractError::InvalidFeeAuthority
    )]
    pub fee_authority: AccountInfo<'info>,

    #[account(
        mut,
        constraint = market.market_status == MarketStatus::Active @ ContractError::MarketNotActive,
    )]
    pub market: Account<'info, Market>,

    #[account(
        seeds = [GLOBAL_SEED.as_bytes()],
        bump
    )]
    pub global: Account<'info, Global>,

    /// User position account: tracks bets per user per market
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::INIT_SPACE,
        seeds = [USER_POSITION_SEED.as_bytes(), market.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    pub token_program: Interface<'info, TokenInterface>,
    /// CHECK: associated token program account
    pub associated_token_program: UncheckedAccount<'info>,
    /// CHECK: token metadata program account
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl Betting<'_> {
    pub fn betting(ctx: Context<Betting>, params: BettingParams) -> Result<()> {
        let market_key = ctx.accounts.market.key();
        let market = &mut ctx.accounts.market;

        let decimal_multiplier = 10u64.pow(ctx.accounts.global.decimal as u32);
        
        let token_price = if params.is_yes {
            market.token_price_a
        } else {
            market.token_price_b
        };

        let fut_to_buy = params.amount
            .checked_mul(decimal_multiplier)
            .ok_or(ContractError::ArithmeticError)?
            .checked_div(10u64.pow(9))
            .ok_or(ContractError::ArithmeticError)?
            .checked_mul(token_price)
            .ok_or(ContractError::ArithmeticError)?;
        msg!("🎫FUT_to_buy 🎫 {}", fut_to_buy);

        // Transfer FUT tokens from user to market
        token_transfer(
            ctx.accounts.user_fut_account.to_account_info(),
            ctx.accounts.market_fut_account.to_account_info(),
            ctx.accounts.user.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            &[], // User is signer, no PDA seeds needed
            fut_to_buy,
        )?;
            
        let mint_authority_signer: [&[u8]; 3] =
            Market::get_signer(&market.bump, &params.market_id.as_bytes());
        let mint_auth_signer_seeds = &[&mint_authority_signer[..]];

        let token_amount = params
            .amount
            .checked_mul(decimal_multiplier)
            .ok_or(ContractError::ArithmeticError)?;
        msg!("🎫token_amount to user 🎫 {}", token_amount);

        token_transfer(
            ctx.accounts.pda_token_account.to_account_info(),
            ctx.accounts.user_token_account.to_account_info(),
            market.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            mint_auth_signer_seeds,
            token_amount,
        )?;
            
        // Transfer fee to fee authority (Now in FUT)
        let fee_amount_to_auth = fut_to_buy
            .checked_mul(ctx.accounts.global.betting_fee_percentage as u64)
            .ok_or(ContractError::ArithmeticError)?
            .checked_div(100)
            .ok_or(ContractError::ArithmeticError)?;

        msg!("🎫fee_amount_to_auth 🎫 {}", fee_amount_to_auth);

        if fee_amount_to_auth > 0 {
            token_transfer(
                ctx.accounts.user_fut_account.to_account_info(),
                ctx.accounts.fee_authority_fut_account.to_account_info(),
                ctx.accounts.user.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
                &[], 
                fee_amount_to_auth,
            )?;
        }

        if params.is_yes {
            market.yes_amount += 1;
        } else {
            market.no_amount += 1;
        }

        // Track total FUT deposited
        market.total_fut_deposited = market.total_fut_deposited
            .checked_add(fut_to_buy)
            .ok_or(ContractError::ArithmeticError)?;

        let _ = market.set_token_price(params.amount, params.is_yes)?;

        // Update user position
        let user_position = &mut ctx.accounts.user_position;
        if user_position.user == Pubkey::default() {
            // First time — initialize position
            user_position.user = ctx.accounts.user.key();
            user_position.market = market_key;
            user_position.claimed = false;
            user_position.bump = ctx.bumps.user_position;
        }
        user_position.add_position(params.is_yes, params.amount, fut_to_buy);

        emit!(BettingEvent {
            user: ctx.accounts.user.key(),
            market_id: market_key,
            is_yes: params.is_yes,
            amount: params.amount,
            fut_cost: fut_to_buy,
            token_a_price: market.token_price_a,
            token_b_price: market.token_price_b,
        });

        emit!(PositionCreated {
            user: ctx.accounts.user.key(),
            market_id: market_key,
            is_yes: params.is_yes,
            token_amount: params.amount,
            fut_paid: fut_to_buy,
        });

        Ok(())
    }
}
