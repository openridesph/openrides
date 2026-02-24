import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireProfile } from "./roles";

function now() {
	return Date.now();
}

export const getDashboard = query({
	args: {},
	handler: async (ctx) => {
		const { profile } = await requireProfile(ctx);
		requireAdmin(profile);

		const pendingVerifications = await ctx.db
			.query("riderProfiles")
			.withIndex("by_verificationStatus", (q) =>
				q.eq("verificationStatus", "pending")
			)
			.collect();
		const openDisputes = await ctx.db
			.query("disputes")
			.withIndex("by_status_createdAt", (q) => q.eq("status", "open"))
			.collect();
		const donations = await ctx.db.query("donations").collect();
		const earnings = await ctx.db.query("earnings").collect();
		const trips = await ctx.db.query("trips").collect();

		return {
			pendingVerificationCount: pendingVerifications.length,
			openDisputeCount: openDisputes.length,
			activeTripCount: trips.filter((trip) => trip.status === "in_transit")
				.length,
			totalDonations: donations.reduce((sum, item) => sum + item.amount, 0),
			totalEarnings: earnings.reduce((sum, item) => sum + item.amount, 0),
			totalTrips: trips.length,
		};
	},
});

export const listPendingVerifications = query({
	args: {},
	handler: async (ctx) => {
		const { profile } = await requireProfile(ctx);
		requireAdmin(profile);
		return await ctx.db
			.query("riderProfiles")
			.withIndex("by_verificationStatus", (q) =>
				q.eq("verificationStatus", "pending")
			)
			.collect();
	},
});

export const reviewRiderVerification = mutation({
	args: {
		riderProfileRef: v.id("riderProfiles"),
		decision: v.union(v.literal("approve"), v.literal("reject")),
		reason: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireAdmin(profile);
		const riderProfile = await ctx.db.get(args.riderProfileRef);
		if (!riderProfile) {
			throw new Error("Rider profile not found");
		}
		const ts = now();
		await ctx.db.patch(riderProfile._id, {
			verificationStatus: args.decision === "approve" ? "approved" : "rejected",
			rejectionReason:
				args.decision === "reject"
					? (args.reason ?? "Verification rejected")
					: undefined,
			updatedAt: ts,
		});
		await ctx.db.insert("auditLogs", {
			actorRef: userRef,
			action: `rider.verification.${args.decision}`,
			entityType: "riderProfiles",
			entityRef: riderProfile._id,
			metadata: args.reason,
			createdAt: ts,
		});
		return { success: true };
	},
});

export const listDisputes = query({
	args: {},
	handler: async (ctx) => {
		const { profile } = await requireProfile(ctx);
		requireAdmin(profile);
		return await ctx.db
			.query("disputes")
			.withIndex("by_status_createdAt", (q) => q.eq("status", "open"))
			.collect();
	},
});

export const resolveDispute = mutation({
	args: {
		disputeRef: v.id("disputes"),
		resolution: v.string(),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireAdmin(profile);
		const dispute = await ctx.db.get(args.disputeRef);
		if (!dispute) {
			throw new Error("Dispute not found");
		}
		const ts = now();
		await ctx.db.patch(dispute._id, {
			status: "resolved",
			resolution: args.resolution,
			updatedAt: ts,
		});
		await ctx.db.insert("auditLogs", {
			actorRef: userRef,
			action: "dispute.resolve",
			entityType: "disputes",
			entityRef: dispute._id,
			metadata: args.resolution,
			createdAt: ts,
		});
		return { success: true };
	},
});

export const moderateUser = mutation({
	args: {
		targetUserRef: v.id("users"),
		action: v.union(v.literal("warn"), v.literal("suspend"), v.literal("ban")),
		note: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireAdmin(profile);
		const ts = now();
		await ctx.db.insert("moderationActions", {
			adminRef: userRef,
			targetUserRef: args.targetUserRef,
			action: args.action,
			note: args.note,
			createdAt: ts,
		});

		const targetProfile = await ctx.db
			.query("userProfiles")
			.withIndex("by_userRef", (q) => q.eq("userRef", args.targetUserRef))
			.first();
		if (targetProfile && (args.action === "suspend" || args.action === "ban")) {
			await ctx.db.patch(targetProfile._id, {
				status: "suspended",
				updatedAt: ts,
			});
		}

		return { success: true };
	},
});
