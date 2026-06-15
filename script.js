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


