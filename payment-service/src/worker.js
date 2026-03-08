import amqp from "amqplib";
import Stripe from "stripe";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const processStripePayment = async (order) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "inr",
    payment_method: "pm_card_visa",
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    metadata: {
      orderId: order.orderId,
      userId: order.userId,
    },
  });

  return {
    paymentId: paymentIntent.id,
    orderId: order.orderId,
    userId: order.userId,
    amount: order.totalAmount,
    currency: "INR",
    status: paymentIntent.status === "succeeded" ? "payment_success" : "payment_failed",
  };
};

const connectRabbitMQ = async () => {
  while (true) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();

      const exchange = "order_created_exchange";
      const queue = "payment_queue";

      await channel.assertExchange(exchange, "fanout", { durable: false });
      const q = await channel.assertQueue(queue, { durable: false });
      await channel.bindQueue(q.queue, exchange, "");

      logger.info("💳 Payment Service connected ✅");
      logger.info("Waiting for orders...");

      channel.consume(q.queue, async (msg) => {
        const order = JSON.parse(msg.content.toString());
        logger.info(`📦 Order received: ${JSON.stringify(order)}`);
        logger.info(`💰 Processing Stripe payment for order ${order.orderId}`);

        try {
          const paymentResult = await processStripePayment(order);
          logger.info(`✅ Payment result: ${JSON.stringify(paymentResult)}`);

          const paymentExchange = "payment_created_exchange";
          await channel.assertExchange(paymentExchange, "fanout", { durable: false });
          channel.publish(paymentExchange, "", Buffer.from(JSON.stringify(paymentResult)));
          logger.info(`📤 Payment event published for order ${order.orderId}`);
        } catch (err) {
          logger.error(`❌ Stripe payment failed: ${err.message}`);
          const paymentExchange = "payment_created_exchange";
          await channel.assertExchange(paymentExchange, "fanout", { durable: false });
          channel.publish(
            paymentExchange,
            "",
            Buffer.from(JSON.stringify({
              orderId: order.orderId,
              userId: order.userId,
              status: "payment_failed",
              error: err.message,
            }))
          );
        }
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