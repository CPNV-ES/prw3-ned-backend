import type { Request, Response } from "express";

import { getSystemStatus } from "../services/health.service";

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json(getSystemStatus());
}
