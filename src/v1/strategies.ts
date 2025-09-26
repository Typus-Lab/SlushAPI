import { Router, Request, Response } from "express";

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
router.get("/strategies", (req: Request, res: Response) => {
  // Mock data based on openapi.json
  const mockStrategies = {
    strategies: [
      {
        id: "strategy-1",
        type: "StrategyV1",
        strategyType: "VAULT",
        coinType: "0x2::sui::SUI",
        minDeposit: [{ coinType: "0x2::sui::SUI", amount: "1000000" }],
        apy: {
          current: 0.05,
          avg24h: 0.051,
          avg7d: 0.049,
          avg30d: 0.055,
        },
        depositorsCount: 123,
        tvlUsd: 1500000.75,
        volume24hUsd: 50000.25,
        fees: {
          depositBps: "10",
          withdrawBps: "20",
        },
      },
    ],
  };
  res.status(200).json(mockStrategies);
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
router.get("/strategies/:strategyId", (req: Request, res: Response) => {
  const { strategyId } = req.params;
  // Mock data based on openapi.json
  const mockStrategy = {
    strategy: {
      id: strategyId,
      type: "StrategyV1",
      strategyType: "VAULT",
      coinType: "0x2::sui::SUI",
      minDeposit: [{ coinType: "0x2::sui::SUI", amount: "1000000" }],
      apy: {
        current: 0.05,
        avg24h: 0.051,
        avg7d: 0.049,
        avg30d: 0.055,
      },
      depositorsCount: 123,
      tvlUsd: 1500000.75,
      volume24hUsd: 50000.25,
      fees: {
        depositBps: "10",
        withdrawBps: "20",
      },
    },
  };
  res.status(200).json(mockStrategy);
});

export default router;
