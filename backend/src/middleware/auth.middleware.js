import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
  try {
    if (typeof req.auth !== "function") {
      return res.status(500).json({ message: "Authentication method not configured" });
    }

    const auth = req.auth();
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: "Unauthorized - you must be logged in" });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (typeof req.auth !== "function") {
      return res.status(500).json({ message: "Authentication method not configured" });
    }

    const auth = req.auth();
    if (!auth || !auth.userId) {
      return res.status(401).json({ message: "Unauthorized - you must be logged in" });
    }

    const currentUser = await clerkClient.users.getUser(auth.userId);

    if (!process.env.ADMIN_EMAILS) {
      console.error("ADMIN_EMAILS environment variable is not defined.");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const adminEmails = process.env.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase());

    if (
      !currentUser.emailAddresses ||
      !Array.isArray(currentUser.emailAddresses) ||
      !currentUser.primaryEmailAddressId
    ) {
      console.log("User email data is incomplete:", currentUser);
      return res.status(403).json({ message: "Forbidden - admin privileges required" });
    }

    const primaryEmailObj = currentUser.emailAddresses.find(
      (email) => email.id === currentUser.primaryEmailAddressId
    );

    if (!primaryEmailObj || !primaryEmailObj.emailAddress) {
      console.log("Primary email not found for user:", currentUser.id);
      return res.status(403).json({ message: "Forbidden - admin privileges required" });
    }

    const userEmail = primaryEmailObj.emailAddress.toLowerCase();

    console.log("Checking admin access for:", userEmail);
    console.log("Admin emails list:", adminEmails);

    if (!adminEmails.includes(userEmail)) {
      console.log(`Access denied for email: ${userEmail}`);
      return res.status(403).json({
        message: "Forbidden - admin privileges required",
        yourEmail: userEmail,
        adminEmails: adminEmails,
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    next(error);
  }
};
