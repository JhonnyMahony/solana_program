import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlogDapp } from "../target/types/blog_dapp";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import crypto from "crypto";

const POST_SEED = "POST_SEED";

describe("blog_dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BlogDapp as Program<BlogDapp>;

  const user = anchor.web3.Keypair.generate();

  const create_user_topic = "My first create post topic";
  const create_user_content =
    "This is my first update post content and like this app";

  const update_user_content =
    "This is my first update post content and like this app";

  const topic = "12345678";
  let content_32_bytes = topic.repeat(4);
  const invalid_topic = content_32_bytes + "+1";
  const content = "0123456789";
  let content_500_bytes = content.repeat(50);
  const invalid_content = content_500_bytes + "+1";

  describe("Create Post", async () => {
    it("User can create Post", async () => {
      await airdrop(provider.connection, user.publicKey);
      const [post_pkey, post_bump] = getPostAddress(
        create_user_topic,
        user.publicKey,
        program.programId
      );

      const tx = await program.methods
        .create(create_user_topic, create_user_content)
        .accounts({
          postAuthority: user.publicKey,
          post: post_pkey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc({ commitment: "confirmed" });

      console.log("Your sugnature", tx)

      await checkPost(
        program,
        post_pkey,
        user.publicKey,
        create_user_topic,
        create_user_content,
        post_bump
      );
    });
    it("User cannot create post with topic longer than 32 bytes", async () => {
      let should_fail = "This Should Fail";
      try {
        const [post_pkey, tweet_bump] = getPostAddress(
          invalid_topic,
          user.publicKey,
          program.programId
        );
        await program.methods
          .create(invalid_topic, content)
          .accounts({
            postAuthority: user.publicKey,
            post: post_pkey,
            sysytemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        assert.strictEqual(error.message, "Max seed length exceeded");
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail, "Failed");
    });
    it("User cannot create post with content longer than 500 bytes", async () => {
      let should_fail = "This Should Fail";
      try {
        const [post_pkey, tweet_bump] = getPostAddress(
          topic,
          user.publicKey,
          program.programId
        );
        await program.methods
          .create(topic, invalid_content)
          .accounts({
            postAuthority: user.publicKey,
            post: post_pkey,
            sysytemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc({ commitment: "confirmed" });
      } catch (error) {
        const err = anchor.AnchorError.parse(error.logs);
        assert.strictEqual(err.error.errorCode.code, "ContentTooLong");
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail, "Failed");
    });
  });
    describe("Update Post", async () => {
      it("User can update Post", async () => {
        const [post_pkey, post_bump] = getPostAddress(
          create_user_topic,
          user.publicKey,
          program.programId
        );
  
        await program.methods
          .update(create_user_topic, update_user_content)
          .accounts({
            postAuthority: user.publicKey,
            post: post_pkey,
          })
          .signers([user])
          .rpc({ commitment: "confirmed" });
  
        await checkPost(
          program,
          post_pkey,
          user.publicKey,
          create_user_topic,
          update_user_content,
          post_bump
        );
      });
      it("User cannot update post with content longer than 500 bytes", async () => {
        let should_fail = "This Should Fail";
        try {
          const [post_pkey, tweet_bump] = getPostAddress(
            create_user_topic,
            user.publicKey,
            program.programId
          );
          await program.methods
            .update(create_user_topic, invalid_content)
            .accounts({
              postAuthority: user.publicKey,
              post: post_pkey,
            })
            .signers([user])
            .rpc({ commitment: "confirmed" });
        } catch (error) {
          const err = anchor.AnchorError.parse(error.logs);
          assert.strictEqual(err.error.errorCode.code, "ContentTooLong");
          should_fail = "Failed";
        }
        assert.strictEqual(should_fail, "Failed");
      });
        });
  describe("Delete post", async () => {
    it("User can delete post", async () => {
      const [post_pkey, post_bump] = getPostAddress(
        create_user_topic,
        user.publicKey,
        program.programId
      );

      await program.methods
        .delete(create_user_topic)
        .accounts({
          postAuthority: user.publicKey,
          post: post_pkey,
          sysytemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc({ commitment: "confirmed" });

    });
    it("User cannot deleted post", async () => {
        let should_fail = "This Should Fail";
     try{ const [post_pkey, post_bump] = getPostAddress(
        create_user_topic,
        user.publicKey,
        program.programId
      );

      await program.methods
        .delete(create_user_topic)
        .accounts({
          postAuthority: user.publicKey,
          post: post_pkey,
          sysytemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc({ commitment: "confirmed" });
      } catch (error){
          const err = anchor.AnchorError.parse(error.logs);
          assert.strictEqual(err.error.errorCode.code, "AccountNotInitialized");
        should_fail = "Failed";
      }
        assert.strictEqual(should_fail, "Failed");

    });
  });
});

async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed"
  );
}

function getPostAddress(
  topic: string,
  author: PublicKey,
  programID: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(topic),
      anchor.utils.bytes.utf8.encode(POST_SEED),
      author.toBuffer(),
    ],
    programID
  );
}

function stringToUtf8ByteArray(inputString: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(inputString);
}

// Function to pad a byte array with zeroes to a specified length
function padByteArrayWithZeroes(
  byteArray: Uint8Array,
  length: number
): Uint8Array {
  if (byteArray.length >= length) {
    return byteArray;
  }
  const paddedArray = new Uint8Array(length);
  paddedArray.set(byteArray, 0);
  return paddedArray;
}

async function checkPost(
  program: anchor.Program<BlogDapp>,
  post: PublicKey,
  post_author?: PublicKey,
  topic?: string,
  content?: string,
  bump?: number
) {
  let postData = await program.account.post.fetch(post);

  if (post_author) {
    assert.strictEqual(postData.postAuthor.toString(), post_author.toString());
  }

  if (topic) {
    const utf8ByteArray_topic = stringToUtf8ByteArray(topic);
    const paddedByteArray_topic = padByteArrayWithZeroes(
      utf8ByteArray_topic,
      32
    );
    assert.strictEqual(
      postData.topic.toString(),
      paddedByteArray_topic.toString()
    );
    assert.strictEqual(
      postData.topicLength.toString(),
      utf8ByteArray_topic.length.toString()
    );
  }

  if (content) {
    const utf8ByteArray_content = stringToUtf8ByteArray(content);
    const paddedByteArray_content = padByteArrayWithZeroes(
      utf8ByteArray_content,
      500
    );
    assert.strictEqual(
      postData.content.toString(),
      paddedByteArray_content.toString()
    );
  }

  if (bump) {
    assert.strictEqual(postData.bump.toString(), bump.toString());
  }
}
