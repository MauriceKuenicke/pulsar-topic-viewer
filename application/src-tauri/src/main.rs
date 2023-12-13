// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod dirs;
mod cmd;


fn main() {
    // Setup
    dirs::init_app_data_dir().expect("Error during data directory initialization.");

    // Run App
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![cmd::write_to_conf_file,
            cmd::read_available_connections,
            cmd::delete_local_configuration
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


