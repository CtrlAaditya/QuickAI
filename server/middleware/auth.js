import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = req.auth();

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID not found." });
        }

        const hasPremiumPlan = await has({ plan: 'premium' });
        req.plan = hasPremiumPlan ? 'premium' : 'free'; // Fixed: Assigning to req.plan

        const user = await clerkClient.users.getUser(userId);

        if (!hasPremiumPlan && user.privateMetadata.free_usage) {
            req.free_usage = user.privateMetadata.free_usage;
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: 0
                }
            });
            req.free_usage = 0;
        }

        next();

    } catch (error) {
        console.error("Error in auth middleware:", error); // Added logging
        res.status(500).json({ success: false, message: error.message });
    }
};