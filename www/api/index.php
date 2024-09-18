<?php

header('Content-Type: application/json');
$function = isset($_GET['function']) ? $_GET['function'] : '';  

// function verify_token($token) {
   
//     $hardcoded_token = 'test123';
//     return $token === $hardcoded_token;
// }
function verify_token($token) {
    // Get token, token_status, and token_expiry from uci and compare with request token
    $local_token = trim(shell_exec("uci get bloom.@user[0].token"));
    $token_status = trim(shell_exec("uci get bloom.@user[0].token_status"));
    $token_expiry = trim(shell_exec("uci get bloom.@user[0].token_expiry"));

    $current_time = date('Y-m-d H:i:s');

    if ($token === $local_token) {
        return true;
    } else {
        return false;
    }
}
// Function to handle user login
function user_login() {
    // echo "Request method------: " . $_SERVER['REQUEST_METHOD']. "\n";
    // Read the raw input stream
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Check if data decoding was successful
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        echo "Failed to decode JSON data: " . json_last_error_msg() . "\n";
        return;
    }
    
    //  echo "Request ------: \n";
    //  print_r($data); 

    $username = isset($data['username']) ? trim($data['username']) : null;
    $password = isset($data['password']) ? trim($data['password']) : null;
    // Print the username and password
    //echo "Username: " . $username . "\n";
    //echo "Password: " . $password . "\n";

    if ($username === null || $password === null) {
        
        echo json_encode(['status' => false, 'message' => 'Username and password are required>>>>']);
        return;
    }
    //$salt = 'abcd';  

    //$password_hash = md5($salt . $password);
    $password_hash = md5(trim($password));

    $stored_username = trim(shell_exec("uci get bloom.@user[0].username"));
    $stored_password_hash = trim(shell_exec("uci get bloom.@user[0].password"));
    $stored_password_hash = rtrim($stored_password_hash, " -");
    // echo "Stored Hash: " . $stored_password_hash . "\n";
    // echo "Generated Hash: " . $password_hash . "\n";
    // if ($password_hash === $stored_password_hash) {
    //     echo "Password matches.\n";
    // } else {
    //     echo "Password does not match.\n";
    // }

    // Authenticate user

    if ($username === $stored_username && $password_hash === $stored_password_hash) {
    //if ($username === $stored_username) {
        // Generate a token for the user
        $token = base64_encode(random_bytes(30));
        $token = str_replace(['/', '=', '&', '#', '%', '?', '+', ' '], '', $token);
        $name = trim(shell_exec("uci get bloom.@user[0].name"));
        // Update token and status in configuration
        shell_exec("uci set bloom.@user[0].token='$token'");
        shell_exec("uci set bloom.@user[0].token_status='active'");
        $token_expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
        shell_exec("uci set bloom.@user[0].token_expiry='$token_expiry'");
        shell_exec("uci commit bloom");

        echo json_encode([
            'status' => true,
            'message' => 'Login Successful',
            'token' => $token,
            'name' => $name 
        ]);
    } else {
      
        echo json_encode(['status' => false, 'message' => 'Login Failed']);
    }
}

