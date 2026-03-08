import amqp from "amqplib";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

const connectRabbitMQ = async () => {
  while (true) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();

      const exchange = "order_created_exchange";
      const queue = "notification_queue";

      await channel.assertExchange(exchange, "fanout", { durable: false });
      const q = await channel.assertQueue(queue, { durable: false });
      await channel.bindQueue(q.queue, exchange, "");

      logger.info("📧 Notification Service connected ✅");
      logger.info("Waiting for order events...");

      channel.consume(q.queue, (msg) => {
        const order = JSON.parse(msg.content.toString());
        logger.info(`📨 Sending order confirmation email...`);
        logger.info(`Order ID: ${order.orderId}`);
        logger.info(`User ID: ${order.userId}`);
        logger.info(`Amount: ${order.totalAmount}`);
        channel.ack(msg);
      });

      break;
    } catch (err) {
      logger.error(`RabbitMQ not ready, retrying in 5 seconds... ${err.message}`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

connectRabbitMQ();