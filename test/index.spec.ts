import { env, createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";

describe("mta-sts-proxy", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	// version: STSv1
	// mode: enforce
	// mx: *.mail.protection.outlook.com
	// max_age: 604800

	it("proxies the Microsoft 365 MTA-STS policy file", async () => {
		const policy = "version: STSv1\nmode: enforce\nmx: *.mail.protection.outlook.com\nmax_age: 604800";
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(policy));

		const request = new Request("https://mta-sts.example.com/.well-known/mta-sts.txt");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(fetchSpy).toHaveBeenCalledWith(
			"https://mta-sts.microsoft.com/.well-known/mta-sts.txt",
		);
		expect(await response.text()).toBe(policy);
	});
});
