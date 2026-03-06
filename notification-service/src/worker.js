import amqp from "amqplib";

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

      console.log("📧 Notification Service connected");
      console.log("Waiting for order events...");

      channel.consume(q.queue, (msg) => {
        const order = JSON.parse(msg.content.toString());

        console.log("📨 Sending order confirmation email...");
        console.log(`Order ID: ${order.orderId}`);
        console.log(`User ID: ${order.userId}`);
        console.log(`Amount: ${order.totalAmount}`);

        channel.ack(msg);
      });

      break;

    } catch (err) {
      console.log("RabbitMQ not ready, retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

connectRabbitMQ();