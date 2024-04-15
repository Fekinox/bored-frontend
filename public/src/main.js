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

    const a = document.createElement("a")
    el.appendChild(a)
    a.href = "#"

    a.addEventListener("click", (event) => {
        changeView("post", {
            post: post
        })
        return false
    })

    const img = document.createElement("img")
    img.src = post.file.url
    a.appendChild(img)
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

// POST VIEW

const postView = {
    root: document.getElementById('post-full-view'),
    tags: document.querySelector('#post-full-view .tags'),
    main: document.querySelector('#post-full-view .post-main'),
    image: document.querySelector('#post-full-view .post-image'),
    title: document.querySelector('#post-full-view .title'),
    description: document.querySelector('#post-full-view .description'),

    createTags(tags) {
        tags.textContent = ""
        let groups = {}
        for (const tag of tags) {
            if (groups[tag.namespace]) {
                groups[tag.namespace].push(tag.name)
            } else {
                groups[tag.namespace] = [tag.name]
            }
        }

        for (const ns in groups) {
            const group = document.createElement("div")
            group.classList.add("tag-group")

            const title = document.createElement("h4")
            title.textContent = ns
            group.appendChild(title)

            const tagList = document.createElement("ul")
            tagList.classList.add(ns)
            group.appendChild(tags)
            for (const t of groups[ns]) {
                const listItem = document.createElement("li")
                const link = document.createElement("a")
                link.textContent = t
                link.href = "#"
                link.addEventListener("click", (event) => {
                    changeView(gallery, { tags: `${ns}:${t}` })
                    return false
                })
                tagList.appendChild(listItem)
                listItem.appendChild(link)
            }
        }
    },

    async onEnter({
        post = {},
    } = {}) {
        console.log(post)
        this.image.src = post.file.url
        this.title.textContent = post.title
        this.description.textContent = post.description
        this.createTags(post.tags)
    },
}

const loginView = {
    root: document.getElementById('login-view'),
    form: document.getElementById('login-form'),
    username: document.querySelector('#login-form .username'),
    password: document.querySelector('#login-form .password'),
    async onEnter() {
    }
}

const signupView = {
    root: document.getElementById('signup-view'),
    form: document.getElementById('signup-form'),
    username: document.querySelector('#signup-form .username'),
    password: document.querySelector('#signup-form .password'),
    async onEnter() {
    }
}

const uploadView = {
    root: document.getElementById('upload-view'),
    form: document.getElementById('upload-form'),
    file: document.querySelector('#upload-form .file'),
    title: document.querySelector('#upload-form .title'),
    description: document.querySelector('#upload-form .description'),
    tags: document.querySelector('#upload-form .tags'),
    async onEnter() {
    }
}

const artistPageView = {
    root: document.getElementById('artist-page-view'),
    async onEnter({
        artist = {},
    }) {
    },
}

const views = {
    "gallery": galleryView,
    "post": postView,
    "login": loginView,
    "signup": signupView,
    "upload": uploadView,
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

document.getElementById("home-button").addEventListener("click", (event) => {
    changeView("gallery", {})
})

document.getElementById("login-button").addEventListener("click", (event) => {
    changeView("login", {})
})

document.getElementById("signup-button").addEventListener("click", (event) => {
    changeView("signup", {})
})

document.getElementById("upload-button").addEventListener("click", (event) => {
    changeView("upload", {})
})

const loginStatus = document.getElementById("login-status")

async function updateLoginStatus() {
    const resp = await fetch(`${API_URL}/api/auth/login-status`)
    const json = await resp.json()
    if (!json.loggedIn) {
        loginStatus.textContent = "not logged in"
    } else {
        loginStatus.textContent = `logged in as ${json.user}`
    }
}

updateLoginStatus()

changeView("gallery", {})
