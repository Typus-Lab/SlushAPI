import { Router, Request, Response } from "express";
import { createPythClient, TypusConfig } from "@typus/typus-sdk/dist/src/utils";
import { getLpPools, getStakePool, getUserStake, mintStakeLp, TLP_TOKEN } from "@typus/typus-perp-sdk";
import { SuiClient } from "@mysten/sui/client";
import { TOKEN, typeArgToAsset } from "@typus/typus-sdk/dist/src/constants";
import { Transaction } from "@mysten/sui/transactions";

const router = Router();

/**
 * @openapi
 * /v1/deposit:
 *   post:
 *     tags:
 *       - transactions
 *     summary: Create deposit transaction
 *     operationId: transactions.createDeposit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositRequest'
 *     responses:
 *       '200':
 *         description: DepositResponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepositResponse'
 *       '422':
 *         description: Error that occurred during transaction building
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionBuildError'
 */
router.post("/deposit", async (req: Request, res: Response) => {
  const { strategyId, senderAddress, coinType, nativeAmount } = req.body;

  if (!strategyId || !senderAddress || !coinType || !nativeAmount) {
    return res.status(422).json({
      _tag: "TransactionBuildError",
      message: "Missing required fields in deposit request",
    });
  }

  let config = await TypusConfig.default("MAINNET", null);
  let provider = new SuiClient({ url: config.rpcEndpoint });

  let lpPools = await getLpPools(config);
  let lpPool = lpPools[0];
  // console.log(lpPool);

  let stakePool = await getStakePool(config);
  // console.log(stakePool);

  let stakes = await getUserStake(config, senderAddress);
  // console.log(stakes);

  let pythClient = createPythClient(provider, "MAINNET");

  let cTOKEN: TOKEN = typeArgToAsset(coinType);

  let coins = (
    await provider.getCoins({
      owner: senderAddress,
      coinType,
    })
  ).data.map((coin) => coin.coinObjectId);
  // console.log(coins.length);

  let tx = new Transaction();

  tx = await mintStakeLp(config, tx, pythClient, {
    lpPool,
    stakePool,
    coins,
    cTOKEN,
    amount: nativeAmount,
    user: senderAddress,
    stake: true,
    userShareId: stakes ? stakes[0].userShareId.toString() : null,
    isAutoCompound: true,
  });

  let dryrunRes = await provider.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: senderAddress,
  });
  // console.log(dryrunRes);
  const MintLpEvent = dryrunRes.events.find((e) => e.type.endsWith("MintLpEvent"));
  const StakeEvent = dryrunRes.events.find((e) => e.type.endsWith("StakeEvent"));
  console.log(MintLpEvent);
  console.log(StakeEvent);

  let bytes = await tx.build({
    client: provider,
  });
  // console.log(bytes);

  // Mock data based on openapi.json
  const mockDepositResponse = {
    bytes: Array.from(bytes),
    fees: [],
    netDeposit: {
      coinType: TLP_TOKEN,
      amount: (MintLpEvent?.parsedJson as any)?.minted_lp_amount,
      valueUsd: (MintLpEvent?.parsedJson as any)?.deposit_amount_usd,
    },
  };
  res.status(200).json(mockDepositResponse);
});

/**
 * @openapi
 * /v1/withdraw:
 *   post:
 *     tags:
 *       - transactions
 *     summary: Create withdrawal transaction
 *     operationId: transactions.createWithdraw
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawRequest'
 *     responses:
 *       '200':
 *         description: WithdrawResponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawResponse'
 *       '422':
 *         description: Error that occurred during transaction building
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionBuildError'
 */
router.post("/withdraw", (req: Request, res: Response) => {
  const { positionId, senderAddress, principal, mode } = req.body;

  if (!positionId || !senderAddress || !principal || !principal.coinType || !principal.amount || !mode) {
    return res.status(422).json({
      _tag: "TransactionBuildError",
      message: "Missing or invalid fields in withdraw request",
    });
  }

  // Mock data based on openapi.json
  const mockWithdrawResponse = {
    bytes: "base64-encoded-transaction-bytes",
    principal: { coinType: "0x2::sui::SUI", amount: "2500000", valueUsd: 250.25 },
    rewards: [{ coinType: "0x2::sui::SUI", amount: "50000", valueUsd: 5.0 }],
    fees: [{ coinType: "0x2::sui::SUI", amount: "1000", valueUsd: 0.1 }],
  };
  res.status(200).json(mockWithdrawResponse);
});

export default router;
