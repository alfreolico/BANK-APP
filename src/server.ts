import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './presentation/common/middleware/error-handler';
import { logger, logInfo } from './utils/logger';
import { NotFoundError } from './presentation/common/errors';

interface Options {
  port: number;
  routes: any;
}

export class Server {
  public readonly app: Application = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly routes: any;

  constructor(options: Options) {
    const { port, routes } = options;
    this.port = port;
    this.routes = routes;
  }

  async start() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    this.app.use((req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger.log(logLevel, 'HTTP Request', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
      });

      next();
    });

    this.app.use(this.routes);

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    this.app.use('*', (req, res, next) => {
      const error = new NotFoundError(
        `Endpoint ${req.method} ${req.path} not found`,
        {
          method: req.method,
          path: req.path,
          ip: req.ip,
        }
      );
      next(error);
    });

    this.app.use(errorHandler);

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', {
        reason: reason,
        promise: promise,
      });
      process.exit(1);
    });

    this.serverListener = this.app.listen(this.port, () => {
      console.log(
        `info: Server started on port ${this.port} ${new Date()
          .toISOString()
          .replace('T', ' ')
          .slice(0, 19)}`
      );
      console.log(`🚀 Server started in http://localhost:${this.port}`);
      console.log(
        `📊 Health check available en http://localhost:${this.port}/health`
      );
    });
  }

  public close() {
    this.serverListener?.close();
  }
}
