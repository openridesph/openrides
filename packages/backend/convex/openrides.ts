import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canServeRequest, requireProfile, requireRole } from "./roles";

function now() {
	return Date.now();
}

function lowBidFloor(
	serviceType: "ride" | "delivery",
	vehicleType: "tricycle" | "motorcycle" | "car" | "taxi"
) {
	const base = serviceType === "ride" ? 70 : 90;
	const vehicleOffset =
		vehicleType === "tricycle" ? 0 : vehicleType === "motorcycle" ? 20 : 45;
	return base + vehicleOffset;
}

export const getMyProfile = query({
	args: {},
	handler: async (ctx) => {
		const { profile, userRef } = await requireProfile(ctx);
		const riderProfile = await ctx.db
			.query("riderProfiles")
			.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
			.first();
		return { profile, riderProfile };
	},
});

export const updateMyProfile = mutation({
	args: {
		name: v.optional(v.string()),
		phone: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { profile } = await requireProfile(ctx);
		await ctx.db.patch(profile._id, {
			name: args.name ?? profile.name,
			phone: args.phone ?? profile.phone,
			updatedAt: now(),
		});
		return { success: true };
	},
});

export const switchActiveRole = mutation({
	args: {
		role: v.union(v.literal("passenger"), v.literal("rider")),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireRole(profile, args.role);

		const passengerTrip = await ctx.db
			.query("trips")
			.withIndex("by_passengerRef_status", (q) =>
				q.eq("passengerRef", userRef).eq("status", "in_transit")
			)
			.first();
		const riderTrip = await ctx.db
			.query("trips")
			.withIndex("by_riderRef_status", (q) =>
				q.eq("riderRef", userRef).eq("status", "in_transit")
			)
			.first();
		if (passengerTrip || riderTrip) {
			throw new Error("Cannot switch roles during an active trip");
		}

		await ctx.db.patch(profile._id, {
			activeRole: args.role,
			updatedAt: now(),
		});

		await ctx.db.insert("auditLogs", {
			actorRef: userRef,
			action: "role.switch",
			entityType: "userProfiles",
			entityRef: profile._id,
			createdAt: now(),
		});

		return { success: true, activeRole: args.role };
	},
});

export const finalizeSignupRole = mutation({
	args: {
		role: v.union(v.literal("passenger"), v.literal("rider")),
	},
	handler: async (ctx, args) => {
		const { profile } = await requireProfile(ctx);
		const nextRoles: Array<"passenger" | "rider"> =
			args.role === "rider"
				? profile.roles.includes("rider")
					? profile.roles
					: [...profile.roles, "rider"]
				: profile.roles.includes("passenger")
					? profile.roles
					: [...profile.roles, "passenger"];

		await ctx.db.patch(profile._id, {
			roles: nextRoles,
			activeRole: args.role,
			updatedAt: now(),
		});

		return {
			success: true,
			activeRole: args.role,
			roles: nextRoles,
		};
	},
});

export const completeRiderOnboarding = mutation({
	args: {
		serviceMode: v.union(
			v.literal("ride_only"),
			v.literal("delivery_only"),
			v.literal("both")
		),
		vehicleTypes: v.array(
			v.union(
				v.literal("tricycle"),
				v.literal("motorcycle"),
				v.literal("car"),
				v.literal("taxi")
			)
		),
		phone: v.string(),
		documents: v.array(
			v.object({
				label: v.string(),
				uri: v.string(),
			})
		),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		const roles: Array<"passenger" | "rider"> = profile.roles.includes("rider")
			? profile.roles
			: [...profile.roles, "rider"];
		await ctx.db.patch(profile._id, {
			roles,
			phone: args.phone,
			updatedAt: now(),
		});

		const riderProfile = await ctx.db
			.query("riderProfiles")
			.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
			.first();
		if (!riderProfile) {
			throw new Error("Rider profile missing");
		}
		await ctx.db.patch(riderProfile._id, {
			serviceMode: args.serviceMode,
			vehicleTypes: args.vehicleTypes,
			documents: args.documents,
			verificationStatus: "pending",
			availability: false,
			updatedAt: now(),
		});
		return { success: true };
	},
});

