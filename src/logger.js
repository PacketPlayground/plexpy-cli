import winston from "winston";
import path from "path";

const logFile = path.join(__dirname, "../errors.log");

winston.addColors({
  error: "red"
});

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: "info",
      colorize: true
    }),
    new winston.transports.File({ filename: logFile, level: "error" })
  ]
});

export default logger;
