use std::env;

macro_rules! app_config {
    (
        $(#[$meta:meta])* 
        $vis:vis struct $name:ident {
            $(
                $(#[$field_meta:meta])*
                $field_vis:vis $field:ident : $ty:ty = $env:literal => $fallback:expr, $mapper:expr;
            )*
        }
    ) => {
        #[derive(Debug, Clone, Default)]
        $vis struct $name {
            $(
                $(#[$field_meta])*
                $field_vis $field: $ty,
            )*
        }

        impl $name {
            pub fn load() -> Self {
                Self {
                    $(
                        $field: env::var($env)
                            .ok()
                            .map($mapper)
                            .unwrap_or($fallback),
                    )*
                }
            }
        }
    };
}

app_config! {
    pub struct AppConfig {
        pub debug: bool = "DEBUG" => false, |value: String| value.eq_ignore_ascii_case("true");
        pub dev_mode: bool = "DEV_MODE" => false, |value: String| value.eq_ignore_ascii_case("true");
        pub redirect_uri: Option<String> = "REDIRECT_URI" => None, Some;
        pub redirect_uri_callback: Option<String> = "REDIRECT_URI_CALLBACK" => None, Some;
        pub client_id: Option<String> = "CLIENT_ID" => None, Some;
        pub client_secret: Option<String> = "CLIENT_SECRET" => None, Some;
        pub admins: Vec<String> = "ADMINS" => Vec::new(), |value: String| Self::parse_admins(&value);
        pub tmdb_key: String = "TMDB_KEY" => String::new(), |value: String| value;
    }
}

impl AppConfig {
    fn parse_admins(raw: &str) -> Vec<String> {
        raw.split(',')
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(ToOwned::to_owned)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::AppConfig;

    #[test]
    fn defaults_to_safe_values_when_environment_is_empty() {
        let config = AppConfig::default();

        assert!(!config.debug);
        assert!(!config.dev_mode);
        assert!(config.admins.is_empty());
        assert!(config.tmdb_key.is_empty());
    }

    #[test]
    fn parses_admins_from_csv() {
        let admins = AppConfig::parse_admins("alice, bob,carol");

        assert_eq!(admins, vec!["alice", "bob", "carol"]);
    }
}
