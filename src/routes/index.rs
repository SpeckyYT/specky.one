use crate::route_gen;

route_gen!{
    ["/"]

    #[get("/")]
    fn index() -> &'static str {
        "hello world"
    }
}
