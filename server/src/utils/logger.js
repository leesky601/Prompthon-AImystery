// Simple logger implementation without Winston for Windows compatibility
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors for console
const colors = {
  error: '\x1b[31m', // red
  warn: '\x1b[33m',  // yellow
  info: '\x1b[32m',  // green
  http: '\x1b[35m',  // magenta
  debug: '\x1b[34m', // blue
  reset: '\x1b[0m'   // reset
};

class SimpleLogger {
  constructor() {
    this.logDir = join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`.trim();
  }

  writeToFile(filename, message) {
    const filePath = join(this.logDir, filename);
    fs.appendFileSync(filePath, message + '\n', 'utf8');
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with color
    const color = colors[level] || colors.reset;
    console.log(`${color}${formattedMessage}${colors.reset}`);
    
    // File output
    this.writeToFile('combined.log', formattedMessage);
    
    if (level === 'error') {
      this.writeToFile('error.log', formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  http(message, meta = {}) {
    this.log('http', message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }
}

// Export singleton instance
const logger = new SimpleLogger();
export default logger;