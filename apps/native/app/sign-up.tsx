import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "@openrides/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { RoundedButton } from "@/components/ui/rounded-button";
import { RoundedInput } from "@/components/ui/rounded-input";
import { authClient } from "@/lib/auth-client";

type Step = "role" | "form";
type Role = "passenger" | "rider";
const AUTH_POLL_ATTEMPTS = 20;
const AUTH_POLL_DELAY_MS = 250;
const FINALIZE_ATTEMPTS = 8;
const FINALIZE_DELAY_MS = 250;

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function isUnauthenticatedError(error: unknown) {
	if (!(error instanceof Error)) {
		return false;
	}

	return error.message.toLowerCase().includes("unauthenticated");
}

export default function SignUpScreen() {
	const router = useRouter();
	const finalizeSignupRole = useMutation(api.openrides.finalizeSignupRole);
	const updateMyProfile = useMutation(api.openrides.updateMyProfile);
	const [step, setStep] = useState<Step>("role");
	const [role, setRole] = useState<Role>("passenger");
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState("");

	const selectRole = (selected: Role) => {
		setRole(selected);
		setStep("form");
	};

	const handleCreateAccount = async () => {
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedPassword = password.trim();
		const normalizedName = name.trim();

		if (!(normalizedEmail && normalizedPassword && normalizedName)) {
			setStatusMessage("Name, email, and password are required.");
			return;
		}

		try {
			setIsLoading(true);
			setStatusMessage("");
			await authClient.signUp.email({
				email: normalizedEmail,
				password: normalizedPassword,
				name: normalizedName,
			});

			let isAuthReady = false;
			for (let attempt = 0; attempt < AUTH_POLL_ATTEMPTS; attempt += 1) {
				const sessionResult = await authClient.getSession({
					fetchOptions: { throw: false },
				});
				const tokenResult = await authClient.convex.token({
					fetchOptions: { throw: false },
				});

				if (sessionResult.data?.session && tokenResult.data?.token) {
					isAuthReady = true;
					break;
				}

				await sleep(AUTH_POLL_DELAY_MS);
			}
			if (!isAuthReady) {
				throw new Error(
					"Account created, but auth is still syncing. Please sign in again."
				);
			}

			let finalized = false;
			for (let attempt = 0; attempt < FINALIZE_ATTEMPTS; attempt += 1) {
				try {
					await finalizeSignupRole({ role });
					if (phone.trim()) {
						await updateMyProfile({ phone: phone.trim() });
					}
					finalized = true;
					break;
				} catch (error) {
					if (
						!isUnauthenticatedError(error) ||
						attempt === FINALIZE_ATTEMPTS - 1
					) {
						throw error;
					}
					await sleep(FINALIZE_DELAY_MS);
				}
			}
			if (!finalized) {
				throw new Error(
					"Account created, but role setup is still syncing. Please sign in again."
				);
			}

			if (role === "rider") {
				router.replace("/(drawer)/rider");
			} else {
				router.replace("/(drawer)/passenger");
			}
		} catch (err) {
			setStatusMessage(
				err instanceof Error ? err.message : "Sign up failed. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (step === "role") {
		return (
			<SafeAreaView className="flex-1 bg-white">
				{/* Header */}
				<View className="flex-row items-center px-5 pt-4 pb-2">
					<Pressable className="p-1" onPress={() => router.back()}>
						<Ionicons color="#334155" name="chevron-back" size={24} />
					</Pressable>
					<Text className="ml-3 font-semibold text-slate-900 text-xl">
						Join OpenRides
					</Text>
				</View>

				{/* Body */}
				<View className="px-5 pt-8">
					<Text className="font-bold text-2xl text-slate-900">
						How will you use OpenRides?
					</Text>
					<Text className="mt-1 mb-8 text-slate-500 text-sm">
						Choose your primary role
					</Text>

					{/* Passenger card */}
					<Pressable
						className="mb-4 rounded-3xl border-2 border-slate-200 p-6"
						onPress={() => selectRole("passenger")}
					>
						<MaterialCommunityIcons
							color="#2563eb"
							name="account-heart-outline"
							size={40}
						/>
						<Text className="mt-3 font-semibold text-slate-900 text-xl">
							I need rides
						</Text>
						<Text className="mt-1 text-slate-500 text-sm">
							Book rides and deliveries as a passenger
						</Text>
					</Pressable>

					{/* Rider card */}
					<Pressable
						className="rounded-3xl border-2 border-slate-200 p-6"
						onPress={() => selectRole("rider")}
					>
						<MaterialCommunityIcons
							color="#2563eb"
							name="bike-fast"
							size={40}
						/>
						<Text className="mt-3 font-semibold text-slate-900 text-xl">
							I'm a driver
						</Text>
						<Text className="mt-1 text-slate-500 text-sm">
							Offer rides and earn, also includes passenger access
						</Text>
						<View className="mt-3 self-start rounded-full bg-amber-100 px-3 py-1">
							<Text className="font-medium text-amber-700 text-xs">
								Includes passenger account
							</Text>
						</View>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	// Step: form
	return (
		<SafeAreaView className="flex-1 bg-white">
			{/* Header */}
			<View className="flex-row items-center px-5 pt-4 pb-2">
				<Pressable className="p-1" onPress={() => setStep("role")}>
					<Ionicons color="#334155" name="chevron-back" size={24} />
				</Pressable>
				<Text className="ml-3 font-semibold text-slate-900 text-xl">
					Create Account
				</Text>
			</View>

			<ScrollView
				className="px-5"
				contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
			>
				{/* Role badge */}
				<View className="mb-4 self-start rounded-full bg-blue-100 px-3 py-1">
					<Text className="font-medium text-blue-700 text-xs">
						Signing up as:{" "}
						{role === "passenger" ? "Passenger" : "Rider / Driver"}
					</Text>
				</View>

				{/* First-signup admin notice */}
				<View className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-3">
					<Text className="text-amber-800 text-xs">
						The first account created on a new deployment is automatically
						assigned as System Admin.
					</Text>
				</View>

				<View className="gap-3">
					<RoundedInput
						label="Full Name"
						onChangeText={setName}
						placeholder="Your full name"
						value={name}
					/>
					<RoundedInput
						keyboardType="phone-pad"
						label="Phone"
						onChangeText={setPhone}
						placeholder="+63 912 345 6789"
						value={phone}
					/>
					<RoundedInput
						keyboardType="email-address"
						label="Email"
						onChangeText={setEmail}
						placeholder="you@example.com"
						value={email}
					/>
					<RoundedInput
						label="Password"
						onChangeText={setPassword}
						placeholder="Password"
						secureTextEntry
						value={password}
					/>
				</View>

				<View className="mt-4">
					<RoundedButton
						disabled={isLoading}
						label={isLoading ? "Creating account..." : "Create Account"}
						onPress={handleCreateAccount}
						variant="primary"
					/>
				</View>

				{statusMessage ? (
					<Text className="mt-2 text-center text-rose-600 text-xs">
						{statusMessage}
					</Text>
				) : null}

				<Pressable className="mt-4" onPress={() => router.back()}>
					<Text className="text-center text-blue-600 text-sm">
						Already have an account? Sign In
					</Text>
				</Pressable>
			</ScrollView>
		</SafeAreaView>
	);
}
