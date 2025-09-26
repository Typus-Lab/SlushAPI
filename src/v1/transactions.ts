import { Router, Request, Response } from 'express';

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
router.post('/deposit', (req: Request, res: Response) => {
    const { strategyId, senderAddress, coinType, nativeAmount } = req.body;

    if (!strategyId || !senderAddress || !coinType || !nativeAmount) {
        return res.status(422).json({
            _tag: "TransactionBuildError",
            message: "Missing required fields in deposit request"
        });
    }

    // Mock data based on openapi.json
    const mockDepositResponse = {
        bytes: "base64-encoded-transaction-bytes",
        fees: [{ coinType: "0x2::sui::SUI", amount: "1000", valueUsd: 0.10 }],
        netDeposit: {
            coinType: coinType,
            amount: nativeAmount,
            valueUsd: parseFloat(nativeAmount) / 1000000 // Example conversion
        }
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
router.post('/withdraw', (req: Request, res: Response) => {
    const { positionId, senderAddress, percentage, mode } = req.body;

    if (!positionId || !senderAddress || typeof percentage !== 'number' || !mode) {
         return res.status(422).json({
            _tag: "TransactionBuildError",
            message: "Missing or invalid fields in withdraw request"
        });
    }

    // Mock data based on openapi.json
    const mockWithdrawResponse = {
        bytes: "base64-encoded-transaction-bytes",
        principal: [{ coinType: "0x2::sui::SUI", amount: "2500000", valueUsd: 250.25 }],
        rewards: [{ coinType: "0x2::sui::SUI", amount: "50000", valueUsd: 5.00 }],
        fees: [{ coinType: "0x2::sui::SUI", amount: "1000", valueUsd: 0.10 }]
    };
    res.status(200).json(mockWithdrawResponse);
});

export default router;