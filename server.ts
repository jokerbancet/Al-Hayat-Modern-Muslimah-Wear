import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase Admin Client (using service role key for backend operations)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Midtrans Snap Client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

app.use(cors());
app.use(express.json());

// API: Create Payment Intent (Midtrans Snap)
app.post("/api/checkout", async (req, res) => {
  try {
    const { items, customerDetails, shippingAddress } = req.body;

    // 1. Calculate Total
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    // 2. Create Order in Supabase (Status: Pending)
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          id: orderId,
          status: "pending",
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          items: items,
          customer_email: customerDetails.email,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Prepare Midtrans Transaction
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      item_details: items.map((item: any) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        shipping_address: {
          first_name: customerDetails.firstName,
          last_name: customerDetails.lastName,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country_code: "IDN",
        },
      },
    };

    const transaction = await snap.createTransaction(parameter);
    
    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId: orderId,
    });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Seed Admin Account (Development Only)
app.post("/api/admin/seed", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in environment variables. Please add it to your AI Studio Secrets.");
    }

    // 1. Check if user already exists
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    
    let targetUser = listData?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!targetUser) {
      // 2. Create User if not found
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;
      targetUser = authData.user;
    }

    // 3. Upsert Admin Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: targetUser.id, role: "admin" });

    if (profileError) {
      // If profile creation fails, the user was created but the table might not exist
      if (profileError.code === 'PGRST116' || profileError.message?.includes('relation "profiles" does not exist')) {
        throw new Error('The "profiles" table does not exist in your database. Please run the SQL script I provided in the Supabase SQL Editor to create the "profiles" table.');
      }
      throw profileError;
    }

    res.json({ message: "Admin account seeded successfully. You can now login." });
  } catch (error: any) {
    const errorMessage = error.message || JSON.stringify(error);
    console.error("Seeding Error Details:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// API: Midtrans Webhook
app.post("/api/webhooks/midtrans", async (req, res) => {
  try {
    const notification = req.body;
    const statusResponse = await snap.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud: ${fraudStatus}`);

    let orderStatus = "pending";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        orderStatus = "challenge";
      } else if (fraudStatus === "accept") {
        orderStatus = "paid";
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "paid";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      orderStatus = "cancelled";
    } else if (transactionStatus === "pending") {
      orderStatus = "pending";
    }

    // Update Order Status
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status: orderStatus, payment_id: statusResponse.transaction_id })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    // If Paid, Decrement Stock
    if (orderStatus === "paid") {
      for (const item of updatedOrder.items) {
        // Assuming item has variantId
        const { data: variant, error: variantError } = await supabase
          .from("variants")
          .select("stock_quantity")
          .eq("id", item.variantId)
          .single();

        if (variant && !variantError) {
          await supabase
            .from("variants")
            .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
            .eq("id", item.variantId);
        }
      }
    }

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
