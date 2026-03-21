require("dotenv").config(); // Added () - Critical to load your keys!

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { userId, email, planType, charityId, percent } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is missing from request" });
  }

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
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,

      metadata: {
        userId: userId,
        charityId: charityId || "default_charity",
        charityPercent: percent || "10",
        plan: planType,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
