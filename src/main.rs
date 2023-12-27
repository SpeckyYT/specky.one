#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

mod routes;
mod catchers;
mod util;

fn main() {
    let mut router = rocket::ignite().register(catchers::build());
    
    for (base, routes) in routes::collect() {
        router = router.mount(&base, routes);
    }

    router.launch();
}
