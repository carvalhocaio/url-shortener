import { shortenUrl } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useShortenUrl() {
	return useMutation({
		mutationFn: (url: string) => shortenUrl(url),
	});
}
