import {
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from "@expo/vector-icons";
import { api } from "@openrides/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { RoundedButton } from "@/components/ui/rounded-button";
import { authClient } from "@/lib/auth-client";

export default function HomeScreen() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		!session || isPending ? "skip" : {}
	);

	const profile = profileData?.profile;
	const riderProfile = profileData?.riderProfile;

	const handleSignOut = async () => {
		await authClient.signOut();
	};

	if (isPending) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center bg-white">
				<Text className="text-slate-500 text-sm">Loading session...</Text>
			</SafeAreaView>
		);
	}

	if (!session) {
		return (
			<SafeAreaView className="flex-1 items-center justify-center bg-white">
				<Text className="text-slate-500 text-sm">Please sign in again.</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView className="flex-1 px-4 py-6">
				<Text className="text-slate-500 text-sm">Welcome back,</Text>
				<Text className="font-bold text-3xl text-slate-900">
					{profile?.name ?? "..."}
				</Text>
				{profile?.isAdmin ? (
					<View className="mt-2 self-start rounded-full bg-amber-100 px-3 py-1">
						<Text className="font-semibold text-amber-700 text-xs">
							System Admin
						</Text>
					</View>
				) : null}

				<View className="mt-8 gap-3">
					<Pressable
						className="flex-row items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5"
						onPress={() => router.push("/(drawer)/passenger")}
					>
						<View className="rounded-2xl bg-blue-50 p-3">
							<MaterialCommunityIcons
								color="#2563eb"
								name="account-heart-outline"
								size={28}
							/>
						</View>
						<View className="flex-1">
							<Text className="font-semibold text-base text-slate-900">
								Passenger
							</Text>
							<Text className="text-slate-500 text-xs">
								Book rides and deliveries
							</Text>
						</View>
						<Ionicons color="#94a3b8" name="chevron-forward" size={18} />
					</Pressable>

					{profile?.roles.includes("rider") ? (
						<Pressable
							className="flex-row items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5"
							onPress={() => router.push("/(drawer)/rider")}
						>
							<View className="rounded-2xl bg-blue-50 p-3">
								<MaterialCommunityIcons
									color="#2563eb"
									name="bike-fast"
									size={28}
								/>
							</View>
							<View className="flex-1">
								<Text className="font-semibold text-base text-slate-900">
									Rider / Driver
								</Text>
								<Text className="text-slate-500 text-xs">
									Manage availability and earn
								</Text>
								{riderProfile ? (
									<View className="mt-1 self-start rounded-full bg-amber-100 px-2 py-0.5">
										<Text className="text-amber-700 text-xs">
											Verification:{" "}
											{riderProfile.verificationStatus === "approved"
												? "Approved"
												: "Pending"}
										</Text>
									</View>
								) : null}
							</View>
							<Ionicons color="#94a3b8" name="chevron-forward" size={18} />
						</Pressable>
					) : null}

					{profile?.isAdmin ? (
						<Pressable
							className="flex-row items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5"
							onPress={() => router.push("/(drawer)/admin")}
						>
							<View className="rounded-2xl bg-rose-50 p-3">
								<MaterialIcons
									color="#dc2626"
									name="admin-panel-settings"
									size={28}
								/>
							</View>
							<View className="flex-1">
								<Text className="font-semibold text-base text-slate-900">
									System Admin
								</Text>
								<Text className="text-slate-500 text-xs">
									Manage platform and users
								</Text>
							</View>
							<Ionicons color="#94a3b8" name="chevron-forward" size={18} />
						</Pressable>
					) : null}
				</View>

				<View className="mt-8">
					<RoundedButton
						label="Sign Out"
						onPress={handleSignOut}
						variant="danger"
					/>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
