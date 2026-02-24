import { api } from "@openrides/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { FullWidthSheet } from "@/components/ui/full-width-sheet";
import { RoundedButton } from "@/components/ui/rounded-button";
import { RoundedInput } from "@/components/ui/rounded-input";
import { authClient } from "@/lib/auth-client";

export default function PassengerDashboard() {
	const { data: session, isPending } = authClient.useSession();
	const activeRequests = useQuery(
		api.openrides.listPassengerActiveRequests,
		!session || isPending ? "skip" : {}
	);
	const createRequest = useMutation(api.openrides.createRequest);
	const cancelRequest = useMutation(api.openrides.cancelRequest);
	const [serviceType, setServiceType] = useState<"ride" | "delivery">("ride");
	const [vehicleType, setVehicleType] = useState<
		"tricycle" | "motorcycle" | "car" | "taxi"
	>("motorcycle");
	const [pickupAddress, setPickupAddress] = useState("");
	const [dropoffAddress, setDropoffAddress] = useState("");
	const [bidAmount, setBidAmount] = useState("100");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");

	const sortedRequests = useMemo(
		() => [...(activeRequests ?? [])].sort((a, b) => b.createdAt - a.createdAt),
		[activeRequests]
	);

	const submitRequest = async () => {
		const amount = Number(bidAmount) || 0;
		const result = await createRequest({
			serviceType,
			vehicleType,
			pickupAddress,
			dropoffAddress,
			bidAmount: amount,
		});
		if (result.bidTooLowWarning) {
			setStatusMessage(
				`Bid submitted with warning. Suggested minimum: ${result.suggestedMinimum}`
			);
		} else {
			setStatusMessage("Request submitted.");
		}
		setSheetOpen(false);
	};

	if (isPending) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Text className="text-slate-500 text-sm">Loading session...</Text>
				</View>
			</Container>
		);
	}

	if (!session) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Text className="text-slate-500 text-sm">Please sign in again.</Text>
				</View>
			</Container>
		);
	}

	return (
		<Container>
			<ScrollView className="flex-1 px-4 py-6">
				<Text className="font-bold text-2xl text-slate-900">
					Passenger Dashboard
				</Text>
				<Text className="mt-1 text-slate-600 text-sm">
					Active ride and delivery requests with role-scoped negotiation.
				</Text>
				<View className="mt-4">
					<RoundedButton
						label="Create Request"
						onPress={() => setSheetOpen(true)}
					/>
				</View>
				{statusMessage ? (
					<Text className="mt-3 text-emerald-700 text-xs">{statusMessage}</Text>
				) : null}

				<View className="mt-5 gap-3">
					{(sortedRequests ?? []).map((request) => (
						<View
							className="rounded-3xl border border-slate-200 bg-white p-4"
							key={request._id}
						>
							<Text className="font-semibold text-base text-slate-900">
								{request.serviceType.toUpperCase()} - {request.vehicleType}
							</Text>
							<Text className="mt-1 text-slate-600 text-xs">
								Status: {request.status} | Bid: {request.bidAmount}
							</Text>
							<Text className="mt-1 text-slate-600 text-xs">
								ETA updates + counter-offers on next revision.
							</Text>
							<View className="mt-3 gap-2">
								<RoundedButton
									label="Counter (Sheet)"
									onPress={() => setSheetOpen(true)}
									variant="secondary"
								/>
								<RoundedButton
									label="Cancel Request"
									onPress={() => cancelRequest({ requestRef: request._id })}
									variant="danger"
								/>
							</View>
						</View>
					))}
					{activeRequests?.length === 0 ? (
						<View className="rounded-3xl border border-slate-300 border-dashed p-4">
							<Text className="text-slate-600 text-sm">
								No active requests. Create one to start negotiation.
							</Text>
						</View>
					) : null}
				</View>
			</ScrollView>

			<FullWidthSheet
				onClose={() => setSheetOpen(false)}
				title="Request, Bid, and Counter Offer"
				visible={sheetOpen}
			>
				<View className="gap-3">
					<RoundedButton
						label="Service: Ride"
						onPress={() => setServiceType("ride")}
						variant={serviceType === "ride" ? "primary" : "secondary"}
					/>
					<RoundedButton
						label="Service: Delivery"
						onPress={() => setServiceType("delivery")}
						variant={serviceType === "delivery" ? "primary" : "secondary"}
					/>
					<Text className="font-medium text-slate-700 text-sm">
						Vehicle Type: {vehicleType}
					</Text>
					<RoundedButton
						label="Tricycle"
						onPress={() => setVehicleType("tricycle")}
						variant={vehicleType === "tricycle" ? "primary" : "secondary"}
					/>
					<RoundedButton
						label="Motorcycle"
						onPress={() => setVehicleType("motorcycle")}
						variant={vehicleType === "motorcycle" ? "primary" : "secondary"}
					/>
					<RoundedButton
						label="Car"
						onPress={() => setVehicleType("car")}
						variant={vehicleType === "car" ? "primary" : "secondary"}
					/>
					<RoundedButton
						label="Taxi"
						onPress={() => setVehicleType("taxi")}
						variant={vehicleType === "taxi" ? "primary" : "secondary"}
					/>
					<RoundedInput
						label="Pickup"
						onChangeText={setPickupAddress}
						placeholder="Pickup location"
						value={pickupAddress}
					/>
					<RoundedInput
						label="Dropoff"
						onChangeText={setDropoffAddress}
						placeholder="Dropoff location"
						value={dropoffAddress}
					/>
					<RoundedInput
						keyboardType="numeric"
						label="Bid Amount"
						onChangeText={setBidAmount}
						placeholder="100"
						value={bidAmount}
					/>
					<RoundedButton label="Submit Bid Request" onPress={submitRequest} />
				</View>
			</FullWidthSheet>
		</Container>
	);
}
