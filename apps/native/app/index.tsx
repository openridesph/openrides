import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { RoundedButton } from "@/components/ui/rounded-button";
import { RoundedInput } from "@/components/ui/rounded-input";
import { authClient } from "@/lib/auth-client";

function getAuthErrorMessage(error: unknown, fallback: string) {
	if (error && typeof error === "object") {
		const err = error as {
			message?: string;
			status?: number;
			response?: { status?: number };
		};
		const status = err.status ?? err.response?.status;
		if (status === 401) {
			return "Invalid email or password. If this is a fresh deployment, create the first account from Sign Up first.";
		}
		if (typeof err.message === "string" && err.message.includes("401")) {
			return "Invalid email or password.";
		}
		if (typeof err.message === "string" && err.message.trim().length > 0) {
			return err.message;
		}
	}
	return fallback;
}

export default function SignInScreen() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSignIn = async () => {
		const normalizedEmail = email.trim().toLowerCase();
		const normalizedPassword = password.trim();

		if (!(normalizedEmail && normalizedPassword)) {
			setError("Email and password are required.");
			return;
		}

		try {
			setIsLoading(true);
			setError("");
			await authClient.signIn.email({
				email: normalizedEmail,
				password: normalizedPassword,
			});
			// _layout.tsx useSession redirect fires automatically to /(drawer)
		} catch (err) {
			setError(getAuthErrorMessage(err, "Sign in failed. Please try again."));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 items-center justify-center px-6">
				<Text className="font-bold text-5xl text-blue-600">OpenRides</Text>
				<Text className="mt-2 text-center text-slate-500 text-sm">
					Community-powered rides and deliveries
				</Text>
			</View>

			<View className="mx-4 mb-10 rounded-3xl border border-slate-200 bg-white p-5">
				<RoundedInput
					keyboardType="email-address"
					label="Email"
					onChangeText={setEmail}
					placeholder="you@example.com"
					value={email}
				/>
				<View className="mt-3">
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
						label={isLoading ? "Signing in..." : "Sign In"}
						onPress={handleSignIn}
						variant="primary"
					/>
				</View>

				<View className="my-3 flex-row items-center gap-2">
					<View className="h-px flex-1 bg-slate-200" />
					<Text className="text-slate-400 text-xs">or</Text>
					<View className="h-px flex-1 bg-slate-200" />
				</View>

				<RoundedButton
					label="Create Account"
					onPress={() => router.push("/sign-up")}
					variant="secondary"
				/>

				{error ? (
					<Text className="mt-2 text-center text-rose-600 text-xs">
						{error}
					</Text>
				) : null}
			</View>
		</SafeAreaView>
	);
}