export const createRequest = mutation({
	args: {
		serviceType: v.union(v.literal("ride"), v.literal("delivery")),
		vehicleType: v.union(
			v.literal("tricycle"),
			v.literal("motorcycle"),
			v.literal("car"),
			v.literal("taxi")
		),
		pickupAddress: v.string(),
		dropoffAddress: v.string(),
		bidAmount: v.number(),
	},
	handler: async (ctx, args) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "passenger");

		const floor = lowBidFloor(args.serviceType, args.vehicleType);
		const bidTooLowWarning = args.bidAmount < floor;
		const ts = now();
		const requestRef = await ctx.db.insert("serviceRequests", {
			passengerRef: userRef,
			serviceType: args.serviceType,
			vehicleType: args.vehicleType,
			pickupAddress: args.pickupAddress,
			dropoffAddress: args.dropoffAddress,
			bidAmount: args.bidAmount,
			bidTooLowWarning,
			status: "open",
			expiresAt: ts + 180_000,
			createdAt: ts,
			updatedAt: ts,
		});

		return {
			requestRef,
			bidTooLowWarning,
			suggestedMinimum: floor,
		};
	},
});

export const listPassengerActiveRequests = query({
	args: {},
	handler: async (ctx) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "passenger");
		const requests = await ctx.db
			.query("serviceRequests")
			.withIndex("by_passengerRef_status", (q) =>
				q.eq("passengerRef", userRef).eq("status", "open")
			)
			.collect();
		const negotiating = await ctx.db
			.query("serviceRequests")
			.withIndex("by_passengerRef_status", (q) =>
				q.eq("passengerRef", userRef).eq("status", "negotiating")
			)
			.collect();
		const matched = await ctx.db
			.query("serviceRequests")
			.withIndex("by_passengerRef_status", (q) =>
				q.eq("passengerRef", userRef).eq("status", "matched")
			)
			.collect();
		return [...requests, ...negotiating, ...matched];
	},
});

export const listNegotiationBids = query({
	args: {
		requestRef: v.id("serviceRequests"),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		const request = await ctx.db.get(args.requestRef);
		if (!request) {
			return [];
		}

		const isPassengerOwner =
			request.passengerRef === userRef && profile.roles.includes("passenger");
		const isRider = profile.roles.includes("rider");
		if (!(isPassengerOwner || isRider)) {
			throw new Error("Unauthorized");
		}

		return await ctx.db
			.query("requestBids")
			.withIndex("by_requestRef_createdAt", (q) =>
				q.eq("requestRef", args.requestRef)
			)
			.collect();
	},
});

export const listEligibleRequestsForRider = query({
	args: {},
	handler: async (ctx) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "rider");
		const riderProfile = await ctx.db
			.query("riderProfiles")
			.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
			.first();

		if (
			!(riderProfile && riderProfile.availability) ||
			riderProfile.verificationStatus !== "approved"
		) {
			return [];
		}

		const openRequests = await ctx.db
			.query("serviceRequests")
			.withIndex("by_status_createdAt", (q) => q.eq("status", "open"))
			.collect();

		return openRequests.filter(
			(request) =>
				canServeRequest(riderProfile.serviceMode, request.serviceType) &&
				riderProfile.vehicleTypes.includes(request.vehicleType)
		);
	},
});

export const riderRespondToRequest = mutation({
	args: {
		requestRef: v.id("serviceRequests"),
		action: v.union(
			v.literal("accept"),
			v.literal("counter"),
			v.literal("reject")
		),
		amount: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireRole(profile, "rider");
		const request = await ctx.db.get(args.requestRef);
		if (!request) {
			throw new Error("Request not found");
		}

		const riderProfile = await ctx.db
			.query("riderProfiles")
			.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
			.first();
		if (!riderProfile || riderProfile.verificationStatus !== "approved") {
			throw new Error("Rider verification required");
		}

		if (!canServeRequest(riderProfile.serviceMode, request.serviceType)) {
			throw new Error("Request outside selected service type");
		}

		const amount = args.amount ?? request.bidAmount;
		const status =
			args.action === "reject"
				? "rejected"
				: args.action === "accept"
					? "accepted"
					: "countered";
		const ts = now();
		const bidRef = await ctx.db.insert("requestBids", {
			requestRef: args.requestRef,
			riderRef: userRef,
			amount,
			status,
			createdAt: ts,
			updatedAt: ts,
		});

		await ctx.db.patch(args.requestRef, {
			status: args.action === "reject" ? "open" : "negotiating",
			updatedAt: ts,
		});

		return { bidRef, status };
	},
});

