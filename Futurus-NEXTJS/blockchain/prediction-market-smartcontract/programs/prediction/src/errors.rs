use anchor_lang::prelude::*;

#[error_code]
#[derive(Eq, PartialEq)]
pub enum ContractError {
    #[msg("Not a valid Switchboard account")]
    InvalidSwitchboardAccount,
    #[msg("Switchboard feed has not been updated in 5 minutes")]
    StaleFeed,
    #[msg("Switchboard feed exceeded provided confidence interval")]
    ConfidenceIntervalExceeded,
    #[msg("Invalid fund amount")]
    InvalidFundAmount,
    #[msg("Current FUT price is not above Escrow unlock price.")]
    FutPriceBelowUnlockPrice,
    #[msg("Arithmetic error")]
    ArithmeticError,
    #[msg("Invalid creator")]
    InvalidCreator,
    #[msg("Invalid fee authority")]
    InvalidFeeAuthority,
    #[msg("Not preparing status")]
    NotPreparing,
    #[msg("Invalid market")]
    InvalidMarket,
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Invalid Admin")]
    InvalidAdmin,
    #[msg("Market is not resolved yet")]
    MarketNotResolved,
    #[msg("User has no winning position")]
    NoWinningPosition,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
    #[msg("Market is already resolved")]
    MarketAlreadyResolved,
    #[msg("Market resolution date not reached")]
    ResolutionDateNotReached,
    #[msg("Insufficient market balance")]
    InsufficientMarketBalance,
    #[msg("Invalid token mint for this market")]
    InvalidTokenMint,
    #[msg("User position already exists")]
    PositionAlreadyExists,
    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,
    #[msg("Market is not in finished state")]
    MarketNotFinished,
}
