use tauri::{Manager, LogicalPosition};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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
            // 获取主窗口
            if let Some(window) = app.get_webview_window("main") {
                // 获取当前显示器信息
                if let Ok(Some(monitor)) = window.current_monitor() {
                    let screen_size = monitor.size();
                    let scale_factor = monitor.scale_factor();
                    
                    // 获取逻辑尺寸（考虑DPI缩放）
                    let logical_screen_height = screen_size.height as f64 / scale_factor;
                    
                    let window_size = window.inner_size().unwrap_or_default();
                    let logical_window_height = window_size.height as f64 / scale_factor;
                    
                    // 计算左侧中部位置（使用逻辑坐标）
                    let x = 20.0; // 距离左边缘 20px
                    let y = (logical_screen_height - logical_window_height) / 2.0;
                    
                    // 设置窗口位置
                    let position = LogicalPosition::new(x, y);
                    let _ = window.set_position(position);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
