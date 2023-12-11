use std::{fs, path::PathBuf};

/// Create the complete directory structure for the local application data.
pub fn init_app_data_dir() -> std::io::Result<()> {
    let app_data_dir: PathBuf = get_connections_dir();
    fs::create_dir_all(app_data_dir)?;
    Ok(())
}

/// Fetch the base directory for the local application data.
///
/// E.g.
/// **Windows**: `C:\Users\User\AppData\Roaming\BellPTV`
pub fn get_app_base_dir() -> PathBuf {
    let mut home_dir: PathBuf = tauri::api::path::data_dir().unwrap();
    home_dir.push("BellPTV");
    return home_dir;
}


/// Fetch the path to the connections directory inside the application data directory.
///
/// E.g.
/// **Windows**: `C:\Users\User\AppData\Roaming\BellPTV\connections`
pub fn get_connections_dir() -> PathBuf {
    let mut base_dir: PathBuf = get_app_base_dir();
    base_dir.push("connections");
    return base_dir;
}
