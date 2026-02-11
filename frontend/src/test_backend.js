// Get

async function test_register(){
    const request = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: "Test",
            email: "test@bath.ac.uk",
            password: "Password123!",
        })
    })

    const json_data = await request.json();
    console.log(json_data);

    const verifyLink = json_data.body.verifyLink;
    request = await fetch(verifyLink);
    console.log(await request.json());  
}

async function test_jwttoken(){
    const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@bath.ac.uk", password: "Password123!" })
    });

    const loginData = await loginRes.json();
    console.log(loginData);

    const token = loginData.token;

    const meRes = await fetch("/api/me", {
    headers: {
        Authorization: `Bearer ${token}`
    }
    });

    console.log(await meRes.json());
}

export default [test_register, test_jwttoken];