function user_update_password() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $password = isset($data['password']) ? trim($data['password']) : null;
    $new_password = isset($data['new_password']) ? trim($data['new_password']) : null;
    $new_password_repeat = isset($data['new_password_repeat']) ? trim($data['new_password_repeat']) : null;
    $token = isset($data['token']) ? $data['token'] : null;
    //$token = 'test123';

    if ($password === null || $new_password === null || $new_password_repeat === null || $token === null) {
        echo json_encode(['status' => false, 'message' => 'All fields are required']);
        return;
    }

    if (verify_token($token)) {
        
        $password_md5 = md5(trim($password));
        
        // Get the current password from uci
        $stored_password = trim(shell_exec("uci get bloom.@user[0].password"));
        $stored_password = rtrim($stored_password, " -");
        
        if ($password_md5 === $stored_password) {
            
            if ($new_password === $new_password_repeat) {
               
                $new_password_md5 = md5(trim($new_password));
                
                // Update password in uci
                $update_command = "uci set bloom.@user[0].password='" . escapeshellcmd($new_password_md5) . "'";
                shell_exec($update_command);
                
                // Commit changes to uci
                shell_exec("uci commit bloom");
                
                echo json_encode(['status' => true, 'message' => 'Password Updated Successfully']);
            } else {
                echo json_encode(['status' => false, 'message' => 'New Password and Repeated new password do not match']);
            }
        } else {
            echo json_encode(['status' => false, 'message' => 'Existing password is wrong']);
        }
    } else {
        echo json_encode(['status' => false, 'message' => 'Token Verification Failed']);
    }
}

function user_update_name() {
   
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $name = isset($data['name']) ? trim($data['name']) : null;
    $token = isset($data['token']) ? $data['token'] : null;
    //$token = 'test123';

    if ($name === null || $token === null) {
        echo json_encode(['status' => false, 'message' => 'Name and token are required']);
        return;
    }

    if (verify_token($token)) {
        
        $update_command = "uci set bloom.@user[0].name='" . escapeshellcmd($name) . "'";
        shell_exec($update_command);

        shell_exec("uci commit bloom");

        echo json_encode(['status' => true, 'message' => 'Name Updated Successfully']);
    } else {
    
        echo json_encode(['status' => false, 'message' => 'Login Failed']);
    }
}


function user_info() {
   
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    $token = isset($request['token']) ? $request['token'] : null;
    //$token = 'test123';
    //$stored_token = 'test123';
    if ($token === null) {
        echo json_encode(['status' => false, 'message' => 'Token is required']);
        return;
    }

    if (verify_token($token)) {

        $user_info = [];
        $user_info['username'] = 'admin';
        $user_info['name'] = trim(shell_exec("uci get bloom.@user[0].name"));

        echo json_encode([
            'status' => true,
            'message' => 'User Info',
            'user_info' => $user_info
        ]);
    } else {
        
        echo json_encode([
            'status' => false,
            'message' => 'Login Failed'
        ]);
    }
}

