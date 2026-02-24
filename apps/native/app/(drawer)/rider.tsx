import { api } from "@openrides/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { FullWidthSheet } from "@/components/ui/full-width-sheet";
import { RoundedButton } from "@/components/ui/rounded-button";
import { RoundedInput } from "@/components/ui/rounded-input";
import { authClient } from "@/lib/auth-client";

export default function RiderDashboard() {
	const { data: session, isPending } = authClient.useSession();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		!session || isPending ? "skip" : {}
	);
	const eligibleRequests = useQuery(
		api.openrides.listEligibleRequestsForRider,
		!session || isPending ? "skip" : {}
	);
	const history = useQuery(
		api.openrides.listRiderTripHistory,
		!session || isPending ? "skip" : {}
	);
	const respondToRequest = useMutation(api.openrides.riderRespondToRequest);
	const setAvailability = useMutation(api.openrides.setRiderAvailability);
	const completeOnboarding = useMutation(api.openrides.completeRiderOnboarding);

	const [sheetType, setSheetType] = useState<"service" | "bid" | "ride">(
		"service"
	);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
	const [counterAmount, setCounterAmount] = useState("120");
	const [serviceMode, setServiceMode] = useState<
		"ride_only" | "delivery_only" | "both"
	>("both");
	const [statusMessage, setStatusMessage] = useState("");

	const riderProfile = profileData?.riderProfile;
	const verificationState = riderProfile?.verificationStatus ?? "pending";

	const openBidSheet = (requestRef: string) => {
		setSelectedRequest(requestRef);
		setSheetType("bid");
		setSheetOpen(true);
	};

	const respond = async (action: "accept" | "counter" | "reject") => {
		if (!selectedRequest) {
			return;
		}
		await respondToRequest({
			requestRef: selectedRequest as never,
			action,
			amount:
				action === "counter" ? Number(counterAmount) || undefined : undefined,
		});
		setStatusMessage(`Request ${action}ed.`);
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
					Rider Dashboard
				</Text>
				<Text className="mt-1 text-slate-600 text-xs">
					Verification: {verificationState}. Requests are filtered by selected
					services.
				</Text>
				{statusMessage ? (
					<Text className="mt-2 text-emerald-700 text-xs">{statusMessage}</Text>
				) : null}

				<View className="mt-4 gap-2">
					<RoundedButton
						label="Service Selection + Verification Uploads"
						onPress={() => {
							setSheetType("service");
							setSheetOpen(true);
						}}
						variant="secondary"
					/>
					<RoundedButton
						label={
							riderProfile?.availability ? "Set Unavailable" : "Set Available"
						}
						onPress={() =>
							setAvailability({
								availability: !riderProfile?.availability,
								serviceMode,
							})
						}
					/>
				</View>

				<Text className="mt-6 font-semibold text-base text-slate-900">
					Eligible Requests
				</Text>
				<View className="mt-3 gap-3">
					{(eligibleRequests ?? []).map((request) => (
						<View
							className="rounded-3xl border border-slate-200 bg-white p-4"
							key={request._id}
						>
							<Text className="font-semibold text-slate-900 text-sm">
								{request.serviceType.toUpperCase()} | {request.vehicleType}
							</Text>
							<Text className="mt-1 text-slate-600 text-xs">
								Bid: {request.bidAmount} | Status: {request.status}
							</Text>
							<Text className="mt-1 text-slate-600 text-xs">
								{request.pickupAddress} {"->"} {request.dropoffAddress}
							</Text>
							<View className="mt-3 gap-2">
								<RoundedButton
									label="Accept / Counter / Reject"
									onPress={() => openBidSheet(request._id)}
								/>
								<RoundedButton
									label="Ride Details / Navigation"
									onPress={() => {
										setSheetType("ride");
										setSheetOpen(true);
									}}
									variant="secondary"
								/>
							</View>
						</View>
					))}
				</View>

				<Text className="mt-6 font-semibold text-base text-slate-900">
					Earnings & Completed Trips
				</Text>
				<Text className="mt-2 text-slate-600 text-xs">
					Completed trips: {history?.trips.length ?? 0} | Earnings entries:{" "}
					{history?.earnings.length ?? 0}
				</Text>
			</ScrollView>

			<FullWidthSheet
				onClose={() => setSheetOpen(false)}
				title={
					sheetType === "service"
						? "Driver Service Selection and Verification"
						: sheetType === "ride"
							? "Ride Details and Navigation"
							: "Bid Submission and Counter Offers"
				}
				visible={sheetOpen}
			>
				{sheetType === "service" ? (
					<View className="gap-3">
						<RoundedButton
							label="Ride Only"
							onPress={() => setServiceMode("ride_only")}
							variant={serviceMode === "ride_only" ? "primary" : "secondary"}
						/>
						<RoundedButton
							label="Delivery Only"
							onPress={() => setServiceMode("delivery_only")}
							variant={
								serviceMode === "delivery_only" ? "primary" : "secondary"
							}
						/>
						<RoundedButton
							label="Both"
							onPress={() => setServiceMode("both")}
							variant={serviceMode === "both" ? "primary" : "secondary"}
						/>
						<RoundedButton
							label="Submit Service Selection + Verification Docs"
							onPress={async () => {
								await completeOnboarding({
									serviceMode,
									vehicleTypes: ["motorcycle"],
									phone: profileData?.profile.phone ?? "",
									documents: [
										{
											label: "Driver License",
											uri: "pending-upload://license",
										},
										{
											label: "Vehicle Registration",
											uri: "pending-upload://registration",
										},
									],
								});
								setStatusMessage(
									"Rider onboarding submitted for admin review."
								);
								setSheetOpen(false);
							}}
						/>
					</View>
				) : null}

				{sheetType === "bid" ? (
					<View className="gap-3">
						<RoundedInput
							keyboardType="numeric"
							label="Counter Amount"
							onChangeText={setCounterAmount}
							placeholder="120"
							value={counterAmount}
						/>
						<RoundedButton label="Accept" onPress={() => respond("accept")} />
						<RoundedButton
							label="Counter"
							onPress={() => respond("counter")}
							variant="secondary"
						/>
						<RoundedButton
							label="Reject"
							onPress={() => respond("reject")}
							variant="danger"
						/>
					</View>
				) : null}

				{sheetType === "ride" ? (
					<View className="gap-3">
						<Text className="text-slate-600 text-sm">
							Navigation and trip status controls stay in this full-width sheet.
						</Text>
						<RoundedButton
							label="Start"
							onPress={() =>
								setStatusMessage(
									"Trip status set to START. Wire to active trip record in next pass."
								)
							}
						/>
						<RoundedButton
							label="Arrived"
							onPress={() => setStatusMessage("Trip status set to ARRIVED.")}
							variant="secondary"
						/>
						<RoundedButton
							label="Complete"
							onPress={() => setStatusMessage("Trip status set to COMPLETE.")}
						/>
						<RoundedButton
							label="Cancel"
							onPress={() => setStatusMessage("Trip status set to CANCELLED.")}
							variant="danger"
						/>
					</View>
				) : null}
			</FullWidthSheet>
		</Container>
	);
}
