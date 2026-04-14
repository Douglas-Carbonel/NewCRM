import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.path}` });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: err.message });
}
