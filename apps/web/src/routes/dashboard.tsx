import { api } from "@openrides/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvexAuth,
	useQuery,
} from "convex/react";
import { useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import UserMenu from "@/components/user-menu";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(false);
	const { isAuthenticated } = useConvexAuth();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		isAuthenticated ? {} : "skip"
	);
	const profile = profileData?.profile;

	return (
		<>
			<Authenticated>
				<div className="mx-auto mt-10 grid w-full max-w-3xl gap-4 px-4">
					<h1 className="font-bold text-3xl">OpenRides Dashboard</h1>
					{profile?.isAdmin ? (
						<p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800 text-sm">
							System Admin enabled for this account.
						</p>
					) : null}
					<div className="grid gap-3 md:grid-cols-3">
						<a className="rounded-md border p-4" href="/passenger">
							Passenger Workspace
						</a>
						<a className="rounded-md border p-4" href="/rider">
							Rider Workspace
						</a>
						<a className="rounded-md border p-4" href="/admin">
							Admin Workspace
						</a>
					</div>
					<UserMenu />
				</div>
			</Authenticated>
			<Unauthenticated>
				{showSignIn ? (
					<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
				) : (
					<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
				)}
			</Unauthenticated>
			<AuthLoading>
				<div>Loading...</div>
			</AuthLoading>
		</>
	);
}
