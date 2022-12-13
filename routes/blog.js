const { Router } = require('express');
const fs = require("fs");
const path = require("path");

const router = Router();

const blogPath = (filename) => path.join("blog", filename);

const blogs = [
    // Required: title, filename, path
    // Optional: date, writers, tags
    {
        title: "How many possible games are there in Mancala?",
        filename: "mancala.pug",
        path: "mancala",
        date: new Date(Date.parse("December 10, 2022")),
        writers: [
            'Specky',
        ],
        tags: ["mancala", "games", "computation", "math"],
    },
]
.filter(blog => fs.existsSync(path.join(process.cwd(), "views", "blog", blog.filename)));

const tags = [];
for(const blog of blogs) {
    if(Array.isArray(blog.tags)) {
        for(const tag of blog.tags) {
            if(!tags.includes(tag)) {
                tags.push(tag);
            }
        }
    }
}

router.get('/', async (req, res) => {
    res.render(blogPath("main.pug"), {
        req,
        res,
        blogs,
        tags,
    })
})

router.get("/:blog", async (req, res, next) => {
    const blogName = req.params.blog;

    const blog = blogs.find(b => b.path == blogName);

    if(!blog) return next();

    res.render(blogPath(blog.filename), {
        req,
        res,
        blog,
    });
})

router.get("*", async (req, res) => {
    res.render("404.pug", {
        req,
        res,
    })
})

module.exports = {
    route: "/blog",
    router: router,
}
