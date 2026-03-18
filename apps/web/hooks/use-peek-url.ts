import { peekUrl } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function usePeekUrl(key: string | null) {
	return useQuery({
		queryKey: ["peek", key],
		queryFn: () => peekUrl(key!),
		enabled: !!key,
	});
}
