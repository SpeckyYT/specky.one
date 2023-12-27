use std::{path::PathBuf, env};
use lazy_static::lazy_static;

lazy_static!{
    pub static ref CWD: PathBuf = env::current_dir().unwrap();
    pub static ref PUBLIC: PathBuf = CWD.join("public");
}
