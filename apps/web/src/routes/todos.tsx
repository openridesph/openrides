import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/todos")({
	component: LegacyTodosRoute,
});

function LegacyTodosRoute() {
	return (
		<div className="mx-auto max-w-2xl px-4 py-10">
			<h1 className="font-bold text-2xl">Legacy Todos Removed</h1>
			<p className="mt-2 text-sm">
				This project now uses OpenRides role-based flows. Use Dashboard,
				Passenger, Rider, and Admin routes.
			</p>
		</div>
	);
}
