use anchor_lang::prelude::*;

#[error_code]
pub enum BlogError {
    #[msg("Topic too long")]
    TopicTooLong,
    #[msg("Content too long")]
    ContentTooLong,
}
