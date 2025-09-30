import { Router, Request, Response } from "express";
import { TypusConfig } from "@typus/typus-sdk/dist/src/utils";
import { getLpPool, getUserStake, NETWORK, TLP_TOKEN } from "@typus/typus-perp-sdk";

const router = Router();

/**
 * @openapi
 * /v1/positions:
 *   get:
 *     tags:
 *       - positions
 *     summary: List user positions
 *     operationId: positions.listPositions
 *     parameters:
 *       - name: address
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: User's wallet address
 *     responses:
 *       '200':
 *         description: ListPositionsResponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListPositionsResponse'
 */
router.get("/positions", async (req: Request, res: Response) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).send("Missing address query parameter");
  }
  const config = await TypusConfig.default("MAINNET", null);
  const stakes = await getUserStake(config, address as string);
  const lpPool = await getLpPool(config);
  const tlp_price = Number(lpPool.poolInfo.tvlUsd) / Number(lpPool.poolInfo.totalShareSupply);

  const positions = {
    positions: [
      {
        id: stakes[0][0].userShareId.toString(),
        strategyId: "tlp",
        type: "PositionV1",
        principal: {
          coinType: TLP_TOKEN,
          amount: stakes[0][0].totalShares.toString(),
          valueUsd: toUsd(stakes[0][0].totalShares, tlp_price),
        },
        pendingRewards: [
          {
            coinType: TLP_TOKEN,
            amount: stakes[0][1][0].toString(),
            valueUsd: toUsd(stakes[0][1][0], tlp_price),
          },
        ],
        totalRewards: [
          {
            coinType: TLP_TOKEN,
            amount: stakes[0][1][0].toString(),
            valueUsd: toUsd(stakes[0][1][0], tlp_price),
          },
        ],
        url: `https://partner.example/positions/${stakes[0][0].userShareId}`,
      },
    ],
  };
  res.status(200).json(positions);
});

/**
 * @openapi
 * /v1/positions/{positionId}:
 *   get:
 *     tags:
 *       - positions
 *     summary: Get position details
 *     operationId: positions.getPosition
 *     parameters:
 *       - name: positionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Position identifier
 *     responses:
 *       '200':
 *         description: GetPositionResponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetPositionResponse'
 */
router.get("/positions/:positionId", async (req: Request, res: Response) => {
  const { positionId } = req.params;
  // Mock data based on openapi.json
  const mockPosition = {
    position: {
      id: positionId,
      strategyId: "strategy-1",
      type: "PositionV1",
      principal: { coinType: "0x2::sui::SUI", amount: "5000000", valueUsd: 500.5 },
      pendingRewards: [{ coinType: "0x2::sui::SUI", amount: "100000", valueUsd: 10.01 }],
      totalRewards: [{ coinType: "0x2::sui::SUI", amount: "150000", valueUsd: 15.01 }],
      url: `https://partner.example/positions/${positionId}`,
    },
  };
  res.status(200).json(mockPosition);
});

export default router;

function toUsd(x: BigInt | string, tlp_price: number): number {
  return (Number(x) * tlp_price) / 10 ** 9;
}
