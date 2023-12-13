use std::fs::{File, remove_file};
use std::io::{Write, Read};
use serde_json::Value;
use crate::dirs;
use std::fs::read_dir;

#[derive(serde::Deserialize, serde::Serialize)]
pub struct ConnectionConfig {
    name: String,
    url: String,
    tenant: String,
    namespace: String,
    topic: String,
    auth_method: String,
    auth_creds: Option<Value>,
}

#[tauri::command]
pub fn write_to_conf_file(data: ConnectionConfig) -> bool {
    let output_data = serde_json::to_string(&data).expect("Error while parsing JSON.");

    // Write to connection file
    let connections_dir = dirs::get_connections_dir();
    let file_name = format!("{}.conf", data.name.as_str());
    let config_path = connections_dir.join(&file_name);
    let mut file = File::create(&config_path).expect("Failed to create config file");
    file.write_all(output_data.as_bytes()).expect("Error while writing to file");
    return true
}

#[tauri::command]
pub fn read_available_connections() -> Vec<Value> {
    let mut json_configurations:Vec<Value> = Vec::new();
    let connections_dir = dirs::get_connections_dir();

    let config_files = read_dir(connections_dir).unwrap();
    for file in config_files{
        let open_file = File::open(file.unwrap().path());
            match open_file {
                Ok(mut content) => {
                    let mut file_content = String::new();
                    content.read_to_string(&mut file_content).expect("Failed to read the file");
                    let json: Value = serde_json::from_str(&file_content).expect("Error parsing JSON.");
                    json_configurations.push(json);
                }
                Err(e) => {
                    println!("Error occurred while reading file: {:?}", e);
                }
            }
    }
    return json_configurations
}

#[tauri::command]
pub fn delete_local_configuration(name: &str) -> bool {
    let connections_dir = dirs::get_connections_dir();
    let file_name = format!("{}.conf", name);
    remove_file(connections_dir.join(file_name)).expect("Error deleting configuration file.");
    return true
}
