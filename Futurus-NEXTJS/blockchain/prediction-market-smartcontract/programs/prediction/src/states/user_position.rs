use anchor_lang::prelude::*;

/// Tracks an individual user's position in a specific market
#[account]
#[derive(InitSpace, Debug)]
pub struct UserPosition {
    /// The user who holds this position
    pub user: Pubkey,
    /// The market this position belongs to
    pub market: Pubkey,
    /// Total Yes tokens purchased
    pub yes_amount: u64,
    /// Total No tokens purchased  
    pub no_amount: u64,
    /// Total FUT paid for Yes tokens
    pub yes_fut_paid: u64,
    /// Total FUT paid for No tokens
    pub no_fut_paid: u64,
    /// Whether winnings have been claimed
    pub claimed: bool,
    /// Bump seed for PDA derivation
    pub bump: u8,
}

impl UserPosition {
    pub fn add_position(&mut self, is_yes: bool, token_amount: u64, fut_paid: u64) {
        if is_yes {
            self.yes_amount = self.yes_amount.saturating_add(token_amount);
            self.yes_fut_paid = self.yes_fut_paid.saturating_add(fut_paid);
        } else {
            self.no_amount = self.no_amount.saturating_add(token_amount);
            self.no_fut_paid = self.no_fut_paid.saturating_add(fut_paid);
        }
    }

    /// Get the winning token amount based on market result
    pub fn get_winning_amount(&self, result_is_yes: bool) -> u64 {
        if result_is_yes {
            self.yes_amount
        } else {
            self.no_amount
        }
    }
}