export const passengerRespondToBid = mutation({
	args: {
		bidRef: v.id("requestBids"),
		action: v.union(
			v.literal("accept"),
			v.literal("counter"),
			v.literal("reject")
		),
		amount: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireRole(profile, "passenger");

		const bid = await ctx.db.get(args.bidRef);
		if (!bid) {
			throw new Error("Bid not found");
		}
		const request = await ctx.db.get(bid.requestRef);
		if (!request || request.passengerRef !== userRef) {
			throw new Error("Unauthorized");
		}

		const ts = now();
		if (args.action === "reject") {
			await ctx.db.patch(bid._id, {
				status: "rejected",
				updatedAt: ts,
			});
			return { status: "rejected" };
		}

		if (args.action === "counter") {
			const counterAmount = args.amount ?? request.bidAmount;
			const counterBidRef = await ctx.db.insert("requestBids", {
				requestRef: request._id,
				riderRef: bid.riderRef,
				amount: counterAmount,
				status: "countered",
				counterOf: bid._id,
				createdAt: ts,
				updatedAt: ts,
			});
			await ctx.db.patch(request._id, { status: "negotiating", updatedAt: ts });
			return { status: "countered", counterBidRef };
		}

		await ctx.db.patch(bid._id, {
			status: "accepted",
			updatedAt: ts,
		});
		await ctx.db.patch(request._id, {
			status: "matched",
			matchedRiderRef: bid.riderRef,
			bidAmount: bid.amount,
			updatedAt: ts,
		});
		const tripRef = await ctx.db.insert("trips", {
			requestRef: request._id,
			passengerRef: request.passengerRef,
			riderRef: bid.riderRef,
			agreedAmount: bid.amount,
			status: "en_route_pickup",
			compensationFlag: false,
			startedAt: ts,
			createdAt: ts,
			updatedAt: ts,
		});
		return { status: "accepted", tripRef };
	},
});

export const setRiderAvailability = mutation({
	args: {
		availability: v.boolean(),
		serviceMode: v.optional(
			v.union(
				v.literal("ride_only"),
				v.literal("delivery_only"),
				v.literal("both")
			)
		),
	},
	handler: async (ctx, args) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "rider");
		const riderProfile = await ctx.db
			.query("riderProfiles")
			.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
			.first();
		if (!riderProfile) {
			throw new Error("Rider profile missing");
		}
		await ctx.db.patch(riderProfile._id, {
			availability: args.availability,
			serviceMode: args.serviceMode ?? riderProfile.serviceMode,
			updatedAt: now(),
		});
		return { success: true };
	},
});

export const updateTripStatus = mutation({
	args: {
		tripRef: v.id("trips"),
		status: v.union(
			v.literal("en_route_pickup"),
			v.literal("arrived_pickup"),
			v.literal("in_transit"),
			v.literal("arrived_dropoff"),
			v.literal("completed"),
			v.literal("cancelled")
		),
	},
	handler: async (ctx, args) => {
		const { userRef, profile } = await requireProfile(ctx);
		const trip = await ctx.db.get(args.tripRef);
		if (!trip) {
			throw new Error("Trip not found");
		}
		const isRider =
			profile.roles.includes("rider") && trip.riderRef === userRef;
		const isPassenger =
			profile.roles.includes("passenger") && trip.passengerRef === userRef;
		if (!(isRider || isPassenger)) {
			throw new Error("Unauthorized");
		}

		const ts = now();
		await ctx.db.patch(trip._id, {
			status: args.status,
			completedAt: args.status === "completed" ? ts : trip.completedAt,
			updatedAt: ts,
		});

		if (args.status === "completed") {
			await ctx.db.insert("earnings", {
				riderRef: trip.riderRef,
				tripRef: trip._id,
				amount: trip.agreedAmount,
				kind: "trip",
				createdAt: ts,
			});
			const request = await ctx.db.get(trip.requestRef);
			if (request) {
				await ctx.db.patch(request._id, { status: "completed", updatedAt: ts });
			}
		}
		return { success: true };
	},
});

