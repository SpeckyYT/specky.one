use rocket::{catch, catchers, Request};

#[catch(500)]
pub fn internal_error() -> &'static str {
    "Whoops! Looks like we messed up."
}

#[catch(404)]
pub fn not_found(req: &Request<'_>) -> String {
    format!("Couldn't find '{}'. Try something else?", req.uri())
}

pub fn build() -> Vec<rocket::Catcher> {
    catchers![internal_error, not_found]
}
