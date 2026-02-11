// Get

async function test_get_request(){
    const request = await fetch("/api/register");
    const json_data = await request.json();
    console.log(json_data);
}

async function test_register(){
    const request = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: "test@example.com",
            password: "12345678"
        })
    })

    const json_data = await request.json();
    console.log(json_data);
}

export default [test_get_request, test_register];