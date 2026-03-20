require("dotenv").config(); // Added () - Critical to load your keys!

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  // 1. Destructure everything sent from Pricing.jsx
  const { userId, email, planType, charityId, percent } = req.body;

  // 2. Safety Check: If userId is missing, Stripe metadata will fail
  if (!userId) {
    return res.status(400).json({ error: "User ID is missing from request" });
  }

  // 3. Picking the correct Price ID (PRD Section 41)
  const priceId =
    planType === "yearly"
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      customer_email: email,
      // Success/Cancel URLs (PRD Section 41)
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,

      // 4. Metadata is key for your Webhook to update Supabase later
      metadata: {
        userId: userId,
        charityId: charityId || "default_charity", // PRD Section 08 [cite: 76]
        charityPercent: percent || "10", // PRD 10% Minimum [cite: 77]
        plan: planType,
      },
    });

    // Send the URL back to Pricing.jsx so window.location.href works
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