function wifi_update() {

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $wifi_password = isset($data['wifi_password']) ? trim($data['wifi_password']) : null;
    $wifi_essid = isset($data['wifi_essid']) ? trim($data['wifi_essid']) : null;
    $lan_ip_address = isset($data['lan_ip_address']) ? trim($data['lan_ip_address']) : null;
    $lan_ip_netmask = isset($data['lan_ip_netmask']) ? trim($data['lan_ip_netmask']) : null;

    $token = isset($data['token']) ? trim($data['token']) : null;
    //$token = 'test123';

    // Initialize flag to check if updates are made
    $wifi_updated = false;

    if (verify_token($token)) {
        
        $present_wifi_password = trim(shell_exec("uci get wireless.@wifi-iface[0].key"));
        
        if ($present_wifi_password !== $wifi_password) {
            
            if (strlen($wifi_password) < 8) {
                echo json_encode(['status' => false, 'message' => 'WiFi Password should be at least 8 characters long']);
                return;
            }
            
            shell_exec("uci set wireless.@wifi-iface[0].key='$wifi_password'");
            $wifi_updated = true;
        }

        $present_wifi_essid = trim(shell_exec("uci get wireless.@wifi-iface[0].ssid"));
        
        // Check if the provided WiFi ESSID differs from the current one
        if ($present_wifi_essid !== $wifi_essid) {
            // Update the WiFi ESSID in uci
            shell_exec("uci set wireless.@wifi-iface[0].ssid='$wifi_essid'");
            $wifi_updated = true;
        }

        // If any updates were made, commit the changes and restart the WiFi
        if ($wifi_updated) {
            shell_exec("uci commit wireless");
            shell_exec("wifi");
            echo json_encode(['status' => true, 'message' => 'WiFi Info Updated Successfully']);
        } else {
            echo json_encode(['status' => true, 'message' => 'WiFi Info Already Updated']);
        }
    } else {
        // If token verification fails
        echo json_encode(['status' => false, 'message' => 'Token Verification Failed']);
    }
}
// function to validate IP address
function is_valid_ip($ip) {
    $parts = explode('.', $ip);
    if (count($parts) !== 4) {
        return false;
    }
    foreach ($parts as $part) {
        if (!is_numeric($part) || $part < 0 || $part > 255) {
            return false;
        }
    }
    return true;
}
function lan_update() {
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $lan_ip_address = isset($data['lan_ip_address']) ? trim($data['lan_ip_address']) : null;
    $lan_ip_netmask = isset($data['lan_ip_netmask']) ? trim($data['lan_ip_netmask']) : null;
    $token = isset($data['token']) ? trim($data['token']) : null;

    $allowed_netmasks = ['255.255.255.0', '255.255.0.0', '255.0.0.0'];

    if (verify_token($token)) {
       
        if (!is_valid_ip($lan_ip_address)) {
            echo json_encode(['status' => false, 'message' => 'Invalid LAN IP Address']);
            return;
        }

        if (!in_array($lan_ip_netmask, $allowed_netmasks)) {
            echo json_encode(['status' => false, 'message' => 'Invalid LAN IP Netmask']);
            return;
        }

        $lan_updated = false;

        $present_lan_ip_address = trim(shell_exec("uci get network.lan.ipaddr"));
        $present_lan_netmask = trim(shell_exec("uci get network.lan.netmask"));

        if ($present_lan_ip_address !== $lan_ip_address && is_valid_ip($lan_ip_address)) {
            shell_exec("uci set network.lan.ipaddr='$lan_ip_address'");
            $lan_updated = true;
        }

        if ($present_lan_netmask !== $lan_ip_netmask && in_array($lan_ip_netmask, $allowed_netmasks)) {
            shell_exec("uci set network.lan.netmask='$lan_ip_netmask'");
            $lan_updated = true;
        }

        if ($lan_updated) {
            shell_exec("uci commit network");
            shell_exec("/etc/init.d/network restart");

           // Update config.js with new IP address and netmask
           $config_js_path = __DIR__ . '/../bloom-assets/bloom/js/config.js';
           if (file_exists($config_js_path)) {
               $config_content = file_get_contents($config_js_path);

               // Update IP address
               $config_content = preg_replace('/var\s+server\s*=\s*"[^"]*";/', 'var server = "' . $lan_ip_address . '";', $config_content);

               file_put_contents($config_js_path, $config_content);
           }
            echo json_encode(['status' => true, 'message' => 'LAN Settings Updated Successfully']);
        } else {
            echo json_encode(['status' => true, 'message' => 'LAN Settings Already Updated']);
        }
    } else {
        echo json_encode(['status' => false, 'message' => 'Token Verification Failed']);
    }
}


