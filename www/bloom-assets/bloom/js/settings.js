// On document ready call ajax function with the token from URL

$(document).ready(function() {
    console.log("==================",'test');
    // Get token from url 
    var token = localStorage.getItem("token");
    console.log(token);
    // Call ajax function
    $("#username").html(localStorage.getItem("name"));


    var settings = {
        //"url": "http://"+server+":9000/wifi/info",
        //url: 'http://192.168.100.1/api/?function=/wifi/info',
        url: "http://"+server+"/api/?function=/wifi/info",
        method: "POST",
        timeout: 0,
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify({
          "token": token
        }),
    };
    
    $.ajax(settings).done(function (response) {
        
        console.log(response);
        if (response.status) {
            // Get token from response and save that in local
            console.log('success  ');
            $("#wifi_essid").val(response.wifi_info.wifi_essid);
            $("#wifi_password").val(response.wifi_info.wifi_password);
            $("#lan_ip_address").val(response.wifi_info.lan_ip_address);
            $("#lan_ip_netmask").val(response.wifi_info.lan_ip_netmask);
            
        }else{
            if(response.message=="Token Verification Failed"){
                window.location.href = "/login.html";
            }
        }
    });
    // On click of show_wifi_password show wifi_password input field text
    $("#show_wifi_password").click(function(e) {
        console.log("clicked");
        e.preventDefault();
        // If filed is hidden show it, if its showing hide it
        console.log($("#wifi_password").attr("type"));
        if ($("#wifi_password").attr("type") == "password") {
            $("#wifi_password").attr("type", "text");
            //$("#show_wifi_password").html("Hide Password")
        }else{
            $("#wifi_password").attr("type", "password");
        }
    });

    $("#update_wifi_settings").click(function(e) {
        // Get WiFi Essid and password and submit to ajax
        e.preventDefault();
        var wifi_essid = $("#wifi_essid").val();
        var wifi_password = $("#wifi_password").val();
        token = localStorage.getItem("token");
        console.log(wifi_password);
        var data = {
            "token": token,
            "wifi_essid": wifi_essid,
            "wifi_password": wifi_password,
        };
        var update_settings = {
            //"url": "http://"+server+":9000/wifi/update",
            //url: 'http://192.168.100.1/api/?function=/wifi/update',
            url: "http://"+server+"/api/?function=/wifi/update",
            method: "POST",
            timeout: 0,
            headers: {
              "Content-Type": "application/json"
            },
            "data": JSON.stringify(data),
        };
          
        $.ajax(update_settings).done(function (response) {
            console.log(response);
            if (response.status) {
                console.log('success  ');
                window.location.href = "/settings.html";
            }else{
                if(response.message=="Token Verification Failed"){
                    window.location.href = "/login.html";
                }
            }
        });
    });
    $("#update_lan_settings").click(function(e) {
        e.preventDefault();
        
        var lan_ip_address = $("#lan_ip_address").val();
        var lan_ip_netmask = $("#lan_ip_netmask").val();
        var token = localStorage.getItem("token");
    
        var data = {
            "token": token,
            "lan_ip_address": lan_ip_address,
            "lan_ip_netmask": lan_ip_netmask,
        };
    
        var update_settings = {
            url: "http://" + server + "/api/?function=/lan/update",
            method: "POST",
            timeout: 0,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(data),
        };
    
        $.ajax(update_settings).done(function(response) {
            if (response.status) {
                console.log('Success: ', response.message);
                window.location.href = "/settings.html";
            } else {
                console.log('Error: ', response.message);
                $("#error_message").text(response.message).show();
    
                // Check if token verification failed and redirect to login page
                if (response.message === "Token Verification Failed") {
                    window.location.href = "/login.html";
                } else {
                    // Show the error message for 5 seconds, then hide it
                    setTimeout(function() {
                        $("#error_message").fadeOut(); // Hide the error message with fade out
                    }, 5000); // 5000 milliseconds = 5 seconds
                }
            }
        }).fail(function(jqXHR, textStatus) {
            // Handle request failure
            console.log('Request failed: ', textStatus);
            $("#error_message").text('An error occurred while updating settings. Please try again.').show();
    
            // Show the error message for 5 seconds, then hide it
            setTimeout(function() {
                $("#error_message").fadeOut(); // Hide the error message with fade out
            }, 5000); // 5000 milliseconds = 5 seconds
        });
    });
    
    // $("#update_lan_settings").click(function (e) {
    //     e.preventDefault();

    //     var lan_ip_address = $("#lan_ip_address").val();
    //     var lan_ip_netmask = $("#lan_ip_netmask").val();
    //     var token = localStorage.getItem("token");

    //     var data = {
    //         "token": token,
    //         "lan_ip_address": lan_ip_address,
    //         "lan_ip_netmask": lan_ip_netmask,
    //     };

    //     var update_settings = {
    //         url: "http://" + server + "/api/?function=/lan/update",
    //         method: "POST",
    //         timeout: 0,
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         data: JSON.stringify(data),
    //     };

    //     $.ajax(update_settings).done(function (response) {
    //         if (response.status) {
    //             console.log('Success: ', response.message);
    //             window.location.href = "/settings.html";
    //         } else {
    //             console.log('Error: ', response.message);
    //             $("#error_message").text(response.message).show();
    //             if (response.message === "Token Verification Failed") {
    //                 window.location.href = "/login.html";
    //             }
    //         }
    // }).fail(function (jqXHR, textStatus) {
    //     // Handle request failure
    //     console.log('Request failed: ', textStatus);
    //     $("#error_message").text('An error occurred while updating settings. Please try again.').show();
    // });
    // }); 
});