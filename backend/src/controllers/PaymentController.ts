import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';

const quoteRequiredMessage =
  'Online payments are paused until Shree Durga Tiles confirms delivery charges and applicable taxes in a quote.';

export class PaymentController {
  static async createOrder(_req: AuthRequest, res: Response): Promise<Response> {
    return res.status(503).json({
      success: false,
      message: quoteRequiredMessage,
    });
  }

  static async verify(_req: AuthRequest, res: Response): Promise<Response> {
    return res.status(503).json({
      success: false,
      message: quoteRequiredMessage,
    });
  }
}

export default PaymentController;
