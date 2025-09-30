import { Router, Request, Response } from "express";
import { TypusConfig } from "@typus/typus-sdk/dist/src/utils";
import { getLpPool, getStakePool, getUserStake, NETWORK, TLP_TOKEN } from "@typus/typus-perp-sdk";
import { getTotalVolumeFromSentio } from "@typus/typus-perp-sdk/dist/src/api/sentio";

const router = Router();

/**
 * @openapi
 * /v1/strategies:
 *   get:
 *     tags:
 *       - strategies
 *     summary: List all strategies
 *     operationId: strategies.listStrategies
 *     responses:
 *       '200':
 *         description: ListStrategiesResponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListStrategiesResponse'
 */
router.get("/strategies", async (req: Request, res: Response) => {
  const config = await TypusConfig.default("MAINNET", null);
  const lpPool = await getLpPool(config);
  // const tlp_price = Number(lpPool.poolInfo.tvlUsd) / Number(lpPool.poolInfo.totalShareSupply);
  const stakePool = await getStakePool(config);
  const tvlUsd = Number(lpPool.poolInfo.tvlUsd) / 10 ** 9;

  let incentive_ratio =
    Number(stakePool.incentives[0].config.periodIncentiveAmount) / Number(stakePool.poolInfo.totalShare);
  // console.log(incentive_ratio);
  let times = (365 * 24 * 3600 * 1000) / Number(stakePool.incentives[0].config.incentiveIntervalTsMs);
  let incentive_apr = incentive_ratio * times;

  const now = Math.round(Date.now() / 1000);

  const { avg1h_fee_apr, avg24h_fee_apr, avg7d_fee_apr, avg30d_fee_apr } = await getTlpAprFromSentio(
    now,
    tvlUsd
  );

  const volume24hUsd = await getTotalVolumeFromSentio(now - 3600 * 24, now);

  const strategies = {
    strategies: [
      {
        id: "tlp",
        type: "StrategyV1",
        strategyType: "VAULT",
        coinType: "0xe27969a70f93034de9ce16e6ad661b480324574e68d15a64b513fd90eb2423e5::tlp::TLP",
        minDeposit: [
          {
            coinType: "0xe27969a70f93034de9ce16e6ad661b480324574e68d15a64b513fd90eb2423e5::tlp::TLP",
            amount: "1000000000",
          },
        ],
        apy: {
          current: avg1h_fee_apr + incentive_apr,
          avg24h: avg24h_fee_apr + incentive_apr,
          avg7d: avg7d_fee_apr + incentive_apr,
          avg30d: avg30d_fee_apr + incentive_apr,
        },
        depositorsCount: 123, // TODO
        tvlUsd: tvlUsd,
        volume24hUsd: volume24hUsd,
        fees: {
          depositBps: "0",
          withdrawBps: "10",
        },
      },
    ],
  };
  res.status(200).json(strategies);
});

/**
 * @openapi
 * /v1/strategies/{strategyId}:
 *   get:
 *     tags:
 *       - strategies
 *     summary: Get strategy details
 *     operationId: strategies.getStrategy
 *     parameters:
 *       - name: strategyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Strategy identifier
 *     responses:
 *       '200':
 *         description: GetStrategyResponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetStrategyResponse'
 */
router.get("/strategies/:strategyId", async (req: Request, res: Response) => {
  const { strategyId } = req.params;
  // Mock data based on openapi.json

  const config = await TypusConfig.default("MAINNET", null);
  const lpPool = await getLpPool(config);
  // const tlp_price = Number(lpPool.poolInfo.tvlUsd) / Number(lpPool.poolInfo.totalShareSupply);
  const stakePool = await getStakePool(config);
  const tvlUsd = Number(lpPool.poolInfo.tvlUsd) / 10 ** 9;

  let incentive_ratio =
    Number(stakePool.incentives[0].config.periodIncentiveAmount) / Number(stakePool.poolInfo.totalShare);
  // console.log(incentive_ratio);
  let times = (365 * 24 * 3600 * 1000) / Number(stakePool.incentives[0].config.incentiveIntervalTsMs);
  let incentive_apr = incentive_ratio * times;

  const now = Math.round(Date.now() / 1000);

  const { avg1h_fee_apr, avg24h_fee_apr, avg7d_fee_apr, avg30d_fee_apr } = await getTlpAprFromSentio(
    now,
    tvlUsd
  );

  const volume24hUsd = await getTotalVolumeFromSentio(now - 3600 * 24, now);

  const strategy = {
    strategy: {
      id: "tlp",
      type: "StrategyV1",
      strategyType: "VAULT",
      coinType: "0xe27969a70f93034de9ce16e6ad661b480324574e68d15a64b513fd90eb2423e5::tlp::TLP",
      minDeposit: [
        {
          coinType: "0xe27969a70f93034de9ce16e6ad661b480324574e68d15a64b513fd90eb2423e5::tlp::TLP",
          amount: "1000000000",
        },
      ],
      apy: {
        current: avg1h_fee_apr + incentive_apr,
        avg24h: avg24h_fee_apr + incentive_apr,
        avg7d: avg7d_fee_apr + incentive_apr,
        avg30d: avg30d_fee_apr + incentive_apr,
      },
      depositorsCount: 123, // TODO
      tvlUsd: tvlUsd,
      volume24hUsd: volume24hUsd,
      fees: {
        depositBps: "0",
        withdrawBps: "10",
      },
    },
  };

  res.status(200).json(strategy);
});

export default router;

async function getTlpAprFromSentio(now: number, tvlUsd: number) {
  let apiUrl = "https://app.sentio.xyz/api/v1/insights/typus/typus_perp_mainnet/query";
  let requestData = {
    timeRange: {
      start: `${now - 3600 * 24 * 30}`,
      end: `${now}`,
      step: 3600,
    },
    limit: 24 * 30,
    queries: [
      {
        metricsQuery: {
          query: "tlp_fee_usd",
          alias: "",
          id: "a",
          labelSelector: {},
          aggregate: {
            op: "SUM",
            grouping: [],
          },
          functions: [],
          disabled: false,
        },
        dataSource: "METRICS",
        sourceName: "",
      },
    ],
    formulas: [],
  };
  let jsonData = JSON.stringify(requestData);

  const headers = {
    "api-key": "ffJa6FwxeJNrQP8NZ5doEMXqdSA7XM6mT",
    "Content-Type": "application/json",
  };

  let response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: jsonData,
  });

  let data = await response.json();
  // console.log(data);
  // console.log(data.results[0].matrix.samples[0].values.length); // 721

  let values = data.results[0].matrix.samples[0].values;
  // console.log(values);
  // console.log(values.at(-1));
  // console.log(values.at(-2));
  // console.log(values.at(-1 - 24));
  // console.log(values.at(-1 - 24 * 7));
  // console.log(values.at(0));

  let avg1h_fee_apr = ((values.at(-1).value - values.at(-2).value) * 365 * 24) / tvlUsd;
  let avg24h_fee_apr = ((values.at(-1).value - values.at(-1 - 24).value) * 365) / tvlUsd;
  let avg7d_fee_apr = ((values.at(-1).value - values.at(-1 - 24 * 7).value) * 365) / 7 / tvlUsd;
  let avg30d_fee_apr = ((values.at(-1).value - values.at(0).value) * 365) / 30 / tvlUsd;

  return {
    avg1h_fee_apr,
    avg24h_fee_apr,
    avg7d_fee_apr,
    avg30d_fee_apr,
  };
}

getTlpAprFromSentio(Math.round(Date.now() / 1000), 1);
