import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type DeleteMyUrlPayload, deleteMyUrl } from "@/lib/api";

export function useDeleteMyUrl() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: DeleteMyUrlPayload) => deleteMyUrl(payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["my-urls"] });
		},
	});
}
