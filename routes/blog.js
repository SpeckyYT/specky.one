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
        tags: ["mancala", "game", "computation", "math"],
        embed: {
            title: "How many unique games of Mancala are there?",
            description: "In this blog, we'll explore how many distinct games of Mancala there are.",
            url: "mancala", // url is defaulted to blog.path
            // if you need a specific url, just input "hello" and it will result to "/blog/hello"
            image: "https://acrosstheboardgame.com/wp-content/uploads/2018/07/Mancala-at-play-angled.jpg",
            color: "#C19A6B",
        },
    },
]
.filter(blog => fs.existsSync(path.join(process.cwd(), "views", "blog", blog.filename)))
.map(blog => {
    blog.embed ??= {}

    blog.embed.title ??= blog.title
    blog.embed.description ??= 'Here\'s a new ""discovery"" Specky made'
    blog.embed.url = `https://specky.one/blog/${blog.embed.url || blog.path}`
    blog.embed.image ??= "https://upload.wikimedia.org/wikipedia/commons/4/42/Blog_%281%29.jpg"
    blog.embed.color ??= "#2A10BA"

    return blog
});

let tags = new Set();
for(const blog of blogs) {
    if(Array.isArray(blog.tags)) {
        for(const tag of blog.tags) {
            tags.add(tag);
        }
    }
}
tags = Array(...tags);

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

module.exports = {
    route: "/blog",
    router: router,
}
