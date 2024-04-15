const API_URL = 'https://bored-fekinox-0a1792ab3282.herokuapp.com'

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

// GALLERY

const galleryView = {
    root: document.getElementById('gallery-view'),
    postContainer: document.getElementById('post-container'),
    // tags - tags to query the API by
    // page - page to start searching from
    async onEnter({
        tags = "",
        page = 1,
    } = {}) {
        const posts = await getPosts(tags, page)
        for (const p of posts) {
            createPostThumbnail(p, this.postContainer)
        }
    }
}

const searchForm = document.getElementById("search")
const searchInput = document.getElementById("tag-search")
searchForm.addEventListener("submit", (event) => {
    event.preventDefault()
})

const postView = {
    root: document.getElementById('post-full-view')
}

const loginView = {
    root: document.getElementById('login-view'),
    form: document.getElementById('login-form'),
    username: document.querySelector('#login-form .username'),
    password: document.querySelector('#login-form .password'),
}

const signupView = {
    root: document.getElementById('signup-view'),
    form: document.getElementById('signup-form'),
    username: document.querySelector('#signup-form .username'),
    password: document.querySelector('#signup-form .password'),
}

const artistPageView = {
    root: document.getElementById('artist-page-view')
}

const views = {
    "gallery": galleryView,
    "post": postView,
    "login": loginView,
    "signup": signupView,
    "artistPage": artistPageView,
}

async function changeView(view, options) {
    // Hide all other views
    for (const v in views) {
        views[v].root.classList.add('hidden')
    }
    views[view].root.classList.remove('hidden')
    views[view].onEnter(options)
}

getPosts("", 1).then((p) => console.log(p))

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

// updatePostView("", 1)

changeView("gallery", {})
