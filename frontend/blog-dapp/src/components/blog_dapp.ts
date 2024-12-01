/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blog_dapp.json`.
 */
export type BlogDapp = {
  "address": "FfC2r69GzwNy9zD1sJDoVXPbnWTxyqTckoBB669RHNev",
  "metadata": {
    "name": "blogDapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "create",
      "discriminator": [
        24,
        30,
        200,
        40,
        5,
        28,
        7,
        119
      ],
      "accounts": [
        {
          "name": "postAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "topic"
              },
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  83,
                  84,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "postAuthority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "delete",
      "discriminator": [
        165,
        204,
        60,
        98,
        134,
        15,
        83,
        134
      ],
      "accounts": [
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "topic"
              },
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  83,
                  84,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "postAuthority"
              }
            ]
          }
        },
        {
          "name": "postAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        }
      ]
    },
    {
      "name": "update",
      "discriminator": [
        219,
        200,
        88,
        176,
        158,
        63,
        253,
        127
      ],
      "accounts": [
        {
          "name": "postAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "topic"
              },
              {
                "kind": "const",
                "value": [
                  80,
                  79,
                  83,
                  84,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "postAuthority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "topicTooLong",
      "msg": "Topic too long"
    },
    {
      "code": 6001,
      "name": "contentTooLong",
      "msg": "Content too long"
    }
  ],
  "types": [
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "postAuthor",
            "type": "pubkey"
          },
          {
            "name": "topic",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "topicLength",
            "type": "u8"
          },
          {
            "name": "content",
            "type": {
              "array": [
                "u8",
                500
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
