import amqp, { ChannelModel, Channel, ConsumeMessage } from 'amqplib';

export class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly exchangeName: string;

  constructor(
    url: string = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
    exchangeName: string = 'app-exchange'
  ) {
    this.url = url;
    this.exchangeName = exchangeName;
  }

  public async connect(): Promise<void> {
    if (this.connection) {
      await this.close();
    }

    this.connection = await amqp.connect(this.url);

    if (!this.connection) {
      throw new Error('Failed to establish RabbitMQ connection');
    }

    this.channel = await this.connection.createChannel();

    if (!this.channel) {
      throw new Error('Failed to create RabbitMQ channel');
    }

    await this.channel.assertExchange(this.exchangeName, 'direct', { durable: true });

    this.connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      this.connection = null;
    });

    this.connection.on('close', () => {
      console.warn('RabbitMQ connection closed');
      this.connection = null;
      this.channel = null;
    });

    this.channel.on('error', (err) => {
      console.error('RabbitMQ channel error:', err);
      this.channel = null;
    });

    this.channel.on('close', () => {
      console.warn('RabbitMQ channel closed');
      this.channel = null;
    });

    console.log('RabbitMQ connected and channel created');
  }

  private getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    return this.channel;
  }

  public async publish(routingKey: string, message: object): Promise<boolean> {
    if (!this.channel) {
      await this.connect();
    }
    const channel = this.getChannel();

    const buffer = Buffer.from(JSON.stringify(message));
    return channel.publish(this.exchangeName, routingKey, buffer, { persistent: true });
  }

  public async consume(
    queue: string,
    routingKey: string,
    handler: (msg: ConsumeMessage) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const channel = this.getChannel();

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, this.exchangeName, routingKey);

    await channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        try {
          await handler(msg);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing RabbitMQ message:', error);
          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  }

  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
