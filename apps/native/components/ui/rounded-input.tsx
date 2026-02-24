import { Text, TextInput, View } from "react-native";

interface RoundedInputProps {
	keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
	label: string;
	onChangeText: (value: string) => void;
	placeholder: string;
	secureTextEntry?: boolean;
	value: string;
}

export function RoundedInput({
	label,
	value,
	onChangeText,
	placeholder,
	secureTextEntry = false,
	keyboardType = "default",
}: RoundedInputProps) {
	return (
		<View className="w-full gap-2">
			<Text className="font-medium text-slate-700 text-sm">{label}</Text>
			<TextInput
				className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-slate-900"
				keyboardType={keyboardType}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor="#64748b"
				secureTextEntry={secureTextEntry}
				value={value}
			/>
		</View>
	);
}
