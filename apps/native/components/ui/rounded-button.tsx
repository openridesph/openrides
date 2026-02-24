import type { ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";

interface RoundedButtonProps {
	disabled?: boolean;
	icon?: ReactNode;
	label: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "danger";
}

export function RoundedButton({
	label,
	onPress,
	variant = "primary",
	disabled = false,
	icon,
}: RoundedButtonProps) {
	const variantClass =
		variant === "secondary"
			? "bg-slate-200"
			: variant === "danger"
				? "bg-red-500"
				: "bg-blue-600";
	const textClass = variant === "secondary" ? "text-slate-900" : "text-white";
	return (
		<TouchableOpacity
			className={`w-full flex-row items-center justify-center gap-2 rounded-full px-5 py-3 ${variantClass} ${
				disabled ? "opacity-50" : ""
			}`}
			disabled={disabled}
			onPress={onPress}
		>
			{icon}
			<Text className={`font-semibold ${textClass}`}>{label}</Text>
		</TouchableOpacity>
	);
}
