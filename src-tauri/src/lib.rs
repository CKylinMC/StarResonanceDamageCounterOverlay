use tauri::{Manager, LogicalPosition};


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen_size = monitor.size();
                    let scale_factor = monitor.scale_factor();
                    
                    let logical_screen_height = screen_size.height as f64 / scale_factor;
                    
                    let window_size = window.inner_size().unwrap_or_default();
                    let logical_window_height = window_size.height as f64 / scale_factor;
                    
                    let x = 20.0; 
                    let y = (logical_screen_height - logical_window_height) / 2.0;
                    
                    let position = LogicalPosition::new(x, y);
                    let _ = window.set_position(position);
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { .. } => {
                    
                    if window.label() == "about" {
                        std::process::exit(0);
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
