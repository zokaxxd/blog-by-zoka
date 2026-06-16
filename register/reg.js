document.getElementById("register-btn").addEventListener("click", function(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;

    fetch("http://127.0.0.1:8000/users",{
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            age: parseInt(age),
            email: email,
            password: password,
        })
    })

    .then(res => res.json())
    .then(data => {
        if (data.msg === "usuario criado"){
            alert("User created!");
            window.location.href = "/login/log.html";
        } else {
            alert("Error: " + data.detail);
        }
})
})