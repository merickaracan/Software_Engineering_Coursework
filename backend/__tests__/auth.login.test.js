const request = require("supertest");
const app = require("../app");

const makeEmail = (label = "user") =>
	`login.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

async function registerUser(email, password = "Password123!") {
	return request(app).post("/api/register").send({
		name: "Test User",
		email,
		password,
	});
}

describe("Login tests:", () => {
    
	test("Rejects missing email", async () => {
		const res = await request(app)
			.post("/api/login")
			.send({ password: "Password123!" });

		expect(res.statusCode).toBe(400);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Email and password are required.");
	});

	test("Rejects unknown email", async () => {
		const res = await request(app)
			.post("/api/login")
			.send({ email: makeEmail("unknown"), password: "Password123!" });

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Invalid email or password.");
	});

	test("Rejects wrong password", async () => {
		const email = makeEmail("wrongpw");
		const registerRes = await registerUser(email, "Password123!");

		const res = await request(app)
			.post("/api/login")
			.send({ email, password: "Wrongpass1!" });

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Invalid email or password.");
	});

	test("Logs in user and sets token cookie", async () => {
		const email = makeEmail("valid");
		await registerUser(email, "Password123!");

		const res = await request(app)
			.post("/api/login")
			.send({ email, password: "Password123!" });

		expect(res.statusCode).toBe(200);
		expect(res.body.ok).toBe(true);
		expect(res.body.message).toBe("Login successful.");

		// Check that token is set as HTTP-only cookie
		const setCookieHeader = res.headers["set-cookie"];
		expect(setCookieHeader).toBeDefined();
		expect(setCookieHeader[0]).toContain("token=");
		expect(setCookieHeader[0]).toContain("HttpOnly");
	});

	test("Accesses /me with valid token cookie", async () => {
		const email = makeEmail("me");
		await registerUser(email, "Password123!");

		const loginRes = await request(app)
			.post("/api/login")
			.send({ email, password: "Password123!" });

		// Extract cookie from login response and use it in next request
		const res = await request(app)
			.get("/api/me")
			.set("Cookie", loginRes.headers["set-cookie"][0]);

		expect(res.statusCode).toBe(200);
		expect(res.body.ok).toBe(true);
		expect(res.body.user.email).toBe(email);
	});

	test("Rejects /me without token cookie", async () => {
		const res = await request(app).get("/api/me");

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("No token provided. Please log in.");
	});

	test("Rejects /me with invalid token cookie", async () => {
		const res = await request(app)
			.get("/api/me")
			.set("Cookie", "token=invalid.jwt.token");

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Invalid or expired token.");
	});
});
