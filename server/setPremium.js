import { clerkClient } from "@clerk/express";
import 'dotenv/config';

const userId = "user_310XOGa9PQwa0yS8UQPRdf58Jkw"; 

async function setPremiumPlan() {
  try {
    await clerkClient.users.updateUser(userId, {
      privateMetadata: { plan: "premium" }
    });
    console.log("✅ Premium plan set successfully!");
  } catch (err) {
    console.error("Error setting premium plan:", err);
  }
}

setPremiumPlan();
