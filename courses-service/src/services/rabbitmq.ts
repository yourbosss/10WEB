import * as amqp from 'amqplib';

interface IRabbitMQConnection {
  createChannel(): Promise<IRabbitMQChannel>;
  close(): Promise<void>;
  on(event: 'error' | 'close', listener: (err?: Error) => void): this;
}

interface IRabbitMQChannel {
  assertExchange(exchange: string, type: string, options?: object): Promise<void>;
  assertQueue(queue: string, options?: object): Promise<void>;
  bindQueue(queue: string, exchange: string, pattern: string): Promise<void>;
  consume(queue: string, onMessage: (msg: any) => void, options?: object): Promise<void>;
  publish(exchange: string, routingKey: string, content: Buffer, options?: object): boolean;
  ack(message: any): void;
  nack(message: any, allUpTo?: boolean, requeue?: boolean): void;
  close(): Promise<void>;
  on(event: 'error' | 'close', listener: (err?: Error) => void): this;
}

export class RabbitMQService {
  private connection: IRabbitMQConnection | null = null;
  private channel: IRabbitMQChannel | null = null;
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

    const connUnknown: unknown = await amqp.connect(this.url);

    if (!this.isConnection(connUnknown)) {
      throw new Error('Failed to establish RabbitMQ connection with required interface');
    }

    this.connection = connUnknown;

    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'direct', { durable: true });

    this.connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      this.connection = null;
      this.channel = null;
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

  private isConnection(obj: unknown): obj is IRabbitMQConnection {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'createChannel' in obj &&
      typeof (obj as any).createChannel === 'function' &&
      'close' in obj &&
      typeof (obj as any).close === 'function' &&
      'on' in obj &&
      typeof (obj as any).on === 'function'
    );
  }

  private getChannel(): IRabbitMQChannel {
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
    handler: (msg: any) => Promise<void>
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