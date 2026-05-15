import { Response } from 'express';

export function fmtRes(res: Response, data: any) {
  return res.status(200).json({ success: true, data: data });
}