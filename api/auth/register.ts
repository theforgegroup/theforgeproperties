import { Request, Response } from 'express';
import { register } from '../../controllers/authController';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  return register(req, res);
}
