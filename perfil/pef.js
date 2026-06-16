const token = localStorage.getItem("token")

if (!token){
    window.location.href = "/login/log.html";
}


fetch("http://127.0.0.1:8000/profile", {
    headers: {
        "Authorization": "Bearer " + token
    }
})
.then(res => res.json())
.then(data => {
    document.getElementById("nome").innerHTML = data.name;
    document.getElementById("idade").innerHTML = data.age;
    document.getElementById("email").innerHTML = data.email;
    document.getElementById("id").innerHTML = data.id;
})