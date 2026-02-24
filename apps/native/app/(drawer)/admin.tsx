import { api } from "@openrides/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { FullWidthSheet } from "@/components/ui/full-width-sheet";
import { RoundedButton } from "@/components/ui/rounded-button";
import { RoundedInput } from "@/components/ui/rounded-input";
import { authClient } from "@/lib/auth-client";

export default function AdminDashboard() {
	const { data: session, isPending } = authClient.useSession();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		!session || isPending ? "skip" : {}
	);
	const isAdmin = profileData?.profile.isAdmin === true;
	const dashboard = useQuery(
		api.admin.getDashboard,
		!session || isPending || !isAdmin ? "skip" : {}
	);
	const pending = useQuery(
		api.admin.listPendingVerifications,
		!session || isPending || !isAdmin ? "skip" : {}
	);
	const disputes = useQuery(
		api.admin.listDisputes,
		!session || isPending || !isAdmin ? "skip" : {}
	);
	const reviewRider = useMutation(api.admin.reviewRiderVerification);
	const resolveDispute = useMutation(api.admin.resolveDispute);
	const moderateUser = useMutation(api.admin.moderateUser);

	const [sheetOpen, setSheetOpen] = useState(false);
	const [sheetMode, setSheetMode] = useState<
		"verification" | "dispute" | "moderation"
	>("verification");
	const [selectedRef, setSelectedRef] = useState<string | null>(null);
	const [note, setNote] = useState("");

	const openSheet = (
		mode: "verification" | "dispute" | "moderation",
		ref: string
	) => {
		setSheetMode(mode);
		setSelectedRef(ref);
		setSheetOpen(true);
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

	if (!isAdmin) {
		return (
			<Container>
				<View className="flex-1 items-center justify-center">
					<Text className="text-slate-500 text-sm">
						Admin privileges required.
					</Text>
				</View>
			</Container>
		);
	}

	return (
		<Container>
			<ScrollView className="flex-1 px-4 py-6">
				<Text className="font-bold text-2xl text-slate-900">
					System Admin Dashboard
				</Text>
				<Text className="mt-1 text-slate-600 text-sm">
					Pending verifications, ongoing ops, moderation, analytics, and
					disputes.
				</Text>

				<View className="mt-4 rounded-3xl border border-slate-200 bg-white p-4">
					<Text className="text-slate-700 text-sm">
						Pending verifications: {dashboard?.pendingVerificationCount ?? 0}
					</Text>
					<Text className="text-slate-700 text-sm">
						Active rides/deliveries: {dashboard?.activeTripCount ?? 0}
					</Text>
					<Text className="text-slate-700 text-sm">
						Open disputes: {dashboard?.openDisputeCount ?? 0}
					</Text>
					<Text className="text-slate-700 text-sm">
						Rides: {dashboard?.totalTrips ?? 0}
					</Text>
					<Text className="text-slate-700 text-sm">
						Earnings total: {dashboard?.totalEarnings ?? 0}
					</Text>
					<Text className="text-slate-700 text-sm">
						Donations total: {dashboard?.totalDonations ?? 0}
					</Text>
				</View>

				<Text className="mt-5 font-semibold text-base text-slate-900">
					Pending Driver Verification
				</Text>
				<View className="mt-3 gap-3">
					{(pending ?? []).map((riderProfile) => (
						<View
							className="rounded-3xl border border-slate-200 bg-white p-4"
							key={riderProfile._id}
						>
							<Text className="font-semibold text-slate-900 text-sm">
								Rider {riderProfile.userRef} | {riderProfile.serviceMode}
							</Text>
							<RoundedButton
								label="Review Verification (Full-Width Sheet)"
								onPress={() => openSheet("verification", riderProfile._id)}
								variant="secondary"
							/>
						</View>
					))}
				</View>

				<Text className="mt-5 font-semibold text-base text-slate-900">
					Disputes
				</Text>
				<View className="mt-3 gap-3">
					{(disputes ?? []).map((dispute) => (
						<View
							className="rounded-3xl border border-slate-200 bg-white p-4"
							key={dispute._id}
						>
							<Text className="font-semibold text-slate-900 text-sm">
								Dispute {dispute._id}
							</Text>
							<Text className="text-slate-600 text-xs">{dispute.reason}</Text>
							<View className="mt-2 gap-2">
								<RoundedButton
									label="Resolve Dispute (Full-Width Sheet)"
									onPress={() => openSheet("dispute", dispute._id)}
									variant="secondary"
								/>
								<RoundedButton
									label="Moderate User (Full-Width Sheet)"
									onPress={() => openSheet("moderation", dispute.openedByRef)}
									variant="danger"
								/>
							</View>
						</View>
					))}
				</View>
			</ScrollView>

			<FullWidthSheet
				onClose={() => setSheetOpen(false)}
				title={
					sheetMode === "verification"
						? "Driver Verification Review"
						: sheetMode === "dispute"
							? "Dispute Resolution"
							: "Moderation Dialog"
				}
				visible={sheetOpen}
			>
				<View className="gap-3">
					<RoundedInput
						label="Admin note"
						onChangeText={setNote}
						placeholder="Reason / moderation note"
						value={note}
					/>
					{sheetMode === "verification" ? (
						<>
							<RoundedButton
								label="Approve"
								onPress={async () => {
									if (!selectedRef) {
										return;
									}
									await reviewRider({
										riderProfileRef: selectedRef as never,
										decision: "approve",
										reason: note || undefined,
									});
									setSheetOpen(false);
								}}
							/>
							<RoundedButton
								label="Reject"
								onPress={async () => {
									if (!selectedRef) {
										return;
									}
									await reviewRider({
										riderProfileRef: selectedRef as never,
										decision: "reject",
										reason: note || "Missing required docs",
									});
									setSheetOpen(false);
								}}
								variant="danger"
							/>
						</>
					) : null}

					{sheetMode === "dispute" ? (
						<RoundedButton
							label="Resolve"
							onPress={async () => {
								if (!selectedRef) {
									return;
								}
								await resolveDispute({
									disputeRef: selectedRef as never,
									resolution: note || "Resolved by admin",
								});
								setSheetOpen(false);
							}}
						/>
					) : null}

					{sheetMode === "moderation" ? (
						<>
							<RoundedButton
								label="Warn User"
								onPress={async () => {
									if (!selectedRef) {
										return;
									}
									await moderateUser({
										targetUserRef: selectedRef as never,
										action: "warn",
										note,
									});
									setSheetOpen(false);
								}}
								variant="secondary"
							/>
							<RoundedButton
								label="Suspend User"
								onPress={async () => {
									if (!selectedRef) {
										return;
									}
									await moderateUser({
										targetUserRef: selectedRef as never,
										action: "suspend",
										note,
									});
									setSheetOpen(false);
								}}
								variant="danger"
							/>
						</>
					) : null}
				</View>
			</FullWidthSheet>
		</Container>
	);
}
