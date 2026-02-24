import "@/global.css";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { env } from "@openrides/env/native";
import { ConvexReactClient } from "convex/react";
import { Stack, useRouter } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { AppThemeProvider } from "@/contexts/app-theme-context";
import { authClient } from "@/lib/auth-client";

export const unstable_settings = {
	initialRouteName: "index",
};

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL, {
	unsavedChangesWarning: false,
});

function StackLayout() {
	return (
		<Stack screenOptions={{ contentStyle: { backgroundColor: "white" } }}>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="sign-up" options={{ headerShown: false }} />
			<Stack.Screen name="(drawer)" options={{ headerShown: false }} />
			<Stack.Screen
				name="modal"
				options={{ title: "Modal", presentation: "modal" }}
			/>
		</Stack>
	);
}

function AuthGate({ children }: { children: React.ReactNode }) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	useEffect(() => {
		if (isPending) {
			return;
		}
		if (session) {
			router.replace("/(drawer)");
			return;
		}
		router.replace("/");
	}, [isPending, router, session]);

	if (isPending) {
		return null;
	}

	return <>{children}</>;
}

export default function Layout() {
	return (
		<ConvexBetterAuthProvider authClient={authClient} client={convex}>
			<GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider>
							<AuthGate>
								<StackLayout />
							</AuthGate>
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</ConvexBetterAuthProvider>
	);
}
