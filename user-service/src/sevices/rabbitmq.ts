import amqp, { ConsumeMessage } from 'amqplib';

export class RabbitMQService {
  private connection: any = null; // убрали тип Connection для избежания ошибок
  private channel: any = null;    // убрали тип Channel
  private readonly url: string;
  private readonly exchangeName: string;

  constructor(
    url: string = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
    exchangeName: string = 'app-exchange'
  ) {
    this.url = url;
    this.exchangeName = exchangeName;
  }

  // Подключение к RabbitMQ (только соединение)
  private async createConnection(): Promise<void> {
    if (this.connection) {
      await this.closeConnection();
    }
    this.connection = await amqp.connect(this.url);

    if (!this.connection) {
      throw new Error('Не удалось установить соединение с RabbitMQ');
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

  // Создание канала и обменника
  private async createChannel(): Promise<void> {
    if (!this.connection) {
      throw new Error('Нет активного соединения для создания канала');
    }
    this.channel = await this.connection.createChannel();

    if (!this.channel) {
      throw new Error('Не удалось создать канал RabbitMQ');
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

  // Полное подключение (соединение + канал)
  public async connect(): Promise<void> {
    await this.createConnection();
    await this.createChannel();
    console.log('RabbitMQ connected and channel created');
  }

  // Публикация сообщения с проверкой подключения
  public async publish(routingKey: string, message: object): Promise<boolean> {
    if (!this.channel) {
      await this.connect();
      if (!this.channel) throw new Error('Канал RabbitMQ не инициализирован');
    }
    const buffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(this.exchangeName, routingKey, buffer, { persistent: true });
  }

  // Подписка на очередь с обработчиком
  public async consume(
    queue: string,
    routingKey: string,
    handler: (msg: ConsumeMessage) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      await this.connect();
      if (!this.channel) throw new Error('Канал RabbitMQ не инициализирован');
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
          console.error('Ошибка обработки сообщения:', err);
          this.channel.nack(msg, false, true); // повторная попытка
        }
      },
      { noAck: false }
    );
  }

  // Закрытие канала
  public async closeChannel(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
      console.log('RabbitMQ channel closed');
    }
  }

  // Закрытие соединения
  public async closeConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      console.log('RabbitMQ connection closed');
    }
  }

  // Полное закрытие (канал + соединение)
  public async close(): Promise<void> {
    await this.closeChannel();
    await this.closeConnection();
  }

  // Проверка статуса
  public isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

