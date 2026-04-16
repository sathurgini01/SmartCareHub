const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

async function bootstrap() {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`doctor-service running on port ${env.port}`);
  });
}

bootstrap();
