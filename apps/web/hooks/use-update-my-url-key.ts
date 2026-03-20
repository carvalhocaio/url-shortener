import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type UpdateMyUrlKeyPayload, updateMyUrlKey } from "@/lib/api";

export function useUpdateMyUrlKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateMyUrlKeyPayload) => updateMyUrlKey(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-urls"] });
			await queryClient.refetchQueries({ queryKey: ["my-urls"], type: "active" });
		},
	});
}
