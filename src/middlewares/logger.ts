import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { sendToMonitoring } from "../utils/monitoring"; 

const logFile = path.join(__dirname, "../../logs/app.log");

function logToFile(data: object) {
  fs.appendFileSync(logFile, JSON.stringify(data) + "\n");
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();
  const requestId = Date.now() + "-" + Math.random().toString(36).slice(2, 8);

  const safeBody = { ...req.body };
  ["password", "token", "creditCard"].forEach((field) => {
    if (safeBody[field as keyof typeof safeBody]) {
      safeBody[field as keyof typeof safeBody] = "***REDACTED***";
    }
  });

  const logRequest = {
    timestamp: new Date().toISOString(),
    level: "info",
    requestId,
    method: req.method,
    url: req.originalUrl,
    body: safeBody,
  };

  logToFile(logRequest);
  sendToMonitoring(logRequest);

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = diff[0] * 1000 + diff[1] / 1e6;

    const logResponse = {
      timestamp: new Date().toISOString(),
      level: durationMs > 1000 ? "warn" : "info",
      requestId,
      status: res.statusCode,
      durationMs,
    };

    logToFile(logResponse);
    sendToMonitoring(logResponse);
  });

  next();
}
