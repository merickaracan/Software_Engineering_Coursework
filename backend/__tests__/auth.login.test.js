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

async function confirmUser(verifyLink) {
	const token = (verifyLink || "").split("token=")[1];
	return request(app).get(`/api/confirm?token=${token}`);
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

	test("Rejects unverified user", async () => {
		const email = makeEmail("unverified");
		await registerUser(email);

		const res = await request(app)
			.post("/api/login")
			.send({ email, password: "Password123!" });

		expect(res.statusCode).toBe(403);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Email not verified. Please check your inbox.");
	});

	test("Rejects wrong password", async () => {
		const email = makeEmail("wrongpw");
		const registerRes = await registerUser(email, "Password123!");
		await confirmUser(registerRes.body.verifyLink);

		const res = await request(app)
			.post("/api/login")
			.send({ email, password: "Wrongpass1!" });

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Invalid email or password.");
	});

	test("Logs in verified user and returns token", async () => {
		const email = makeEmail("valid");
		const registerRes = await registerUser(email, "Password123!");
		await confirmUser(registerRes.body.verifyLink);

		const res = await request(app)
			.post("/api/login")
			.send({ email, password: "Password123!" });

		expect(res.statusCode).toBe(200);
		expect(res.body.ok).toBe(true);
		expect(res.body.message).toBe("Login successful.");
		expect(typeof res.body.token).toBe("string");
		expect(res.body.token.length).toBeGreaterThan(10);
	});

	test("Accesses /me with valid token", async () => {
		const email = makeEmail("me");
		const registerRes = await registerUser(email, "Password123!");
		await confirmUser(registerRes.body.verifyLink);

		const loginRes = await request(app)
			.post("/api/login")
			.send({ email, password: "Password123!" });

		const res = await request(app)
			.get("/api/me")
			.set("Authorization", `Bearer ${loginRes.body.token}`);

		expect(res.statusCode).toBe(200);
		expect(res.body.ok).toBe(true);
		expect(res.body.user.email).toBe(email);
	});

	test("Rejects /me without authorization header", async () => {
		const res = await request(app).get("/api/me");

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Authorization header missing.");
	});

	test("Rejects /me with invalid auth format", async () => {
		const res = await request(app)
			.get("/api/me")
			.set("Authorization", "Token abc123");

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.message).toBe("Invalid authorization format.");
	});

	test("Rejects /me with invalid token", async () => {
		const res = await request(app)
			.get("/api/me")
			.set("Authorization", "Bearer invalid.token.value");

		expect(res.statusCode).toBe(401);
		expect(res.body.ok).toBe(false);
		expect(res.body.error).toBe("Invalid or expired token");
	});
});
