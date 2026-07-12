use rocket::get;

route_gen!{
    ["/"]

    #[get("/")]
    fn index() -> &'static str {
        "hello world"
    }
}
