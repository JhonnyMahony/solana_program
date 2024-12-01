use crate::states::*;
use anchor_lang::prelude::*;

pub fn delete_post(_ctx: Context<DeletePost>, topic: String) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct DeletePost<'info> {
    #[account(
        mut,
        seeds = [
            topic.as_ref(),
            POST_SEED.as_bytes(),
            post_authority.key().as_ref()
    ],
        bump,
        close = post_authority,
    )]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub post_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
