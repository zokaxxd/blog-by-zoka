document.getElementById("login-btn").addEventListener("click", function(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        },
        body: `username=${email}&password=${password}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.access_token){
            localStorage.setItem("token", data.access_token);
            
            fetch("http://127.0.0.1:8000/profile", {
                headers: {
                    "Authorization": "Bearer " + data.access_token
                }
            })
            .then(res => res.json())
            .then(pef => {
                localStorage.setItem("user-name", pef.name);
                localStorage.setItem("user-id", pef.id);
                window.location.href = "../index.html";
            })
        } else {
            alert("Error: " + data.error);
        }
    })
})