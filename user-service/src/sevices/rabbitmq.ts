import amqp, { ConsumeMessage } from 'amqplib';

export class RabbitMQService {
  private connection: any = null; 
  private channel: any = null;   
  private readonly url: string;
  private readonly exchangeName: string;

  constructor(
    url: string = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
    exchangeName: string = 'app-exchange'
  ) {
    this.url = url;
    this.exchangeName = exchangeName;
  }

  private async createConnection(): Promise<void> {
    if (this.connection) {
      await this.closeConnection();
    }
    this.connection = await amqp.connect(this.url);

    if (!this.connection) {
      throw new Error('Failed to establish connection with RabbitMQ');
    }

    this.connection.on('error', (err: any) => {
      console.error('RabbitMQ connection error:', err);
      this.connection = null;
    });
    this.connection.on('close', () => {
      console.warn('RabbitMQ connection closed');
      this.connection = null;
      this.channel = null;
    });
  }

  private async createChannel(): Promise<void> {
    if (!this.connection) {
      throw new Error('No active connection to create channel');
    }
    this.channel = await this.connection.createChannel();

    if (!this.channel) {
      throw new Error('Failed to create RabbitMQ channel');
    }

    await this.channel.assertExchange(this.exchangeName, 'direct', { durable: true });

    this.channel.on('error', (err: any) => {
      console.error('RabbitMQ channel error:', err);
      this.channel = null;
    });
    this.channel.on('close', () => {
      console.warn('RabbitMQ channel closed');
      this.channel = null;
    });
  }

  public async connect(): Promise<void> {
    await this.createConnection();
    await this.createChannel();
    console.log('RabbitMQ connected and channel created');
  }

  public async publish(routingKey: string, message: object): Promise<boolean> {
    if (!this.channel) {
      await this.connect();
      if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    }
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(this.exchangeName, routingKey, buffer, { persistent: true });
  }

  public async consume(
    queue: string,
    routingKey: string,
    handler: (msg: ConsumeMessage) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      await this.connect();
      if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    }

    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, this.exchangeName, routingKey);

    await this.channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          await handler(msg);
          this.channel.ack(msg);
        } catch (err) {
          console.error('Message processing error:', err);
          this.channel.nack(msg, false, true); // retry
        }
      },
      { noAck: false }
    );
  }

  public async closeChannel(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
      console.log('RabbitMQ channel closed');
    }
  }

  public async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      console.log('RabbitMQ connection closed');
    }
  }

  public async close(): Promise<void> {
    await this.closeChannel();
    await this.closeConnection();
  }

  public isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}