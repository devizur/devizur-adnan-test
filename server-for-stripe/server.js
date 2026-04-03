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

function sanitizeMetadata(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return {};
    const out = {};
    for (const [k, v] of Object.entries(input)) {
        if (v === undefined || v === null) continue;
        const key = String(k).slice(0, 40);
        out[key] = String(v).slice(0, 500);
    }
    return out;
}

app.post("/create-checkout-session", async (req, res) => {
    try {
        const body = req.body || {};
        const amountTotalCents = body.amountTotalCents;
        const meta = sanitizeMetadata(body.metadata);
        const baseMetadata = {
            source: "online-booking-system",
            ...meta
        };

        let line_items;

        if (amountTotalCents !== undefined && amountTotalCents !== null) {
            if (typeof amountTotalCents !== "number" || !Number.isInteger(amountTotalCents)) {
                return res.status(400).json({ error: "amountTotalCents must be an integer (USD cents)" });
            }
            if (amountTotalCents < 50) {
                return res.status(400).json({ error: "amountTotalCents must be at least 50 ($0.50 USD)" });
            }
            if (amountTotalCents > 99999999) {
                return res.status(400).json({ error: "amountTotalCents exceeds maximum allowed" });
            }
            const title =
                typeof body.description === "string" && body.description.trim()
                    ? body.description.trim().slice(0, 200)
                    : "Booking payment";
            line_items = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: title,
                            description: "Venue booking (total includes fees shown in app)"
                        },
                        unit_amount: amountTotalCents
                    },
                    quantity: 1
                }
            ];
        } else {
            const { quantity = 1 } = body;
            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    error: "Send amountTotalCents (integer, USD cents) or quantity for the demo line item"
                });
            }
            line_items = [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Premium Plan",
                            description: "One-time purchase (demo)"
                        },
                        unit_amount: 2000
                    },
                    quantity
                }
            ];
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items,
            success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/cancel`,
            metadata: baseMetadata
        });

        return res.status(200).json({
            url: session.url
        });
    } catch (err) {
        console.error("Create checkout session error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

/** In-app card payments (Payment Element) — amount validated server-side. */
app.post("/create-payment-intent", async (req, res) => {
    try {
        const body = req.body || {};
        const amountTotalCents = body.amountTotalCents;

        if (typeof amountTotalCents !== "number" || !Number.isInteger(amountTotalCents)) {
            return res.status(400).json({ error: "amountTotalCents must be an integer (USD cents)" });
        }
        if (amountTotalCents < 50) {
            return res.status(400).json({ error: "amountTotalCents must be at least 50 ($0.50 USD)" });
        }
        if (amountTotalCents > 99999999) {
            return res.status(400).json({ error: "amountTotalCents exceeds maximum allowed" });
        }

        const meta = sanitizeMetadata(body.metadata);
        const description =
            typeof body.description === "string" && body.description.trim()
                ? body.description.trim().slice(0, 200)
                : "Booking payment";

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountTotalCents,
            currency: "usd",
            automatic_payment_methods: { enabled: true },
            metadata: {
                source: "online-booking-system",
                ...meta
            },
            description
        });

        if (!paymentIntent.client_secret) {
            return res.status(500).json({ error: "Payment intent has no client secret" });
        }

        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error("Create payment intent error:", err.message);
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