import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { sendToMonitoring } from "../lib/utils/monitoring";
import { redactSensitiveFields } from "../lib/helper";

const logFile = path.join(__dirname, "../../logs/app.log");

function logToFile(data: object) {
  fs.appendFileSync(logFile, JSON.stringify(data) + "\n");
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();
  const requestId = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const safeBody = redactSensitiveFields(req.body);
  const timeRequest = new Date().toISOString()
  const url = req.originalUrl
  const body= safeBody
  const method = req.method

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = diff[0] * 1000 + diff[1] / 1e6;

    const logRequest = {
      timeRequest,
      url,
      body,
      method,
      timeResponse: new Date().toISOString(),
      level: durationMs > 1000 ? "warn" : "info",
      requestId,
      status: res.statusCode,
      durationMs,
    };

    logToFile(logRequest);
    sendToMonitoring(logRequest);
  });

  next();
}
