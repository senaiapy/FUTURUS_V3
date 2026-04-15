use anchor_lang::prelude::*;
use crate::errors::ContractError;
use crate::constants::MARKET_SEED;

#[account]
#[derive(InitSpace, Debug)]
pub struct Market {
    pub creator: Pubkey,
    pub feed: Pubkey,
    pub value: f64,
    pub quest: i64, 
    pub range: u8,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
    pub token_price_a: u64,
    pub token_price_b: u64,
    pub yes_amount: u16,
    pub no_amount: u16,
    pub total_reserve: u64,
    pub resolution_date: i64,
    pub market_status: MarketStatus,
    pub result: bool,
    pub bump: u8,
    /// Total FUT tokens deposited into the market via betting
    pub total_fut_deposited: u64,
    /// Total number of Yes tokens sold to users
    pub total_yes_sold: u64,
    /// Total number of No tokens sold to users
    pub total_no_sold: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum MarketStatus {
    Prepare,
    Active,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct MarketParams {
    pub quest: i64,
    pub value: f64,
    pub range: u8,
    pub date: i64,
    pub token_amount: u64,
    pub token_price: u64,
    pub market_id: String,
    pub name_a: Option<String>,
    pub name_b: Option<String>,
    pub symbol_a: Option<String>,
    pub symbol_b: Option<String>,
    pub url_a: Option<String>,
    pub url_b: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct BettingParams {
    pub market_id: String,
    pub amount: u64,
    pub is_yes: bool,
}

impl Market {
    pub fn get_signer<'a>(bump: &'a u8, market_id: &'a [u8]) -> [&'a [u8]; 3] {
        [MARKET_SEED.as_bytes(), market_id, std::slice::from_ref(bump)]
    }

    pub fn update_market_settings(
        &mut self,
        value: f64,
        range: u8,
        creator: Pubkey,
        feed: Pubkey,
        token_a: Pubkey,
        token_b: Pubkey,
        token_amount: u64,
        token_price: u64,
        resolution_date: i64,
    ) -> Result<()> {
        self.value = value;
        self.range = range;
        self.creator = creator;
        self.feed = feed;
        self.token_a = token_a;
        self.token_b = token_b;
        self.token_a_amount = token_amount;
        self.token_b_amount = token_amount;
        self.token_price_a = token_price;
        self.token_price_b = token_price;
        self.total_reserve = token_amount
            .checked_mul(token_price)
            .ok_or(ContractError::ArithmeticError)?;
        self.resolution_date = resolution_date;
        self.market_status = MarketStatus::Prepare;
        self.total_fut_deposited = 0;
        self.total_yes_sold = 0;
        self.total_no_sold = 0;
        Ok(())
    }

    pub fn update_market_status(&mut self, status: MarketStatus) {
        self.market_status = status;
    }

    pub fn set_token_price(&mut self, sell_token_amount: u64, is_yes: bool) -> Result<()> {
        if is_yes {
            self.token_a_amount = self.token_a_amount.checked_sub(sell_token_amount).ok_or(ContractError::ArithmeticError)?;
            self.total_yes_sold = self.total_yes_sold.checked_add(sell_token_amount).ok_or(ContractError::ArithmeticError)?;
        } else {
            self.token_b_amount = self.token_b_amount.checked_sub(sell_token_amount).ok_or(ContractError::ArithmeticError)?;
            self.total_no_sold = self.total_no_sold.checked_add(sell_token_amount).ok_or(ContractError::ArithmeticError)?;
        }

        let total_tokens = self.token_a_amount.checked_add(self.token_b_amount).ok_or(ContractError::ArithmeticError)?;
        if self.token_a_amount == 0 || self.token_b_amount == 0 {
            return Err(ContractError::ArithmeticError.into());
        }

        self.token_price_a = self.total_reserve
            .checked_mul(total_tokens)
            .ok_or(ContractError::ArithmeticError)?
            .checked_div(self.token_a_amount)
            .ok_or(ContractError::ArithmeticError)?;

        self.token_price_b = self.total_reserve
            .checked_mul(total_tokens)
            .ok_or(ContractError::ArithmeticError)?
            .checked_div(self.token_b_amount)
            .ok_or(ContractError::ArithmeticError)?;
        Ok(())
    }

    pub fn update_result(&mut self, result: bool) {
        self.result = result;
        self.market_status = MarketStatus::Finished;
    }
}
