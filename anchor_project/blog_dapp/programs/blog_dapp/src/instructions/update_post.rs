use crate::errors::BlogError;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn update_post(ctx: Context<UpdatePost>, topic: String, new_content: String) -> Result<()> {
    let post = &mut ctx.accounts.post;

    require!(
        new_content.as_bytes().len() <= CONTENT_LENGTH,
        BlogError::ContentTooLong
    );

    let mut content_data = [0u8; CONTENT_LENGTH];
    content_data[..new_content.as_bytes().len()].copy_from_slice(new_content.as_bytes());
    post.content = content_data;

    Ok(())
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct UpdatePost<'info> {
    #[account(mut)]
    pub post_authority: Signer<'info>,
    #[account(
        mut,
        seeds=[
            topic.as_ref(),
            POST_SEED.as_bytes(),
            post_authority.key().as_ref()
        ],
        bump,
        realloc = DISCRIMINATOR + Post::LEN,
        realloc::payer = post_authority,
        realloc::zero = true,
    )]
    pub post: Account<'info, Post>,
    pub system_program: Program<'info, System>,
}
