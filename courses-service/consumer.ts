import { RabbitMQService } from './src/services/rabbitmq';
import { courseMessageHandler } from './src/controllers/courseMessageHandler';

const rabbitMQ = new RabbitMQService();

const startConsumer = async () => {
  try {
    await rabbitMQ.connect();
    await rabbitMQ.consume('course-queue', 'course-routing-key', courseMessageHandler);
    console.log('RabbitMQ consumer запущен');
  } catch (error) {
    console.error('Ошибка запуска consumer:', error);
    process.exit(1);
  }
};

startConsumer();
