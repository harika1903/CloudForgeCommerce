import amqp from "amqplib";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* -------------------- Process Payment via Stripe -------------------- */

const processStripePayment = async (order) => {
  // Convert to smallest currency unit (paise for INR)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "inr",
    payment_method: "pm_card_visa", // Stripe's built-in test payment method
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
    status:
      paymentIntent.status === "succeeded"
        ? "payment_success"
        : "payment_failed",
  };
};

/* -------------------- Connect RabbitMQ -------------------- */

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

      console.log("💳 Payment Service connected");
      console.log("Waiting for orders...");

      channel.consume(q.queue, async (msg) => {
        const order = JSON.parse(msg.content.toString());

        console.log("📦 Order received:", order);
        console.log(`💰 Processing Stripe payment for order ${order.orderId}`);

        try {
          const paymentResult = await processStripePayment(order);
          console.log(`✅ Payment result:`, paymentResult);

          // Publish payment result to RabbitMQ
          const paymentExchange = "payment_created_exchange";
          await channel.assertExchange(paymentExchange, "fanout", {
            durable: false,
          });
          channel.publish(
            paymentExchange,
            "",
            Buffer.from(JSON.stringify(paymentResult))
          );

          console.log(`📤 Payment event published for order ${order.orderId}`);
        } catch (err) {
          console.error(`❌ Stripe payment failed:`, err.message);

          // Publish failure event too
          const paymentExchange = "payment_created_exchange";
          await channel.assertExchange(paymentExchange, "fanout", {
            durable: false,
          });
          channel.publish(
            paymentExchange,
            "",
            Buffer.from(
              JSON.stringify({
                orderId: order.orderId,
                userId: order.userId,
                status: "payment_failed",
                error: err.message,
              })
            )
          );
        }

        channel.ack(msg);
      });

      break;
    } catch (err) {
      console.log("RabbitMQ not ready, retrying in 5 seconds...", err.message);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

connectRabbitMQ();