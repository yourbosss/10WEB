import { RabbitMQService } from './src/sevices/rabbitmq.ts';
import { handleUserMessage } from './src/controllers/userMessageHandler';

const QUEUE = 'user-service';
const ROUTING_KEY = 'user-service-routing';

const rabbitMQ = new RabbitMQService();

export const startUserConsumer = async () => {
  try {
    await rabbitMQ.connect();
  
    await rabbitMQ.consume(QUEUE, ROUTING_KEY, handleUserMessage);
    
    console.log(`User-service consumer started. Listening to queue: ${QUEUE} with routing key: ${ROUTING_KEY}`);
  } catch (error) {
    console.error('Failed to start user consumer:', error);
    throw error;
  }
};