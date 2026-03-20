require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the event came from Stripe (Security) [cite: 125]
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // If payment is successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Extract data we sent in "metadata" during signup
    const { charityId, charityPercent } = session.metadata;
    const userEmail = session.customer_details.email;

    // UPDATE SUPABASE [cite: 135]
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active", // PRD Section 10 [cite: 89]
        charity_id: charityId, // PRD Section 08 [cite: 76]
        charity_percent: charityPercent,
      })
      .eq("email", userEmail);

    if (error) console.error("DB Update Error:", error);
  }

  res.json({ received: true });
};
