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
                    <div class="avatar" id="post-avatar">${post.author_name[0].toUpperCase()}</div>
                    <div class="infos">
                        <div id="comments-${post.id}"></div>
                        <p class="title">${post.title}</p>
                        <p class="author">${post.author_name}</p>
                    </div>
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
                <div class="post-actions">
                <button onclick="likePost(${post.id})">❤</button>
                <button onclick="deletePost(${post.id})">🗑</button>
                <button onclick="unlikePost(${post.id})">💜</button>
                <button onclick="commentPost(${post.id})">💬</button>
                <button onclick="getComments(${post.id})">🍆</button>
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


function deletePost(id){
    const userId = localStorage.getItem("user-id");

    fetch("http://127.0.0.1:8000/posts/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
.then(res => res.json())
.then(data => {
    if (data.msg === "post deletado"){
        alert("Post deleted!");
        getPosts();
    } else {
        alert("Error: " + data.detail);
    }
})
}




function likePost(id){
    const userId = localStorage.getItem("user-id");

    fetch("http://127.0.0.1:8000/posts/" + id + "/likes", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
.then(res => res.json())
.then(data => {
    if (data.msg === "post curtido"){
        alert("Post liked!");
        getPosts();
    } else {
        alert("Error: " + data.detail);
    }
})
}

function unlikePost(id){
    const userId = localStorage.getItem("user-id");

    fetch("http://127.0.0.1:8000/posts/" + id + "/likes", {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
.then(res => res.json())
.then(data => {
    if (data.msg === "post não mais curtido"){
        alert("Post unliked!");
        getPosts();
    } else {
        alert("Error: " + data.detail);
    }
})}

function unLikePost(id){
    const userId = localStorage.getItem("user-id");
    fetch("http://127.0.0.1:8000/posts/" + id + "/likes", {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
.then(res => res.json())
.then(data => {
    if (data.msg === "post não mais curtido"){
        alert("Post unliked!");
        getPosts();
    } else {
        alert("Error: " + data.detail);
    }
})} 

function commentPost(id){
    const userId = localStorage.getItem("user-id");
    const comentario = prompt("Comentar...");

    fetch("http://127.0.0.1:8000/posts/" + id + "/comments", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content: comentario
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.msg === "comentário enviado"){
            alert("Comment created!");
            document.getElementById("post-input").value = "";
            getPosts();
        } else {
            alert("Error: " + data.detail);
        }
    })
}

function getComments(id){
    fetch("http://127.0.0.1:8000/posts/" + id + "/comments", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("comments-" + id);
        list.innerHTML = "";

        data.comments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment");
            commentElement.innerHTML = `
                <div class="comment-header">
                    <div class="avatar" id="comment-avatar">${comment.author_name[0].toUpperCase()}</div>
                    <div class="infos">
                        <p class="author">${comment.author_name}</p>
                    </div>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                <div class="comment-actions">
                <button onclick="deleteComment(${comment.id}, ${id})">🗑</button>
                </div>
            `;
            list.appendChild(commentElement);
        })
    })
}

function deleteComment(commentId, postId){
    const userId = localStorage.getItem("user-id");

    fetch("http://127.0.0.1:8000/comments/" + commentId ,{
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
.then(res => res.json())
.then(data => {
    if (data.msg === "comentário deletado"){
        alert("Comment deleted!");
        getComments(postId);
    } else {
        alert("Error: " + data.detail);
    }
})
}