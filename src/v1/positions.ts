import { Router, Request, Response } from "express";

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
router.get("/positions", (req: Request, res: Response) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).send("Missing address query parameter");
  }
  // Mock data based on openapi.json
  const mockPositions = {
    positions: [
      {
        id: "position-1",
        strategyId: "strategy-1",
        type: "PositionV1",
        principal: [{ coinType: "0x2::sui::SUI", amount: "5000000", valueUsd: 500.5 }],
        pendingRewards: [{ coinType: "0x2::sui::SUI", amount: "100000", valueUsd: 10.01 }],
        totalRewards: [{ coinType: "0x2::sui::SUI", amount: "150000", valueUsd: 15.01 }],
        url: "https://partner.example/positions/position-1",
      },
    ],
  };
  res.status(200).json(mockPositions);
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
router.get("/positions/:positionId", (req: Request, res: Response) => {
  const { positionId } = req.params;
  // Mock data based on openapi.json
  const mockPosition = {
    position: {
      id: positionId,
      strategyId: "strategy-1",
      type: "PositionV1",
      principal: [{ coinType: "0x2::sui::SUI", amount: "5000000", valueUsd: 500.5 }],
      pendingRewards: [{ coinType: "0x2::sui::SUI", amount: "100000", valueUsd: 10.01 }],
      totalRewards: [{ coinType: "0x2::sui::SUI", amount: "150000", valueUsd: 15.01 }],
      url: `https://partner.example/positions/${positionId}`,
    },
  };
  res.status(200).json(mockPosition);
});

export default router;
