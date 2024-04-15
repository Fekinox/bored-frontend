const API_URL = 'https://localhost:7777'

async function getPosts(searchTags, page) {
    params = []
    params.push({ key: 'tags', value: searchTags.replace(/\s+/g, "+") })
    if (page > 1) { params.push({ key: 'page', value: page }) }
    paramString = params.map((p) => `${p.key}=${p.value}`).join("&")
    const resp = await fetch(`${API_URL}/api/posts?${paramString}`)
    const json = await resp.json()
    return json
}

function createPostThumbnail(post, parent) {
    const el = document.createElement("div")
    el.classList.add("post")
    parent.appendChild(el)

    const img = document.createElement("img")
    img.src = post.file.url
    el.appendChild(img)
}

getPosts("", 1).then((p) => console.log(p))

const postView = document.getElementById("post-view")

const searchForm = document.getElementById("search")
const searchInput = document.getElementById("tag-search")
searchForm.addEventListener("submit", (event) => {
    event.preventDefault()
    updatePostView(searchInput.value, 1)
})

async function updatePostView(searchTags, page) {
    postView.textContent = ""

    const posts = await getPosts(searchTags, page)
    for (const p of posts) {
        createPostThumbnail(p, postView)
    }
}

const buttonContainer = document.querySelector('header div.button-hbox')
const loginButton = document.createElement('button')
loginButton.textContent = 'Login'
loginButton.addEventListener('click', async (event) => {
    const resp = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user: "foo",
            password: "foo",
        })
    })

    const json = await resp.json()
    console.log(json)
})

buttonContainer.appendChild(loginButton)

updatePostView("", 1)
