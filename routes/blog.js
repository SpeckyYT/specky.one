const { Router } = require('express');
const fs = require("fs");
const path = require("path");

const router = Router();

const blogPath = (filename) => path.join("blog", filename);

const blogs = [
    {
        name: "How many possible games are there in Mancala?",
        filename: "mancala.pug",
        path: "mancala",
    },
]
.filter(blog => fs.existsSync(path.join(process.cwd(), "views", "blog", blog.filename)));

router.get('/', async (req, res) => {
    res.render(blogPath("main.pug"), {
        req,
        res,
        blogs,
    })
})

router.get("/:blog", async (req, res) => {
    const blogName = req.params.blog;

    const blog = blogs.find(b => b.path == blogName);

    res.render(blogPath(blog.filename), {
        req,
        res,
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
