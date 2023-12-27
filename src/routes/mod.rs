mod media;

#[macro_export]
macro_rules! route_gen {
    {
        [$route:literal]

        $(
            #[$meta:meta]
            fn $fn_name:ident $params:tt $(-> $return:ty)? $code_block:block
        )*

        $(
            => $recursive:tt
        )*
    } => {
        pub fn build() -> Vec<(String, Vec<rocket::Route>)> {
            $(
                #[$meta]
                fn $fn_name $params $(-> $return)? $code_block
            )*

            let mut current_routes = vec![];
            current_routes.push(( String::from($route), routes![ $($fn_name,)* ] ));

            $(
                {
                    route_gen! $recursive;
                    let mut routers = build().iter().map(|(base, routes)| ($route.to_string() + base, routes.clone())).collect::<Vec<_>>();
                    current_routes.append(&mut routers);
                }
            )*

            current_routes
        }
    };
}

macro_rules! route_collector {
    [$($module:ident $(,)?)*] => {
        pub fn collect() -> Vec<(String, Vec<rocket::Route>)> {
            #[allow(unused_mut)]
            let mut output = vec![];
            $(
                output.append(&mut $module::build());
            )*
            output
        }
    };
}

route_collector![
    media,
];
