import amqp from "amqplib";
import logger from "./config/logger.js";

let channel;

export const connectRabbitMQ = async () => {
  while (true) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      await channel.assertExchange("order_created_exchange", "fanout", {
        durable: false
      });

      logger.info("RabbitMQ connected ✅");
      break;
    } catch (error) {
      logger.error(`RabbitMQ not ready, retrying in 5 seconds... ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

export const publishEvent = (event) => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  channel.publish(
    "order_created_exchange",
    "",
    Buffer.from(JSON.stringify(event))
  );
};