import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for checkout" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const lineItems = items.map((item: any) => {
      // Determine image URL
      let imageUrl = item.image_url || item.image || "";
      if (imageUrl && !imageUrl.startsWith("http")) {
        imageUrl = `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name || item.title || "Sneaker Item",
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity || item.qty || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("🔴 Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}