function analytics() {

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $token = isset($data['token']) ? trim($data['token']) : null;
    //$token = isset($_POST['token']) ? $_POST['token'] : null;
    //$token = 'test123';

    if (verify_token($token)) {
        
        $wifi_password = shell_exec("uci get wireless.@wifi-iface[0].key");
        $wifi_essid = shell_exec("uci get wireless.@wifi-iface[0].ssid");
        $lan_ip_address = shell_exec("uci get network.lan.ipaddr");
        $lan_ip_netmask = shell_exec("uci get network.lan.netmask");

        $lease_list = [];
        $now_time = (int) trim(shell_exec("date +%s"));
        $leases = file('/tmp/dhcp.leases', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($leases as $line) {
            $parts = preg_split('/\s+/', $line);
            $lease_expiration_time = (int) $parts[0];
            if ($now_time < $lease_expiration_time) {
                $lease = [
                    'expiration_time' => $parts[0],
                    'mac_address' => strtoupper($parts[1]),
                    'ip_address' => $parts[2],
                    'hostname' => $parts[3] ?? ''
                ];
                $lease_list[] = $lease;
            }
        }

        $connected_devices = trim(shell_exec("cat /tmp/dhcp.leases | wc -l"));

        $wifi_info = [
            'wifi_password' => trim($wifi_password),
            'wifi_essid' => trim($wifi_essid),
            'lan_ip_address' => trim($lan_ip_address),
            'lan_ip_netmask' => trim($lan_ip_netmask),
            'connected_devices' => $connected_devices
        ];

        echo json_encode([
            'status' => true,
            'message' => 'WiFi Info Updated Successfully',
            'clients' => $lease_list,
            'wifi_info' => $wifi_info
        ]);
    } else {
        echo json_encode([
            'status' => false,
            'message' => 'Token Verification Failed'
        ]);
    }
}

// Function to get uplink status
function uplinkstatus() {
   
    $downloads = [];
    $uploads = [];

    $input = file_get_contents('php://input');
    $request = json_decode($input, true);

    $token = isset($request['token']) ? $request['token'] : null;

    if (verify_token($token)) {
        for ($i = 0; $i < 2; $i++) {
            try {
                
                $download_bw = shell_exec("uci -c /tmp get bloom-status.@upstream_links[$i].download_bw");
                $download_bw = trim($download_bw);
                if (strpos($download_bw, " Kbps") !== false) {
                   
                    $downloads[$i] = floatval(substr($download_bw, 0, -5));
                } else {
                    $downloads[$i] = 0;
                }
            } catch (Exception $e) {
                $downloads[$i] = 0;
            }

            try {
               
                $upload_bw = shell_exec("uci -c /tmp get bloom-status.@upstream_links[$i].upload_bw");
                $upload_bw = trim($upload_bw);
                if (strpos($upload_bw, " Kbps") !== false) {
                    
                    $uploads[$i] = floatval(substr($upload_bw, 0, -5));
                } else {
                    $uploads[$i] = 0;
                }
            } catch (Exception $e) {
                $uploads[$i] = 0;
            }
        }
        echo json_encode([
            'status' => true,
            'message' => 'Uplink Status Retrieved Successfully',
            'uplink_status' => [
                'downloads' => $downloads,
                'uploads' => $uploads
            ]
        ]);
    } else {
    
        echo json_encode([
            'status' => false,
            'message' => 'Token Verification Failed'
        ]);
    }
}

function get_wifi_info() {
    
    $wifi_password = shell_exec("uci get wireless.@wifi-iface[0].key");
    $wifi_essid = shell_exec("uci get wireless.@wifi-iface[0].ssid");

    $lan_ip_address = shell_exec("uci get network.lan.ipaddr");
    $lan_ip_netmask = shell_exec("uci get network.lan.netmask");

    return [
        'wifi_password' => trim($wifi_password),
        'wifi_essid' => trim($wifi_essid),
        'lan_ip_address' => trim($lan_ip_address),
        'lan_ip_netmask' => trim($lan_ip_netmask)
    ];
}

function get_interface_info() {
    
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    
    $token = isset($request['token']) ? $request['token'] : null;
    
    if ($token === null) {
        echo json_encode(['status' => false, 'message' => 'Token is required']);
        return;
    }

    if (verify_token($token)) {
        $active_interface = trim(shell_exec("uci get bloom.@device[0].active_interface"));
        $interface_count = trim(shell_exec("uci get bloom.@device[0].interface_count"));

        echo json_encode([
            'status' => true,
            'message' => 'Interface Info',
            'interface_info' => [
                'active_interfaces' => $active_interface,
                'total_interfaces' => $interface_count
            ]
        ]);
    } else {
        echo json_encode([
            'status' => false,
            'message' => 'Login Failed'
        ]);
    }
}

function pingToGoogle() {
    
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    
    $token = isset($request['token']) ? $request['token'] : null;
    
    if ($token === null) {
        echo json_encode(['status' => false, 'message' => 'Token is required']);
        return;
    }

    if (verify_token($token)) {
        $hostname = "google.com";
        $count = 4;
        
        // Execute ping command
        $ping_output = shell_exec("ping -c $count $hostname");
        
        // Extract the time values where 'time=' appears
        preg_match_all('/time=([0-9.]+) ms/', $ping_output, $matches);
        
        // Calculate average response time
        $time_values = $matches[1];
        if (count($time_values) > 0) {
            $average_time = array_sum($time_values) / count($time_values);
            $average_time = round($average_time, 2);
        } else {
            $average_time = 0.0;
        }
        
        echo json_encode([
            'status' => true,
            'message' => 'Ping Info',
            'ping_info' => [
                'average_time' => $average_time
            ]
        ]);
    } else {
        echo json_encode([
            'status' => false,
            'message' => 'Login Failed'
        ]);
    }
}

// Function to process speed test results
function process_speed_test_results($callback) {
    $results_file = '/tmp/speedtest_results.json';

    // Check if results file exists and is not empty
    if (file_exists($results_file) && filesize($results_file) > 0) {
        $results = file_get_contents($results_file);
        // Decode JSON and pass to callback
        $data = json_decode($results, true);
        call_user_func($callback, $data);
    } else {
        call_user_func($callback, ['status' => 'pending', 'message' => 'Speed test results are not ready yet.']);
    }
}

// Function to start the speed test
function start_speed_test($callback) {
    $results_file = '/tmp/speedtest_results.json';

    // // Run the speed test command in the background
    // exec("nohup speedtest-cli --json > $results_file 2>&1 &");

    // // Poll for results
    // $poll_interval = 10; // seconds

    // while (true) {
    //     sleep($poll_interval);
    //     process_speed_test_results($callback);

    //     // Check if file has results
    //     if (file_exists($results_file) && filesize($results_file) > 0) {
    //         $results = json_decode(file_get_contents($results_file), true);
    //         if (isset($results['status']) && $results['status'] !== 'pending') {
    //             break;
    //         }
    //     }
    // }

     // Skip the actual speed test command and directly process the dummy results
     process_speed_test_results($callback);
}

// Function to handle speed test results
function handle_speed_test_results($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
}

switch ($function) {
    case '/wifi/info':
        // Parse the request data
        $input = file_get_contents('php://input');
        $request = json_decode($input, true);
        $token = isset($request['token']) ? $request['token'] : null;

        if (verify_token($token)) {
            $wifi_info = get_wifi_info();

            echo json_encode([
                'status' => true,
                'message' => 'WiFi Info Retrieved Successfully',
                'wifi_info' => $wifi_info
            ]);
        } else {
            echo json_encode([
                'status' => false,
                'message' => 'Token Verification Failed'
            ]);
        }
        break;
        case 'uplinkstatus':
            uplinkstatus();
            break;
        case 'analytics':
                analytics();
                break;     
        case '/user/info':
                    user_info();
                    break;
        case '/user/update/name':
                user_update_name();
                break;            
        case '/wifi/update':
            wifi_update();
            break;
        case '/user/update/password':
            user_update_password();
            break; 
        case '/userlogin':
            user_login(); 
            break;   
        case '/lan/update':
            lan_update(); 
            break;
        case '/interface/info':
            get_interface_info();
            break;  
        case '/ping_to_google':
            pingToGoogle();
            break; 
        case '/start_speed_test':
            start_speed_test('handle_speed_test_results');
            break; 
        default:
        http_response_code(404);
        echo json_encode([
            'status' => false,
            'message' => 'Function not found'
        ]);
        break;
}

?>
