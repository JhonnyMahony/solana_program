use crate::instructions::*;
use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

declare_id!("FfC2r69GzwNy9zD1sJDoVXPbnWTxyqTckoBB669RHNev");

#[program]
pub mod blog_dapp {

    use super::*;

    pub fn create(ctx: Context<CreatePost>, topic: String, content: String) -> Result<()> {
        create_post(ctx, topic, content)
    }
    pub fn update(ctx: Context<UpdatePost>, topic: String, content: String) -> Result<()> {
        update_post(ctx, topic, content)
    }
    pub fn delete(ctx: Context<DeletePost>, topic: String) -> Result<()> {
        delete_post(ctx, topic)
    }
}
