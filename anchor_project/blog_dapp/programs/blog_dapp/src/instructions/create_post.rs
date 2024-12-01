use crate::errors::BlogError;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn create_post(ctx: Context<CreatePost>, topic: String, content: String) -> Result<()> {
    let post = &mut ctx.accounts.post;

    require!(
        topic.as_bytes().len() <= TOPIC_LENGTH,
        BlogError::TopicTooLong
    );

    require!(
        content.as_bytes().len() <= CONTENT_LENGTH,
        BlogError::ContentTooLong
    );

    let mut topic_data = [0u8; TOPIC_LENGTH];
    topic_data[..topic.as_bytes().len()].copy_from_slice(topic.as_bytes());
    post.topic = topic_data;

    let mut content_data = [0u8; CONTENT_LENGTH];
    content_data[..content.as_bytes().len()].copy_from_slice(content.as_bytes());
    post.content = content_data;

    post.topic_length = topic.len() as u8;
    post.post_author = ctx.accounts.post_authority.key();
    post.bump = ctx.bumps.post;

    Ok(())
}

#[derive(Accounts)]
#[instruction(topic: String)]
pub struct CreatePost<'info> {
    #[account(mut)]
    pub post_authority: Signer<'info>,
    #[account(
        init,
        payer = post_authority,
        space = DISCRIMINATOR + Post::LEN,
        seeds = [
            topic.as_bytes(),
            POST_SEED.as_bytes(),
            post_authority.key().as_ref()
    ],
    bump
    )]
    pub post: Account<'info, Post>,
    pub system_program: Program<'info, System>,
}
