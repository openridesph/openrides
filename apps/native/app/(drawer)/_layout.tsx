import {
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from "@expo/vector-icons";
import { api } from "@openrides/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Drawer } from "expo-router/drawer";
import { authClient } from "@/lib/auth-client";

const DrawerLayout = () => {
	const { data: session, isPending } = authClient.useSession();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		!session || isPending ? "skip" : {}
	);

	const isRider = profileData?.profile?.roles.includes("rider") ?? false;
	const isAdmin = profileData?.profile?.isAdmin ?? false;

	return (
		<Drawer
			screenOptions={{ sceneContainerStyle: { backgroundColor: "white" } }}
		>
			<Drawer.Screen
				name="todos"
				options={{ drawerItemStyle: { display: "none" } }}
			/>
			<Drawer.Screen
				name="(tabs)"
				options={{ drawerItemStyle: { display: "none" } }}
			/>
			<Drawer.Screen
				name="index"
				options={{
					headerTitle: "Home",
					drawerLabel: "Home",
					drawerIcon: ({ size, color }) => (
						<Ionicons color={color} name="home-outline" size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="passenger"
				options={{
					headerTitle: "Passenger Dashboard",
					drawerLabel: "Passenger",
					drawerIcon: ({ size, color }) => (
						<MaterialCommunityIcons
							color={color}
							name="account-heart-outline"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="rider"
				options={{
					headerTitle: "Rider Dashboard",
					drawerLabel: "Rider",
					drawerItemStyle: isRider ? undefined : { display: "none" },
					drawerIcon: ({ size, color }) => (
						<MaterialCommunityIcons
							color={color}
							name="bike-fast"
							size={size}
						/>
					),
				}}
			/>
			<Drawer.Screen
				name="admin"
				options={{
					headerTitle: "Admin Dashboard",
					drawerLabel: "Admin",
					drawerItemStyle: isAdmin ? undefined : { display: "none" },
					drawerIcon: ({ size, color }) => (
						<MaterialIcons
							color={color}
							name="admin-panel-settings"
							size={size}
						/>
					),
				}}
			/>
		</Drawer>
	);
};

export default DrawerLayout;
