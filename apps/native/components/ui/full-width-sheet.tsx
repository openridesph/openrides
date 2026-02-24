import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface FullWidthSheetProps {
	children: ReactNode;
	onClose: () => void;
	title: string;
	visible: boolean;
}

export function FullWidthSheet({
	visible,
	title,
	onClose,
	children,
}: FullWidthSheetProps) {
	return (
		<Modal
			animationType="slide"
			onRequestClose={onClose}
			transparent
			visible={visible}
		>
			<Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
				<Pressable className="w-full rounded-t-3xl bg-white px-5 pt-5 pb-8">
					<View className="mb-4 flex-row items-center justify-between">
						<Text className="font-semibold text-lg text-slate-900">
							{title}
						</Text>
						<Pressable onPress={onClose}>
							<Text className="font-medium text-slate-500 text-sm">Close</Text>
						</Pressable>
					</View>
					{children}
				</Pressable>
			</Pressable>
		</Modal>
	);
}
