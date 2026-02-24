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
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/passenger")({
	component: PassengerRoute,
});

function PassengerRoute() {
	const { isAuthenticated } = useConvexAuth();
	const requests = useQuery(
		api.openrides.listPassengerActiveRequests,
		isAuthenticated ? {} : "skip"
	);
	const createRequest = useMutation(api.openrides.createRequest);
	const cancelRequest = useMutation(api.openrides.cancelRequest);
	const [pickupAddress, setPickupAddress] = useState("");
	const [dropoffAddress, setDropoffAddress] = useState("");
	const [bidAmount, setBidAmount] = useState("100");

	return (
		<>
			<Authenticated>
				<div className="mx-auto grid w-full max-w-3xl gap-4 px-4 py-8">
					<h1 className="font-bold text-2xl">Passenger</h1>
					<div className="grid gap-2 rounded-md border p-4">
						<Input
							onChange={(e) => setPickupAddress(e.target.value)}
							placeholder="Pickup address"
							value={pickupAddress}
						/>
						<Input
							onChange={(e) => setDropoffAddress(e.target.value)}
							placeholder="Dropoff address"
							value={dropoffAddress}
						/>
						<Input
							onChange={(e) => setBidAmount(e.target.value)}
							placeholder="Bid amount"
							value={bidAmount}
						/>
						<Button
							onClick={() =>
								createRequest({
									serviceType: "ride",
									vehicleType: "motorcycle",
									pickupAddress,
									dropoffAddress,
									bidAmount: Number(bidAmount) || 0,
								})
							}
						>
							Create Request
						</Button>
					</div>
					<div className="grid gap-2">
						{requests?.map((request) => (
							<div className="rounded-md border p-3" key={request._id}>
								<p className="text-sm">
									{request.serviceType} {request.vehicleType} | {request.status}{" "}
									| {request.bidAmount}
								</p>
								<Button
									onClick={() => cancelRequest({ requestRef: request._id })}
									variant="destructive"
								>
									Cancel
								</Button>
							</div>
						))}
					</div>
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
