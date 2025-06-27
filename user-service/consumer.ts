import { consumeQueue } from './services/rabbitmq';
import { handleUserMessage } from './controllers/userMessageHandler';

const QUEUE = 'user-service';
const ROUTING_KEY = 'user-service-routing';

export const startUserConsumer = async () => {
  await consumeQueue(QUEUE, ROUTING_KEY, handleUserMessage);
  console.log('User-service consumer запущен');
};
