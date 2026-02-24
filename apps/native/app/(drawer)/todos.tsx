import { Ionicons } from "@expo/vector-icons";
import { api } from "@openrides/backend/convex/_generated/api";
import type { Id } from "@openrides/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	Button,
	Checkbox,
	Chip,
	Input,
	Spinner,
	Surface,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { Container } from "@/components/container";

export default function TodosScreen() {
	const [newTodoText, setNewTodoText] = useState("");
	const todos = useQuery(api.todos.getAll);
	const createTodoMutation = useMutation(api.todos.create);
	const toggleTodoMutation = useMutation(api.todos.toggle);
	const deleteTodoMutation = useMutation(api.todos.deleteTodo);

	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const foregroundColor = useThemeColor("foreground");

	const handleAddTodo = async () => {
		const text = newTodoText.trim();
		if (!text) {
			return;
		}
		await createTodoMutation({ text });
		setNewTodoText("");
	};

	const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
		toggleTodoMutation({ id, completed: !currentCompleted });
	};

	const handleDeleteTodo = (id: Id<"todos">) => {
		Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: () => deleteTodoMutation({ id }),
			},
		]);
	};

	const isLoading = !todos;
	const completedCount = todos?.filter((t) => t.completed).length || 0;
	const totalCount = todos?.length || 0;

	return (
		<Container>
			<ScrollView className="flex-1" contentContainerClassName="p-4">
				<View className="mb-4 py-4">
					<View className="flex-row items-center justify-between">
						<Text className="font-semibold text-2xl text-foreground tracking-tight">
							Tasks
						</Text>
						{totalCount > 0 && (
							<Chip color="accent" size="sm" variant="secondary">
								<Chip.Label>
									{completedCount}/{totalCount}
								</Chip.Label>
							</Chip>
						)}
					</View>
				</View>

				<Surface className="mb-4 rounded-lg p-3" variant="secondary">
					<View className="flex-row items-center gap-2">
						<View className="flex-1">
							<TextField>
								<Input
									onChangeText={setNewTodoText}
									onSubmitEditing={handleAddTodo}
									placeholder="Add a new task..."
									returnKeyType="done"
									value={newTodoText}
								/>
							</TextField>
						</View>
						<Button
							isDisabled={!newTodoText.trim()}
							isIconOnly
							onPress={handleAddTodo}
							size="sm"
							variant={newTodoText.trim() ? "primary" : "secondary"}
						>
							<Ionicons
								color={newTodoText.trim() ? foregroundColor : mutedColor}
								name="add"
								size={20}
							/>
						</Button>
					</View>
				</Surface>

				{isLoading && (
					<View className="items-center justify-center py-12">
						<Spinner size="lg" />
						<Text className="mt-3 text-muted text-sm">Loading tasks...</Text>
					</View>
				)}

				{todos && todos.length === 0 && !isLoading && (
					<Surface
						className="items-center justify-center rounded-lg py-10"
						variant="secondary"
					>
						<Ionicons color={mutedColor} name="checkbox-outline" size={40} />
						<Text className="mt-3 font-medium text-foreground">
							No tasks yet
						</Text>
						<Text className="mt-1 text-muted text-xs">
							Add your first task to get started
						</Text>
					</Surface>
				)}

				{todos && todos.length > 0 && (
					<View className="gap-2">
						{todos.map((todo) => (
							<Surface
								className="rounded-lg p-3"
								key={todo._id}
								variant="secondary"
							>
								<View className="flex-row items-center gap-3">
									<Checkbox
										isSelected={todo.completed}
										onSelectedChange={() =>
											handleToggleTodo(todo._id, todo.completed)
										}
									/>
									<View className="flex-1">
										<Text
											className={`text-sm ${todo.completed ? "text-muted line-through" : "text-foreground"}`}
										>
											{todo.text}
										</Text>
									</View>
									<Button
										isIconOnly
										onPress={() => handleDeleteTodo(todo._id)}
										size="sm"
										variant="ghost"
									>
										<Ionicons
											color={dangerColor}
											name="trash-outline"
											size={16}
										/>
									</Button>
								</View>
							</Surface>
						))}
					</View>
				)}
			</ScrollView>
		</Container>
	);
}
