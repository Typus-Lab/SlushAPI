import { Router, Request, Response } from "express";
import { createPythClient, TypusConfig } from "@typus/typus-sdk/dist/src/utils";
import {
  claim,
  getLpPools,
  getStakePool,
  getUserStake,
  mintStakeLp,
  TLP_TOKEN,
  unstakeRedeem,
} from "@typus/typus-perp-sdk";
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
  // console.log(MintLpEvent);
  // console.log(StakeEvent);

  let bytes = await tx.build({
    client: provider,
  });
  // console.log(bytes);

  const depositResponse = {
    bytes: Array.from(bytes),
    fees: [],
    netDeposit: {
      coinType: TLP_TOKEN,
      amount: (MintLpEvent?.parsedJson as any)?.minted_lp_amount,
      valueUsd: Number((MintLpEvent?.parsedJson as any)?.deposit_amount_usd) / 10 ** 9,
    },
  };
  res.status(200).json(depositResponse);
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
router.post("/withdraw", async (req: Request, res: Response) => {
  const { positionId, senderAddress, principal, mode } = req.body;

  if (!positionId || !senderAddress || !principal || !principal.coinType || !principal.amount || !mode) {
    return res.status(422).json({
      _tag: "TransactionBuildError",
      message: "Missing or invalid fields in withdraw request",
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

  let cTOKEN: TOKEN = typeArgToAsset(principal.coinType);

  let tx = new Transaction();

  await unstakeRedeem(config, tx, pythClient, {
    userShareId: stakes![0].userShareId.toString(),
    lpPool,
    stakePool,
    share: principal.amount,
    user: senderAddress,
  });

  await claim(config, tx, pythClient, {
    lpPool,
    stakePool,
    cTOKEN,
    user: senderAddress,
  });

  let dryrunRes = await provider.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: senderAddress,
  });
  // console.log(dryrunRes);
  const RedeemEvent = dryrunRes.events.find((e) => e.type.endsWith("RedeemEvent"));
  const BurnLpEvent = dryrunRes.events.find((e) => e.type.endsWith("BurnLpEvent"));

  console.log(RedeemEvent);
  console.log(BurnLpEvent);

  if (RedeemEvent && BurnLpEvent) {
    let bytes = await tx.build({
      client: provider,
    });
    // console.log(bytes);

    const RedeemEventJson = RedeemEvent.parsedJson as any;
    const BurnLpEventJson = BurnLpEvent.parsedJson as any;

    const withdrawTotalUsd = Number(BurnLpEventJson.burn_amount_usd) / 10 ** 9;
    const withdrawFeeUsd = Number(BurnLpEventJson.burn_fee_usd) / 10 ** 9;
    const withdrawUsd = withdrawTotalUsd - withdrawFeeUsd;

    const withdrawAmount = Number(BurnLpEventJson.withdraw_token_amount);
    const withdrawTokenPrice = withdrawUsd / withdrawAmount;
    const withdrawFee = Math.round(withdrawFeeUsd / withdrawTokenPrice);

    const withdrawResponse = {
      bytes: Array.from(bytes),
      principal: {
        coinType: BurnLpEventJson.liquidity_token_type.name,
        amount: withdrawAmount,
        valueUsd: withdrawUsd,
      },
      rewards: [],
      fees: [
        {
          coinType: principal.coinType,
          amount: withdrawFee,
          valueUsd: withdrawFeeUsd,
        },
      ],
    };

    res.status(200).json(withdrawResponse);
  }
});

export default router;

function toUsd(x: BigInt | string | number, tlp_price: number): number {
  return (Number(x) * tlp_price) / 10 ** 9;
}
