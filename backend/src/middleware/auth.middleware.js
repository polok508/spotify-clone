import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
    try {
        const auth = req.auth(); 
        if(!auth?.userId) {
            return res.status(401).json({message: "Unauthorized - you must be logged in"});
        }
        next();
    } catch (error) {
        next(error);
    }
}

export const requireAdmin = async(req, res, next) => {
    try {
        const auth = req.auth(); 
        
        if(!auth?.userId) {
            return res.status(401).json({message: "Unauthorized - you must be logged in"});
        }

        const currentUser = await clerkClient.users.getUser(auth.userId);
        const adminEmails = process.env.ADMIN_EMAILS?.split(',')
            .map(email => email.trim().toLowerCase()) || [];
        
        const userEmail = currentUser.emailAddresses.find(
            email => email.id === currentUser.primaryEmailAddressId
        )?.emailAddress.toLowerCase();

        console.log("Checking admin access for:", userEmail);
        console.log("Admin emails list:", adminEmails);

        if (!userEmail || !adminEmails.includes(userEmail)) {
            console.log(`Access denied for email: ${userEmail}`);
            return res.status(403).json({
                message: "Forbidden - admin privileges required",
                yourEmail: userEmail,
                adminEmails: adminEmails
            });
        }

        next();
    } catch (error) {
        console.error("Admin check error:", error);
        next(error);
    }
}