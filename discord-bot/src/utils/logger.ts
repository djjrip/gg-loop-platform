const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    info(message: string, ...args: any[]) {
        console.log(
            `${colors.bright}${colors.cyan}[INFO]${colors.reset} ${this.getTimestamp()} - ${message}`,
            ...args
        );
    }

    warn(message: string, ...args: any[]) {
        console.warn(
            `${colors.bright}${colors.yellow}[WARN]${colors.reset} ${this.getTimestamp()} - ${message}`,
            ...args
        );
    }

    error(message: string, ...args: any[]) {
        console.error(
            `${colors.bright}${colors.red}[ERROR]${colors.reset} ${this.getTimestamp()} - ${message}`,
            ...args
        );
    }

    success(message: string, ...args: any[]) {
        console.log(
            `${colors.bright}${colors.green}[SUCCESS]${colors.reset} ${this.getTimestamp()} - ${message}`,
            ...args
        );
    }

    debug(message: string, ...args: any[]) {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `${colors.magenta}[DEBUG]${colors.reset} ${this.getTimestamp()} - ${message}`,
                ...args
            );
        }
    }
}

export const logger = new Logger();
