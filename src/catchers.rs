use rocket::Request;
// use rocket::http::Status;

#[catch(500)]
fn internal_error() -> &'static str {
    "Whoops! Looks like we messed up."
}

#[catch(404)]
fn not_found(req: &Request) -> String {
    format!("Couldn't find '{}'. Try something else?", req.uri())
}

// #[catch(default)]
// fn default(status: Status, req: &Request) -> String {
//     format!("{} ({})", status, req.uri())
// }

pub fn build() -> Vec<rocket::Catcher> {
    catchers![internal_error, not_found]
}
