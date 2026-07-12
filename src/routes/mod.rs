#[macro_export]
macro_rules! route_gen {
    {
        [$route:literal]
        $(
            $(#[$meta:meta])*
            fn $fn_name:ident $params:tt $(-> $return:ty)? $code_block:block
        )*
    } => {
        $(
            $(#[$meta])*
            async fn $fn_name $params $(-> $return)? $code_block
        )*

        pub fn build() -> Vec<(String, Vec<rocket::Route>)> {
            use rocket::routes;
            vec![(String::from($route), routes![$($fn_name,)*])]
        }
    };
}

macro_rules! route_collector {
    [$($module:ident $(,)?)*] => {
        $(mod $module;)*
        pub fn collect() -> Vec<(String, Vec<rocket::Route>)> {
            #[allow(unused_mut)]
            let mut output = Vec::with_capacity([$(stringify!($module), )*].len() * 10);
            $(
                output.append(&mut $module::build());
            )*
            output
        }
    };
}

route_collector![
    index,
    auth_discord,
    media,
];
