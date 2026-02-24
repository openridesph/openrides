import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const roleValue = v.union(v.literal("passenger"), v.literal("rider"));
const serviceTypeValue = v.union(v.literal("ride"), v.literal("delivery"));
const serviceModeValue = v.union(
	v.literal("ride_only"),
	v.literal("delivery_only"),
	v.literal("both")
);
const vehicleTypeValue = v.union(
	v.literal("tricycle"),
	v.literal("motorcycle"),
	v.literal("car"),
	v.literal("taxi")
);

export default defineSchema({
	users: defineTable({}),

	userProfiles: defineTable({
		userRef: v.id("users"),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		roles: v.array(roleValue),
		activeRole: roleValue,
		isAdmin: v.boolean(),
		status: v.union(v.literal("active"), v.literal("suspended")),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userRef", ["userRef"])
		.index("by_activeRole", ["activeRole"])
		.index("by_status", ["status"]),

	riderProfiles: defineTable({
		userRef: v.id("users"),
		verificationStatus: v.union(
			v.literal("pending"),
			v.literal("approved"),
			v.literal("rejected")
		),
		serviceMode: serviceModeValue,
		vehicleTypes: v.array(vehicleTypeValue),
		availability: v.boolean(),
		documents: v.array(
			v.object({
				label: v.string(),
				uri: v.string(),
			})
		),
		rejectionReason: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userRef", ["userRef"])
		.index("by_verificationStatus", ["verificationStatus"])
		.index("by_availability", ["availability"]),

	serviceRequests: defineTable({
		passengerRef: v.id("users"),
		serviceType: serviceTypeValue,
		vehicleType: vehicleTypeValue,
		pickupAddress: v.string(),
		dropoffAddress: v.string(),
		bidAmount: v.number(),
		bidTooLowWarning: v.boolean(),
		status: v.union(
			v.literal("open"),
			v.literal("negotiating"),
			v.literal("matched"),
			v.literal("in_progress"),
			v.literal("completed"),
			v.literal("cancelled"),
			v.literal("expired")
		),
		matchedRiderRef: v.optional(v.id("users")),
		expiresAt: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_passengerRef_status", ["passengerRef", "status"])
		.index("by_status_createdAt", ["status", "createdAt"]),

	requestBids: defineTable({
		requestRef: v.id("serviceRequests"),
		riderRef: v.id("users"),
		amount: v.number(),
		status: v.union(
			v.literal("active"),
			v.literal("countered"),
			v.literal("accepted"),
			v.literal("rejected"),
			v.literal("withdrawn")
		),
		counterOf: v.optional(v.id("requestBids")),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_requestRef_createdAt", ["requestRef", "createdAt"])
		.index("by_riderRef_status", ["riderRef", "status"]),

	trips: defineTable({
		requestRef: v.id("serviceRequests"),
		passengerRef: v.id("users"),
		riderRef: v.id("users"),
		agreedAmount: v.number(),
		status: v.union(
			v.literal("en_route_pickup"),
			v.literal("arrived_pickup"),
			v.literal("in_transit"),
			v.literal("arrived_dropoff"),
			v.literal("completed"),
			v.literal("cancelled")
		),
		compensationFlag: v.boolean(),
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_passengerRef_status", ["passengerRef", "status"])
		.index("by_riderRef_status", ["riderRef", "status"])
		.index("by_requestRef", ["requestRef"]),

	tripLocations: defineTable({
		tripRef: v.id("trips"),
		actorRef: v.id("users"),
		latitude: v.number(),
		longitude: v.number(),
		heading: v.optional(v.number()),
		speed: v.optional(v.number()),
		createdAt: v.number(),
	}).index("by_tripRef_createdAt", ["tripRef", "createdAt"]),

	earnings: defineTable({
		riderRef: v.id("users"),
		tripRef: v.id("trips"),
		amount: v.number(),
		kind: v.union(v.literal("trip"), v.literal("cancellation_flag")),
		createdAt: v.number(),
	})
		.index("by_riderRef_createdAt", ["riderRef", "createdAt"])
		.index("by_tripRef", ["tripRef"]),

	donations: defineTable({
		tripRef: v.id("trips"),
		passengerRef: v.id("users"),
		riderRef: v.id("users"),
		amount: v.number(),
		createdAt: v.number(),
	}).index("by_tripRef", ["tripRef"]),

	feedback: defineTable({
		tripRef: v.id("trips"),
		passengerRef: v.id("users"),
		riderRef: v.id("users"),
		rating: v.number(),
		comment: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_tripRef", ["tripRef"]),

	notifications: defineTable({
		userRef: v.id("users"),
		scope: v.union(
			v.literal("passenger"),
			v.literal("rider"),
			v.literal("admin")
		),
		type: v.string(),
		title: v.string(),
		body: v.string(),
		readAt: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_userRef_scope_createdAt", ["userRef", "scope", "createdAt"])
		.index("by_userRef_createdAt", ["userRef", "createdAt"]),

	disputes: defineTable({
		tripRef: v.optional(v.id("trips")),
		openedByRef: v.id("users"),
		targetUserRef: v.optional(v.id("users")),
		reason: v.string(),
		status: v.union(
			v.literal("open"),
			v.literal("investigating"),
			v.literal("resolved")
		),
		resolution: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_status_createdAt", ["status", "createdAt"])
		.index("by_openedByRef_createdAt", ["openedByRef", "createdAt"]),

	moderationActions: defineTable({
		adminRef: v.id("users"),
		targetUserRef: v.id("users"),
		action: v.union(v.literal("warn"), v.literal("suspend"), v.literal("ban")),
		note: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_targetUserRef_createdAt", ["targetUserRef", "createdAt"]),

	fraudFlags: defineTable({
		targetUserRef: v.id("users"),
		riskScore: v.number(),
		reason: v.string(),
		status: v.union(v.literal("open"), v.literal("reviewed")),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_status_createdAt", ["status", "createdAt"]),

	auditLogs: defineTable({
		actorRef: v.optional(v.id("users")),
		action: v.string(),
		entityType: v.string(),
		entityRef: v.optional(v.string()),
		metadata: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_createdAt", ["createdAt"]),
});
