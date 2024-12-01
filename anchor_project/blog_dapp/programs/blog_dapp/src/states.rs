use anchor_lang::prelude::*;

pub const TOPIC_LENGTH: usize = 32;
pub const CONTENT_LENGTH: usize = 500;

pub const POST_SEED: &str = "POST_SEED";
pub const DISCRIMINATOR: usize = 8;

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub post_author: Pubkey,
    pub topic: [u8; TOPIC_LENGTH],
    pub topic_length: u8,
    pub content: [u8; CONTENT_LENGTH],
    pub bump: u8,
}

impl Post {
    // Pubkey + [u8; TOPIC_LENGTH] + u8 + [u8; CONTENT_LENGTH] + u64 + u64 + u8
    pub const LEN: usize = 32 + TOPIC_LENGTH + 1 + CONTENT_LENGTH + 8 + 8 + 1;
}
