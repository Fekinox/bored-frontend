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
        this.postContainer.textContent = ""
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
    changeView("gallery", { tags: searchInput.value })
})

// POST VIEW

const postView = {
    root: document.getElementById('post-full-view'),
    tags: document.querySelector('#post-full-view .tags'),
    main: document.querySelector('#post-full-view .post-main'),
    image: document.querySelector('#post-full-view .post-image'),
    title: document.querySelector('#post-full-view .title'),
    description: document.querySelector('#post-full-view .description'),

    addTagForm: document.querySelector('#post-full-view .add-tag'),
    addTagInput: document.querySelector('.add-tag .tag'),
    removeTagForm: document.querySelector('#post-full-view .remove-tag'),
    removeTagInput: document.querySelector('.remove-tag .tag'),
    deletePost: document.querySelector('#post-full-view .delete-button'),

    createTags(tags) {
        this.tags.textContent = ""
        let groups = {}
        for (const tag of tags) {
            if (groups[tag.namespace]) {
                groups[tag.namespace].push(tag.name)
            } else {
                groups[tag.namespace] = [tag.name]
            }
        }

        // Sort the tag groups in the order of 
        // artist > character > copyright > metadata > others > none.
        let nsNames = []
        for (const ns in groups) {
            nsNames.push(ns)
        }

        function precedence(ns) {
            switch (ns) {
            case "artist": return 0
            case "character": return 1
            case "copyright": return 2
            case "metadata": return 3
            case "none": return 5
            default: return 4
            }
        }

        nsNames.sort((a, b) => precedence(a) - precedence(b))

        for (const ns of nsNames) {
            const group = document.createElement("div")
            group.classList.add("tag-group")
            this.tags.appendChild(group)

            const title = document.createElement("h4")
            title.textContent = ns
            group.appendChild(title)

            const tagList = document.createElement("ul")
            tagList.classList.add(ns)
            group.appendChild(tagList)
            for (const t of groups[ns]) {
                const listItem = document.createElement("li")
                const link = document.createElement("a")
                link.textContent = t
                link.href = "#"
                link.addEventListener("click", (event) => {
                    changeView("gallery", { tags: `${ns}:${t}` })
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

        this.addTagForm.onsubmit = async (event) => {
            const resp = await fetch(`${API_URL}/api/posts/${post.postId}/tags`, {
                method: 'PUT',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: [ this.addTagInput.value ],
            })

            resp = await fetch(`${API_URL}/api/posts/${post.postId}`)
            const json = await resp.json()
            changeView("post", json)
        }

        this.removeTagForm.onsubmit = async (event) => {
            let resp = await fetch(`${API_URL}/api/posts/${post.postId}/tags`, {
                method: 'DELETE',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: [ this.addTagInput.value ],
            })

            resp = await fetch(`${API_URL}/api/posts/${post.postId}`)
            const json = await resp.json()
            changeView("post", json)
        }

        this.deletePost.onclick = async (event) => {
            const resp = await fetch(`${API_URL}/api/posts/${post.postId}`, {
                method: 'DELETE',
                credentials: "include",
            })

            changeView("gallery", {})
        }
    },
}

// LOGIN VIEW

const loginView = {
    root: document.getElementById('login-view'),
    form: document.getElementById('login-form'),
    username: document.querySelector('#login-form .username'),
    password: document.querySelector('#login-form .password'),
    async login() {
        const resp = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: this.username.value,
                password: this.password.value,
            })
        })

        await updateLoginStatus()
        changeView("gallery", {})
    },
    async onEnter() {
    }
}

loginView.form.addEventListener("submit", async (event) => {
    event.preventDefault()
    await loginView.login()
})

const signupView = {
    root: document.getElementById('signup-view'),
    form: document.getElementById('signup-form'),
    username: document.querySelector('#signup-form .username'),
    password: document.querySelector('#signup-form .password'),
    async signup() {
        let resp = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: this.username.value,
                password: this.password.value,
            })
        })

        if (!resp?.ok) {
            await updateLoginStatus()
            changeView("gallery", {})
            return
        }

        resp = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: this.username.value,
                password: this.password.value,
            })
        })

        await updateLoginStatus()
        changeView("gallery", {})
    },
    async onEnter() {
    }
}

signupView.form.addEventListener("submit", async (event) => {
    event.preventDefault()
    await signupView.signup()
})


const uploadView = {
    root: document.getElementById('upload-view'),
    form: document.getElementById('upload-form'),
    file: document.querySelector('#upload-form .file'),
    title: document.querySelector('#upload-form .title'),
    description: document.querySelector('#upload-form .description'),
    tags: document.querySelector('#upload-form .tags'),
    async upload() {
        let formData = new FormData()
        formData.append('image', this.file.files[0])
        formData.append('title', this.title.value)
        formData.append('description', this.description.value)
        formData.append('tags', this.tags.value)

        const resp = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            credentials: "include",
            body: formData,
        })
        changeView("gallery", {})
    },
    async onEnter() {
    }
}

uploadView.form.addEventListener("submit", async (event) => {
    event.preventDefault()
    await uploadView.upload()
})

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

document.getElementById("logout-button").addEventListener("click", async (event) => {
    const resp = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        cache: "no-cache",
        credentials: "include",
    })
    await updateLoginStatus()
    changeView("gallery", {})
})

const loginStatus = document.getElementById("login-status")

async function updateLoginStatus() {
    const resp = await fetch(`${API_URL}/api/auth/login-status`, {
        cache: "no-cache",
        credentials: "include",
    })
    const json = await resp.json()
    if (!json.loggedIn) {
        loginStatus.textContent = "not logged in"
    } else {
        loginStatus.textContent = `logged in as ${json.user}`
    }
}

updateLoginStatus()

changeView("gallery", {})
