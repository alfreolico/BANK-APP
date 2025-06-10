import 'reflect-metadata';
import { envs } from './config';
import { AppDataSource } from './data/postgres/postgres-database';
import { AppRoutes } from './routes';
import { Server } from './server';

(async () => {
  await main();
})();

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database successfully connectede');

    const server = new Server({
      port: envs.PORT as number,
      routes: AppRoutes.routes,
    });

    await server.start();
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
}
