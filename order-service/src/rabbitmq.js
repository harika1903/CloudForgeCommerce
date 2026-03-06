import amqp from "amqplib";

let channel;

/* -------------------- Connect RabbitMQ -------------------- */

export const connectRabbitMQ = async () => {
  while (true) {
    try {
      const connection = await amqp.connect("amqp://rabbitmq");

      channel = await connection.createChannel();

      await channel.assertExchange("order_created_exchange", "fanout", {
        durable: false
      });

      console.log("RabbitMQ connected");

      break;
    } catch (error) {
      console.log("RabbitMQ not ready, retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

/* -------------------- Publish Event -------------------- */

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