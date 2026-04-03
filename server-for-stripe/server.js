const path = require("path");
const http = require("http");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const port = Number(process.env.PORT) || 5002;

const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        "Missing STRIPE_SECRET_KEY. Copy .env.example to .env in server-for-stripe and set your secret key."
    );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook route must come BEFORE express.json()
// because Stripe signature verification requires raw body
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    (req, res) => {
        const signature = req.headers["stripe-signature"];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("Missing STRIPE_WEBHOOK_SECRET");
            return res.status(500).send("Webhook secret is not configured");
        }

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object;

                    console.log("Payment completed");
                    console.log("Session ID:", session.id);
                    console.log("Payment status:", session.payment_status);
                    console.log("Customer email:", session.customer_details?.email || "N/A");
                    console.log("Amount total:", session.amount_total);

                    // TODO:
                    // 1. Verify metadata / order id
                    // 2. Mark order as paid in database
                    // 3. Trigger fulfillment / email

                    break;
                }

                case "checkout.session.async_payment_succeeded": {
                    const session = event.data.object;
                    console.log("Async payment succeeded:", session.id);
                    break;
                }

                case "checkout.session.async_payment_failed": {
                    const session = event.data.object;
                    console.log("Async payment failed:", session.id);
                    break;
                }

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return res.json({ received: true });
        } catch (err) {
            console.error("Webhook handler failed:", err.message);
            return res.status(500).json({ error: "Webhook handler failed" });
        }
    }
);

app.use(
    cors({
        origin: clientUrl,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Stripe backend running" });
});

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { quantity = 1 } = req.body || {};

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be a positive integer" });
        }

        // In production:
        // never trust product name, price, currency, or total from frontend
        // calculate them on the server or load them from your DB
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Premium Plan",
                            description: "One-time purchase"
                        },
                        unit_amount: 2000
                    },
                    quantity
                }
            ],
            success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/cancel`,
            metadata: {
                orderType: "one-time",
                source: "react-node-demo"
            }
        });

        return res.status(200).json({
            url: session.url
        });
    } catch (err) {
        console.error("Create checkout session error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

app.get("/checkout-session", async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ error: "session_id is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        return res.json({
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email || null,
            amount_total: session.amount_total,
            currency: session.currency
        });
    } catch (err) {
        console.error("Retrieve session error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

const MAX_PORT_TRIES = 20;
const server = http.createServer(app);

function listenFrom(p, triesLeft) {
    const onError = (err) => {
        server.removeListener("error", onError);
        if (err.code === "EADDRINUSE" && triesLeft > 0) {
            console.warn(`Port ${p} is already in use, trying ${p + 1}…`);
            // Must close before binding again on the same Server instance (Node net behavior).
            server.close(() => listenFrom(p + 1, triesLeft - 1));
        } else if (err.code === "EADDRINUSE") {
            console.error(
                `Could not bind a port after ${MAX_PORT_TRIES} attempts from ${port}. ` +
                    "Stop the other process using this range or set PORT in .env to a free port " +
                    "(e.g. PORT=5001)."
            );
            process.exit(1);
        } else {
            console.error(err);
            process.exit(1);
        }
    };
    server.once("error", onError);
    server.listen(p, () => {
        server.removeListener("error", onError);
        console.log(`Server running on http://localhost:${p}`);
    });
}

listenFrom(port, MAX_PORT_TRIES);