use std::{path::PathBuf, env};
use lazy_static::lazy_static;

lazy_static!{
    pub static ref CWD: PathBuf = env::current_dir().unwrap();
    pub static ref PUBLIC: PathBuf = CWD.join("public");

    pub static ref ENV: PathBuf = dotenvy::dotenv().unwrap();

    pub static ref REDIRECT_URI: String = env::var("REDIRECT_URI").unwrap();
    pub static ref CLIENT_SECRET: String = env::var("CLIENT_SECRET").unwrap();
    pub static ref CLIENT_ID: String = env::var("CLIENT_ID").unwrap();
    pub static ref REDIRECT_URI_CALLBACK: String = env::var("REDIRECT_URI_CALLBACK").unwrap();
    pub static ref DEBUG: bool = env::var("DEBUG").unwrap() != "false";
    pub static ref DEV_MODE: bool = env::var("DEV_MODE").unwrap() == "true";
    pub static ref ADMINS: Vec<String> = env::var("ADMINS").unwrap()
        .split(|c| !char::is_ascii_digit(&c))
        .map(|s| s.to_string())
        .filter(|s| !s.is_empty())
        .collect::<Vec<String>>();
}
