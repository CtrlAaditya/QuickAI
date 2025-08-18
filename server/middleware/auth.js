import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    // ✅ Call req.auth() as a function
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User ID not found." });
    }

    // ✅ Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);

    // ✅ Check if user has premium plan
    const hasPremiumPlan = user.privateMetadata?.plan?.toLowerCase() === "premium";

    // Attach to req object so routes can use it
    req.user = user;
    req.plan = hasPremiumPlan ? "premium" : "free";

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
