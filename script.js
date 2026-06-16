const token = localStorage.getItem("token");
if (!token){
    window.location.href = "/login/log.html";
}

function getPosts(){
    fetch("http://127.0.0.1:8000/posts", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("posts-list");
        list.innerHTML = "";

        data.posts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="avatar" id="post-avatar">ZK</div>
                    <div class="infos">
                        <p class="title">${post.title}</p>
                        <p class="author">${post.author_id}</p>
                    </div>
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
            `;
            list.appendChild(postElement);
        })
    })
}
getPosts()

function getSuggestions(){
    fetch("http://127.0.0.1:8000/users", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
    console.log(data) 
    const list = document.getElementById("suggestions-list");
        list.innerHTML = "";    
        data.users.forEach(suggestion => {
            const suggestionElement = document.createElement("div");
            suggestionElement.classList.add("suggestion");
            suggestionElement.innerHTML = `
                <div class="suggestion-info">
                    <div class="avatar medium">${suggestion.name[0].toUpperCase()}</div>
                    <span>${suggestion.name}</span>
                </div>
                `;
                list.appendChild(suggestionElement);
        })
    })
}
getSuggestions()

function postPost(){
    const postInput = document.getElementById("post-input").value;
    const userId = localStorage.getItem("user-id");

    fetch("http://127.0.0.1:8000/posts", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: postInput,
            content: postInput
        })
    })
.then(res => res.json())
.then(data => {
    if (data.msg === "post criado"){
        alert("Post created!");
        document.getElementById("post-input").value = "";
        getPosts();
    } else {
        alert("Error: " + data.detail);
    }
    
})
}
document.getElementById("postar").addEventListener("click", function(){
    postPost()
})

