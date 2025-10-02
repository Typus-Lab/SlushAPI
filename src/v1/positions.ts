import { Router, Request, Response } from "express";
import { TypusConfig } from "@typus/typus-sdk/dist/src/utils";
import { getLpPool, getUserStake, getUserStakeById, TLP_TOKEN } from "@typus/typus-perp-sdk";

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

  if (stakes) {
    const pendingRewards = Number(stakes[1][0]);
    const harvestedRewards = Number(stakes[0].u64Padding[3]);

    const positions = {
      positions: [
        {
          id: stakes[0].userShareId.toString(),
          strategyId: "tlp",
          type: "PositionV1",
          principal: {
            coinType: TLP_TOKEN,
            amount: stakes[0].totalShares.toString(),
            valueUsd: toUsd(stakes[0].totalShares, tlp_price),
          },
          pendingRewards: [
            {
              coinType: TLP_TOKEN,
              amount: pendingRewards.toString(),
              valueUsd: toUsd(pendingRewards, tlp_price),
            },
          ],
          totalRewards: [
            {
              coinType: TLP_TOKEN,
              amount: (pendingRewards + harvestedRewards).toString(),
              valueUsd: toUsd(pendingRewards + harvestedRewards, tlp_price),
            },
          ],
          url: `https://us-central1-aqueous-freedom-378103.cloudfunctions.net/api/positions/${stakes[0].userShareId}`,
        },
      ],
    };
    res.status(200).json(positions);
  }
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

  const config = await TypusConfig.default("MAINNET", null);
  const stakes = await getUserStakeById(config, positionId);
  const lpPool = await getLpPool(config);
  const tlp_price = Number(lpPool.poolInfo.tvlUsd) / Number(lpPool.poolInfo.totalShareSupply);

  if (stakes) {
    const pendingRewards = Number(stakes[1][0]);
    const harvestedRewards = Number(stakes[0].u64Padding[3]);

    const position = {
      position: {
        id: stakes[0].userShareId.toString(),
        strategyId: "tlp",
        type: "PositionV1",
        principal: {
          coinType: TLP_TOKEN,
          amount: stakes[0].totalShares.toString(),
          valueUsd: toUsd(stakes[0].totalShares, tlp_price),
        },
        pendingRewards: [
          {
            coinType: TLP_TOKEN,
            amount: pendingRewards.toString(),
            valueUsd: toUsd(pendingRewards, tlp_price),
          },
        ],
        totalRewards: [
          {
            coinType: TLP_TOKEN,
            amount: (pendingRewards + harvestedRewards).toString(),
            valueUsd: toUsd(pendingRewards + harvestedRewards, tlp_price),
          },
        ],
        url: `https://us-central1-aqueous-freedom-378103.cloudfunctions.net/api/positions/${stakes[0].userShareId}`,
      },
    };
    res.status(200).json(position);
  }
});

export default router;

function toUsd(x: BigInt | string | number, tlp_price: number): number {
  return (Number(x) * tlp_price) / 10 ** 9;
}