export const listRiderTripHistory = query({
	args: {},
	handler: async (ctx) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "rider");
		const trips = await ctx.db
			.query("trips")
			.withIndex("by_riderRef_status", (q) =>
				q.eq("riderRef", userRef).eq("status", "completed")
			)
			.collect();
		const earnings = await ctx.db
			.query("earnings")
			.withIndex("by_riderRef_createdAt", (q) => q.eq("riderRef", userRef))
			.collect();
		return { trips, earnings };
	},
});

export const publishTripLocation = mutation({
	args: {
		tripRef: v.id("trips"),
		latitude: v.number(),
		longitude: v.number(),
		heading: v.optional(v.number()),
		speed: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "rider");
		const trip = await ctx.db.get(args.tripRef);
		if (!trip || trip.riderRef !== userRef) {
			throw new Error("Trip not found");
		}
		await ctx.db.insert("tripLocations", {
			tripRef: args.tripRef,
			actorRef: userRef,
			latitude: args.latitude,
			longitude: args.longitude,
			heading: args.heading,
			speed: args.speed,
			createdAt: now(),
		});
		return { success: true };
	},
});

export const submitDonationAndFeedback = mutation({
	args: {
		tripRef: v.id("trips"),
		donationAmount: v.number(),
		rating: v.number(),
		comment: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userRef, profile } = await requireProfile(ctx);
		requireRole(profile, "passenger");
		const trip = await ctx.db.get(args.tripRef);
		if (!trip || trip.passengerRef !== userRef) {
			throw new Error("Trip not found");
		}
		const ts = now();
		if (args.donationAmount > 0) {
			await ctx.db.insert("donations", {
				tripRef: trip._id,
				passengerRef: trip.passengerRef,
				riderRef: trip.riderRef,
				amount: args.donationAmount,
				createdAt: ts,
			});
		}
		await ctx.db.insert("feedback", {
			tripRef: trip._id,
			passengerRef: trip.passengerRef,
			riderRef: trip.riderRef,
			rating: args.rating,
			comment: args.comment,
			createdAt: ts,
		});
		return { success: true };
	},
});

export const cancelRequest = mutation({
	args: {
		requestRef: v.id("serviceRequests"),
	},
	handler: async (ctx, args) => {
		const { profile, userRef } = await requireProfile(ctx);
		requireRole(profile, "passenger");
		const request = await ctx.db.get(args.requestRef);
		if (!request || request.passengerRef !== userRef) {
			throw new Error("Request not found");
		}

		const ts = now();
		await ctx.db.patch(request._id, {
			status: "cancelled",
			updatedAt: ts,
		});

		if (request.status === "matched" && request.matchedRiderRef) {
			const trip = await ctx.db
				.query("trips")
				.withIndex("by_requestRef", (q) => q.eq("requestRef", request._id))
				.first();
			if (trip) {
				await ctx.db.patch(trip._id, {
					status: "cancelled",
					compensationFlag: true,
					updatedAt: ts,
				});
				await ctx.db.insert("earnings", {
					riderRef: trip.riderRef,
					tripRef: trip._id,
					amount: 0,
					kind: "cancellation_flag",
					createdAt: ts,
				});
			}
		}

		return { success: true };
	},
});

export const expireStaleRequests = mutation({
	args: {},
	handler: async (ctx) => {
		const ts = now();
		const openRequests = await ctx.db
			.query("serviceRequests")
			.withIndex("by_status_createdAt", (q) => q.eq("status", "open"))
			.collect();
		let expiredCount = 0;
		for (const request of openRequests) {
			if (request.expiresAt <= ts) {
				await ctx.db.patch(request._id, { status: "expired", updatedAt: ts });
				expiredCount += 1;
			}
		}
		return { expiredCount };
	},
});
