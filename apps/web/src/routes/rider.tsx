import { api } from "@openrides/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvexAuth,
	useMutation,
	useQuery,
} from "convex/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rider")({
	component: RiderRoute,
});

function RiderRoute() {
	const { isAuthenticated } = useConvexAuth();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		isAuthenticated ? {} : "skip"
	);
	const requests = useQuery(
		api.openrides.listEligibleRequestsForRider,
		isAuthenticated ? {} : "skip"
	);
	const history = useQuery(
		api.openrides.listRiderTripHistory,
		isAuthenticated ? {} : "skip"
	);
	const setAvailability = useMutation(api.openrides.setRiderAvailability);
	const respondToRequest = useMutation(api.openrides.riderRespondToRequest);
	const [serviceMode, setServiceMode] = useState<
		"ride_only" | "delivery_only" | "both"
	>("both");

	return (
		<>
			<Authenticated>
				<div className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-8">
					<h1 className="font-bold text-2xl">Rider</h1>
					<p className="text-sm">
						Verification:{" "}
						{profileData?.riderProfile?.verificationStatus ?? "pending"}
					</p>
					<div className="flex gap-2">
						<Button
							onClick={() => setServiceMode("ride_only")}
							variant="outline"
						>
							Ride Only
						</Button>
						<Button
							onClick={() => setServiceMode("delivery_only")}
							variant="outline"
						>
							Delivery Only
						</Button>
						<Button onClick={() => setServiceMode("both")} variant="outline">
							Both
						</Button>
						<Button
							onClick={() =>
								setAvailability({
									availability: !(
										profileData?.riderProfile?.availability ?? false
									),
									serviceMode,
								})
							}
						>
							Toggle Availability
						</Button>
					</div>
					<div className="grid gap-2">
						{requests?.map((request) => (
							<div className="rounded-md border p-3" key={request._id}>
								<p className="text-sm">
									{request.serviceType} {request.vehicleType} | Bid{" "}
									{request.bidAmount}
								</p>
								<div className="mt-2 flex gap-2">
									<Button
										onClick={() =>
											respondToRequest({
												action: "accept",
												requestRef: request._id,
											})
										}
									>
										Accept
									</Button>
									<Button
										onClick={() =>
											respondToRequest({
												action: "counter",
												requestRef: request._id,
												amount: request.bidAmount + 20,
											})
										}
										variant="outline"
									>
										Counter
									</Button>
									<Button
										onClick={() =>
											respondToRequest({
												action: "reject",
												requestRef: request._id,
											})
										}
										variant="destructive"
									>
										Reject
									</Button>
								</div>
							</div>
						))}
					</div>
					<p className="text-sm">
						Completed trips: {history?.trips.length ?? 0} | Earnings entries:{" "}
						{history?.earnings.length ?? 0}
					</p>
				</div>
			</Authenticated>
			<Unauthenticated>
				<div className="p-8">Please sign in.</div>
			</Unauthenticated>
			<AuthLoading>
				<div className="p-8">Loading...</div>
			</AuthLoading>
		</>
	);
}
