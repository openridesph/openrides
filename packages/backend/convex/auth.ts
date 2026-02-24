import { expo } from "@better-auth/expo";
import {
	type AuthFunctions,
	createClient,
	type GenericCtx,
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { components, internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL || "http://localhost:3001";
const nativeAppUrl = process.env.NATIVE_APP_URL || "openrides://";

const authFunctions: AuthFunctions = (internal as { auth: AuthFunctions }).auth;

export const authComponent = createClient<DataModel>(
	components.betterAuth as unknown as Parameters<typeof createClient>[0],
	{
		authFunctions,
		triggers: {
			user: {
				onCreate: async (
					ctx,
					doc: {
						_id: string;
						email?: string | null;
						name?: string | null;
						userId?: string | null;
					}
				) => {
					const ts = Date.now();
					let userRef = doc.userId as Id<"users"> | undefined;

					if (!userRef) {
						userRef = await ctx.db.insert("users", {});
						await authComponent.setUserId(ctx, doc._id, userRef);
					}

					const existingProfile = await ctx.db
						.query("userProfiles")
						.withIndex("by_userRef", (q) => q.eq("userRef", userRef))
						.first();

					if (existingProfile) {
						return;
					}

					const existingAnyProfile = await ctx.db.query("userProfiles").first();
					const isFirstSystemUser = !existingAnyProfile;

					await ctx.db.insert("userProfiles", {
						userRef,
						name: doc.name ?? undefined,
						email: doc.email ?? undefined,
						roles: ["passenger"],
						activeRole: "passenger",
						isAdmin: isFirstSystemUser,
						status: "active",
						createdAt: ts,
						updatedAt: ts,
					});

					if (isFirstSystemUser) {
						await ctx.db.insert("auditLogs", {
							actorRef: userRef,
							action: "system.bootstrap_admin_assigned",
							entityType: "userProfiles",
							metadata: doc.email ?? doc.name ?? "initial-user",
							createdAt: ts,
						});
					}

					await ctx.db.insert("riderProfiles", {
						userRef,
						verificationStatus: "pending",
						serviceMode: "ride_only",
						vehicleTypes: [],
						availability: false,
						documents: [],
						createdAt: ts,
						updatedAt: ts,
					});
				},
			},
		},
	}
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
	console.log("DEBUG: Environment", process.env.ENVIRONMENT);
	return {
		trustedOrigins: [
			siteUrl,
			nativeAppUrl,
			...(process.env.ENVIRONMENT === "development"
				? ["exp://localhost:8081", "exp://192.168.5.80:8081"]
				: []),
		],
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		advanced: {
			defaultCookieAttributes: {
				sameSite: "none",
				secure: true,
				httpOnly: true,
			},
		},
		plugins: [
			expo(),
			convex({ authConfig }),
			crossDomain({ siteUrl }),
		] as unknown as Parameters<typeof betterAuth>[0]["plugins"],
	} satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth(createAuthOptions(ctx));
};

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userMetadata = await authComponent.getAuthUser(
			ctx as unknown as GenericCtx<DataModel>
		);
		if (!userMetadata) {
			return null;
		}
		const user = await ctx.db.get(userMetadata.userId as Id<"users">);
		return {
			...user,
			...userMetadata,
		};
	},
});
