import { check, sleep } from "k6";
import http from "k6/http";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
	stages: [
		{ duration: "10s", target: 50 },
		{ duration: "20s", target: 50 },
		{ duration: "10s", target: 0 },
	],
	thresholds: {
		http_req_duration: ["p(95)<200"],
	},
};

export default function () {
	const createRes = http.post(
		`${BASE_URL}/api/shorten`,
		JSON.stringify({ url: "https://example.com" }),
		{ headers: { "Content-Type": "application/json" } },
	);

	check(createRes, {
		"create status 200": (r) => r.status === 200,
	});

	if (createRes.status === 200) {
		const { key } = JSON.parse(createRes.body);

		const peekRes = http.get(`${BASE_URL}/${key}/peek`);
		check(peekRes, {
			"peek status 200": (r) => r.status === 200,
		});

		const redirectRes = http.get(`${BASE_URL}/${key}`, {
			redirects: 0,
		});
		check(redirectRes, {
			"redirect status 302": (r) => r.status === 302,
		});
	}

	sleep(0.1);
}
