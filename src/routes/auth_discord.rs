use crate::route_gen;
use crate::util::*;
use reqwest::blocking::Client;
use reqwest::header;
use rocket::http::Cookie;
use rocket::http::Cookies;
use rocket::http::Status;
use rocket::response::Redirect;

const GRANT_TOKEN_URL: &str = "https://discord.com/api/v10/oauth2/token";
const API_USERS: &str = "https://discord.com/api/users/@me";

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AuthorizationResponse {
    access_token: String,
    token_type: String,
    expires_in: u128,
    refresh_token: String,
    scope: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct User {
    id: String,
    name: String,
    discriminator: String,
    global_name: Option<String>,
    avatar: Option<String>,
    // bot: Option<bool>, // why would I ever need to know this
    // other shit
    verified: Option<bool>,
    email: Option<String>,
    // other shit
}

route_gen!{
    ["/auth"]

    #[get("/discord?<code>")]
    fn auth_discord(mut cookies: Cookies<'_>, code: String) -> Status {
        let client = Client::builder().build().unwrap();

        let request = client
        .post(GRANT_TOKEN_URL)
        .header(header::CONTENT_TYPE, "application/x-www-form-urlencoded")
        .header(header::ACCEPT, "application/json")
        .query(&[
            ("grant_type", "authorization_code"),
            ("code", &code),
            ("redirect_uri", &REDIRECT_URI_CALLBACK),
            ("client_id", &CLIENT_ID),
            ("client_secret", &CLIENT_SECRET),
        ])
        .send()
        .unwrap();

        if !request.status().is_success() { return Status::Unauthorized }

        let authorization = request.json::<AuthorizationResponse>().unwrap();

        cookies.add_private(Cookie::new("discord.token", authorization.access_token.clone()));
        cookies.add_private(Cookie::new("discord.type", authorization.token_type.clone()));
        cookies.add_private(Cookie::new("discord.refresh", authorization.refresh_token.clone()));
        cookies.add_private(Cookie::new("discord.expires_in", authorization.expires_in.to_string()));

        discord_refresh(cookies)
    }

    #[get("/discord/refresh")]
    fn discord_refresh(mut cookies: Cookies<'_>) -> Status {
        let client = Client::builder().build().unwrap();

        if let (Some(access_token), Some(token_type)) = (
            cookies.get_private("discord.token"),
            cookies.get_private("discord.type"),
        ) {
            let request = client
            .get(API_USERS)
            .header(
                header::AUTHORIZATION,
                format!(
                    "{} {}",
                    &token_type,
                    &access_token,
                )
            )
            .send()
            .unwrap();

            let user_data = request.json::<User>().unwrap();

            cookies.add_private(Cookie::new("discord.user", serde_json::to_string(&user_data).unwrap()));

            Status::Ok
        } else {
            Status::Unauthorized
        }

        // let refresh_token = cookies.get_private("discord.refresh");
        // let expires_in = cookies.get_private("discord.expires_in");
    }

    #[get("/discord/logout")]
    fn discord_logout(mut cookies: Cookies<'_>) -> Redirect {
        cookies.remove_private(Cookie::named("discord.token"));
        cookies.remove_private(Cookie::named("discord.type"));
        cookies.remove_private(Cookie::named("discord.refresh"));
        cookies.remove_private(Cookie::named("discord.expires_in"));
        cookies.remove_private(Cookie::named("discord.user"));

        Redirect::to("/")
    }
}
