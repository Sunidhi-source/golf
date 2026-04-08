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
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const { charityId, charityPercent } = session.metadata;
    const userEmail = session.customer_details.email;

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        charity_id: charityId,
        charity_percent: charityPercent,
      })
      .eq("email", userEmail);

    if (error) console.error("DB Update Error:", error);
  }

  res.json({ received: true });
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
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, charityId, charityPercent, plan } = session.metadata;

      if (!userId) {
        console.error("Webhook: userId missing from session metadata");
        return res.json({ received: true });
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_plan: plan || "monthly",
          stripe_customer_id: session.customer,
          charity_id: charityId || null,
          charity_percent: parseInt(charityPercent, 10) || 10,
        })
        .eq("id", userId);

      if (error) {
        console.error("Webhook DB Update Error:", error.message);
      } else {
        console.log(`Subscription activated for user: ${userId}`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "inactive" })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("Webhook cancel error:", error.message);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "lapsed" })
        .eq("stripe_customer_id", customerId);

      if (error) {
        console.error("Webhook lapse error:", error.message);
      }
    }

    res.json({ received: true });
  };
};
