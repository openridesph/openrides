import { Text, View } from "react-native";

import { Container } from "@/components/container";

export default function LegacyTodosScreen() {
	return (
		<Container>
			<View className="flex-1 items-center justify-center px-4">
				<Text className="font-semibold text-foreground text-xl">
					Legacy Todos Removed
				</Text>
				<Text className="mt-2 text-center text-muted text-sm">
					This app now uses OpenRides role flows.
				</Text>
			</View>
		</Container>
	);
}
