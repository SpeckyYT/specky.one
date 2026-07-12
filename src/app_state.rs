use std::sync::OnceLock;

use crate::config::AppConfig;

static APP_CONFIG: OnceLock<AppConfig> = OnceLock::new();

pub fn config() -> &'static AppConfig {
    APP_CONFIG.get_or_init(AppConfig::load)
}
