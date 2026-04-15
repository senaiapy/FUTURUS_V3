/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/prediction.json`.
 */
export type Prediction = {
  "address": "6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY",
  "metadata": {
    "name": "prediction",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addLiquidity",
      "discriminator": [
        181,
        157,
        89,
        67,
        143,
        182,
        52,
        72
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeAuthority",
          "writable": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createBet",
      "discriminator": [
        197,
        42,
        153,
        2,
        59,
        63,
        143,
        246
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "futMint",
          "writable": true
        },
        {
          "name": "userFutAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "futMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "marketFutAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "futMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeAuthorityFutAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "futMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "tokenMint",
          "docs": [
            "CHECK reward YES/NO token mint"
          ],
          "writable": true
        },
        {
          "name": "pdaTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeAuthority",
          "writable": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "bettingParams"
            }
          }
        }
      ]
    },
    {
      "name": "getRes",
      "discriminator": [
        31,
        216,
        159,
        150,
        195,
        87,
        242,
        137
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "feed"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initMarket",
      "discriminator": [
        33,
        253,
        15,
        116,
        89,
        25,
        127,
        236
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeAuthority",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "params.market_id"
              }
            ]
          }
        },
        {
          "name": "globalPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "feed"
        },
        {
          "name": "metadataA",
          "writable": true
        },
        {
          "name": "metadataB",
          "writable": true
        },
        {
          "name": "tokenMintA",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "tokenMintB",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  98,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "rent"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "marketParams"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
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
          "name": "params",
          "type": {
            "defined": {
              "name": "globalParams"
            }
          }
        }
      ]
    },
    {
      "name": "mintToken",
      "discriminator": [
        172,
        137,
        183,
        14,
        207,
        110,
        234,
        56
      ],
      "accounts": [
        {
          "name": "pdaTokenAAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMintA"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "pdaTokenBAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMintB"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeAuthority",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "metadataA",
          "writable": true
        },
        {
          "name": "metadataB",
          "writable": true
        },
        {
          "name": "tokenMintA",
          "writable": true
        },
        {
          "name": "tokenMintB",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram"
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "rent"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "global",
      "discriminator": [
        167,
        232,
        232,
        177,
        200,
        108,
        114,
        127
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    }
  ],
  "events": [
    {
      "name": "bettingEvent",
      "discriminator": [
        135,
        24,
        236,
        238,
        30,
        3,
        38,
        85
      ]
    },
    {
      "name": "globalInitialized",
      "discriminator": [
        142,
        186,
        188,
        168,
        64,
        228,
        8,
        20
      ]
    },
    {
      "name": "marketCreated",
      "discriminator": [
        88,
        184,
        130,
        231,
        226,
        84,
        6,
        58
      ]
    },
    {
      "name": "marketStatusUpdated",
      "discriminator": [
        142,
        245,
        212,
        171,
        133,
        72,
        219,
        195
      ]
    },
    {
      "name": "oracleResUpdated",
      "discriminator": [
        49,
        16,
        89,
        52,
        40,
        113,
        213,
        215
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidSwitchboardAccount",
      "msg": "Not a valid Switchboard account"
    },
    {
      "code": 6001,
      "name": "staleFeed",
      "msg": "Switchboard feed has not been updated in 5 minutes"
    },
    {
      "code": 6002,
      "name": "confidenceIntervalExceeded",
      "msg": "Switchboard feed exceeded provided confidence interval"
    },
    {
      "code": 6003,
      "name": "invalidFundAmount",
      "msg": "Invalid fund amount"
    },
    {
      "code": 6004,
      "name": "futPriceBelowUnlockPrice",
      "msg": "Current FUT price is not above Escrow unlock price."
    },
    {
      "code": 6005,
      "name": "arithmeticError",
      "msg": "Arithmetic error"
    },
    {
      "code": 6006,
      "name": "invalidCreator",
      "msg": "Invalid creator"
    },
    {
      "code": 6007,
      "name": "invalidFeeAuthority",
      "msg": "Invalid fee authority"
    },
    {
      "code": 6008,
      "name": "notPreparing",
      "msg": "Not preparing status"
    },
    {
      "code": 6009,
      "name": "invalidMarket",
      "msg": "Invalid market"
    },
    {
      "code": 6010,
      "name": "marketNotActive",
      "msg": "Market is not active"
    },
    {
      "code": 6011,
      "name": "invalidAdmin",
      "msg": "Invalid Admin"
    }
  ],
  "types": [
    {
      "name": "bettingEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenAPrice",
            "type": "u64"
          },
          {
            "name": "tokenBPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bettingParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "isYes",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "feeAuthority",
            "type": "pubkey"
          },
          {
            "name": "creatorFeeAmount",
            "type": "u64"
          },
          {
            "name": "decimal",
            "type": "u8"
          },
          {
            "name": "marketCount",
            "type": "u64"
          },
          {
            "name": "bettingFeePercentage",
            "type": "f64"
          },
          {
            "name": "fundFeePercentage",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "globalInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "globalId",
            "type": "pubkey"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "creatorFeeAmount",
            "type": "u64"
          },
          {
            "name": "marketCount",
            "type": "u64"
          },
          {
            "name": "decimal",
            "type": "u8"
          },
          {
            "name": "fundFeePercentage",
            "type": "f64"
          },
          {
            "name": "bettingFeePercentage",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "globalParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeAuthority",
            "type": "pubkey"
          },
          {
            "name": "creatorFeeAmount",
            "type": "u64"
          },
          {
            "name": "marketCount",
            "type": "u64"
          },
          {
            "name": "decimal",
            "type": "u8"
          },
          {
            "name": "bettingFeePercentage",
            "type": "f64"
          },
          {
            "name": "fundFeePercentage",
            "type": "f64"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "feed",
            "type": "pubkey"
          },
          {
            "name": "value",
            "type": "f64"
          },
          {
            "name": "quest",
            "type": "i64"
          },
          {
            "name": "range",
            "type": "u8"
          },
          {
            "name": "tokenA",
            "type": "pubkey"
          },
          {
            "name": "tokenB",
            "type": "pubkey"
          },
          {
            "name": "tokenAAmount",
            "type": "u64"
          },
          {
            "name": "tokenBAmount",
            "type": "u64"
          },
          {
            "name": "tokenPriceA",
            "type": "u64"
          },
          {
            "name": "tokenPriceB",
            "type": "u64"
          },
          {
            "name": "yesAmount",
            "type": "u16"
          },
          {
            "name": "noAmount",
            "type": "u16"
          },
          {
            "name": "totalReserve",
            "type": "u64"
          },
          {
            "name": "resolutionDate",
            "type": "i64"
          },
          {
            "name": "marketStatus",
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "result",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "pubkey"
          },
          {
            "name": "value",
            "type": "f64"
          },
          {
            "name": "range",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "feed",
            "type": "pubkey"
          },
          {
            "name": "tokenA",
            "type": "pubkey"
          },
          {
            "name": "tokenB",
            "type": "pubkey"
          },
          {
            "name": "marketStatus",
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "tokenAAmount",
            "type": "u64"
          },
          {
            "name": "tokenBAmount",
            "type": "u64"
          },
          {
            "name": "tokenPriceA",
            "type": "u64"
          },
          {
            "name": "tokenPriceB",
            "type": "u64"
          },
          {
            "name": "totalReserve",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "quest",
            "type": "i64"
          },
          {
            "name": "value",
            "type": "f64"
          },
          {
            "name": "range",
            "type": "u8"
          },
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "tokenPrice",
            "type": "u64"
          },
          {
            "name": "marketId",
            "type": "string"
          },
          {
            "name": "nameA",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "nameB",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "symbolA",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "symbolB",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "urlA",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "urlB",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "marketStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "prepare"
          },
          {
            "name": "active"
          },
          {
            "name": "finished"
          }
        ]
      }
    },
    {
      "name": "marketStatusUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "pubkey"
          },
          {
            "name": "marketStatus",
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "oracleResUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracleRes",
            "type": "f64"
          }
        ]
      }
    }
  ]
};
