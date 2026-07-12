use dotenvy::dotenv;
use rocket::launch;

mod app_state;
mod catchers;
mod config;
mod routes;
mod util;

#[launch]
fn rocket() -> _ {
    let _ = dotenv();
    let _ = app_state::config();

    let mut router = rocket::build();

    for (base, routes) in routes::collect() {
        router = router.mount(&base, routes);
    }
    router = router.register("/", catchers::build());

    router
}
