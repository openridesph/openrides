import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

type Ctx = QueryCtx | MutationCtx;
type Role = "passenger" | "rider";

export async function requireProfile(ctx: Ctx) {
	const authUser = await authComponent.getAuthUser(ctx);
	if (!authUser) {
		throw new Error("Unauthenticated");
	}

	const userRef = authUser.userId as Id<"users">;
	const profile = await ctx.db
		.query("userProfiles")
		.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
		.first();

	if (!profile) {
		throw new Error("User profile not found");
	}

	return { authUser, profile, userRef };
}

export function requireRole(profile: { roles: Role[] }, role: Role) {
	if (!profile.roles.includes(role)) {
		throw new Error(`Requires ${role} role`);
	}
}

export function requireAdmin(profile: { isAdmin: boolean }) {
	if (!profile.isAdmin) {
		throw new Error("Admin privileges required");
	}
}

export function canServeRequest(
	serviceMode: "ride_only" | "delivery_only" | "both",
	serviceType: "ride" | "delivery"
) {
	if (serviceMode === "both") {
		return true;
	}

	if (serviceMode === "ride_only" && serviceType === "ride") {
		return true;
	}

	if (serviceMode === "delivery_only" && serviceType === "delivery") {
		return true;
	}

	return false;
}
