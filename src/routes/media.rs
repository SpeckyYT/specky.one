use std::{path::PathBuf, fs};

use rocket::http::Cookies;
use lazy_static::lazy_static;

use crate::{util::PUBLIC, route_gen};

lazy_static!{
    static ref MEDIA: PathBuf = PUBLIC.join("media");
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct File {
    filename: String,
    size: u128,
}

route_gen!{
    ["/media"]

    #[get("/")]
    fn index() {
        // render pug
    }

    #[get("/<id>/<file..>")]
    fn get_file(id: u64, file: PathBuf) -> Option<Vec<u8>> {
        let file_path = MEDIA.join(id.to_string()).join(file);

        fs::read(file_path).map_err(|a| a.to_string()).ok()
    }

    #[get("/files")]
    fn get_files(cookies: Cookies) -> String {
        // cookies.iter().map(|cookie| format!("{}: {}", cookie.name(), cookie.value())).collect::<Vec<String>>().join("\n")
        String::new()
    }

    #[post("/files")]
    fn post_file(cookies: Cookies) {

    }

    #[delete("/files")]
    fn delete_file(cookies: Cookies) {

    }
}
