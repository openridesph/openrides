import { api } from "@openrides/backend/convex/_generated/api";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvexAuth,
	useMutation,
	useQuery,
} from "convex/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin")({
	component: AdminRoute,
});

function AdminRoute() {
	const { isAuthenticated } = useConvexAuth();
	const profileData = useQuery(
		api.openrides.getMyProfile,
		isAuthenticated ? {} : "skip"
	);
	const isAdmin = profileData?.profile?.isAdmin === true;
	const dashboard = useQuery(api.admin.getDashboard, isAdmin ? {} : "skip");
	const pending = useQuery(
		api.admin.listPendingVerifications,
		isAdmin ? {} : "skip"
	);
	const disputes = useQuery(api.admin.listDisputes, isAdmin ? {} : "skip");
	const reviewRiderVerification = useMutation(
		api.admin.reviewRiderVerification
	);
	const resolveDispute = useMutation(api.admin.resolveDispute);
	const moderateUser = useMutation(api.admin.moderateUser);
	const [note, setNote] = useState("");

	return (
		<>
			<Authenticated>
				{profileData?.profile?.isAdmin ? null : <Navigate to="/dashboard" />}
				<div className="mx-auto grid w-full max-w-4xl gap-4 px-4 py-8">
					<h1 className="font-bold text-2xl">System Admin</h1>
					<div className="rounded-md border p-4 text-sm">
						<p>
							Pending verifications: {dashboard?.pendingVerificationCount ?? 0}
						</p>
						<p>Open disputes: {dashboard?.openDisputeCount ?? 0}</p>
						<p>Active trips: {dashboard?.activeTripCount ?? 0}</p>
					</div>
					<Input
						onChange={(e) => setNote(e.target.value)}
						placeholder="Admin note"
						value={note}
					/>
					<div className="grid gap-2">
						{pending?.map((row) => (
							<div className="rounded-md border p-3" key={row._id}>
								<p className="text-sm">Rider profile: {row._id}</p>
								<div className="mt-2 flex gap-2">
									<Button
										onClick={() =>
											reviewRiderVerification({
												decision: "approve",
												riderProfileRef: row._id,
												reason: note || undefined,
											})
										}
									>
										Approve
									</Button>
									<Button
										onClick={() =>
											reviewRiderVerification({
												decision: "reject",
												riderProfileRef: row._id,
												reason: note || "Rejected",
											})
										}
										variant="destructive"
									>
										Reject
									</Button>
								</div>
							</div>
						))}
					</div>
					<div className="grid gap-2">
						{disputes?.map((dispute) => (
							<div className="rounded-md border p-3" key={dispute._id}>
								<p className="text-sm">{dispute.reason}</p>
								<div className="mt-2 flex gap-2">
									<Button
										onClick={() =>
											resolveDispute({
												disputeRef: dispute._id,
												resolution: note || "Resolved",
											})
										}
									>
										Resolve
									</Button>
									{dispute.openedByRef ? (
										<Button
											onClick={() =>
												moderateUser({
													targetUserRef: dispute.openedByRef,
													action: "suspend",
													note,
												})
											}
											variant="destructive"
										>
											Suspend User
										</Button>
									) : null}
								</div>
							</div>
						))}
					</div>
				</div>
			</Authenticated>
			<Unauthenticated>
				<div className="p-8">Please sign in.</div>
			</Unauthenticated>
			<AuthLoading>
				<div className="p-8">Loading...</div>
			</AuthLoading>
		</>
	);
}
