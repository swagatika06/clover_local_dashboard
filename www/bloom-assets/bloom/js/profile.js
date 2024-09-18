// On document ready call ajax function with the token from URL

$(document).ready(function() {
    // Get token from url 
    var token = localStorage.getItem("token");
    console.log(token);
    // Call ajax function
    $("#username").html(localStorage.getItem("name"));


    var settings = {
        //"url": "http://"+server+":9000/user/info",
        //url: 'http://192.168.100.1/api/?function=/user/info',
        url: "http://"+server+"/api/?function=/user/info",
        method: "POST",
        timeout: 0,
        headers: {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify({
          "token": token
        }),
    };
      
    $.ajax(settings).done(function (response) {
        console.log(response);
        if (response.status) {
            // Get token from response and save that in local
            $("#name").val(response.user_info.name);
        }else{
            if(response.message=="Token Verification Failed"){
                window.location.href = "/login.html";
            }
        }
    });
    // On click of show_wifi_password show wifi_password input field text
    $("#show_new_password").click(function(e) {
        console.log("clicked");
        e.preventDefault();
        // If filed is hidden show it, if its showing hide it
        console.log($("#new_password").attr("type"));
        if ($("#new_password").attr("type") == "password") {
            $("#new_password").attr("type", "text");
            //$("#show_wifi_password").html("Hide Password")
        }else{
            $("#new_password").attr("type", "password");
        }
    });

    $("#show_repeat_new_password").click(function(e) {
        console.log("clicked");
        e.preventDefault();
        // If filed is hidden show it, if its showing hide it
        console.log($("#repeat_new_password").attr("type"));
        if ($("#repeat_new_password").attr("type") == "password") {
            $("#repeat_new_password").attr("type", "text");
            //$("#show_wifi_password").html("Hide Password")
        }else{
            $("#repeat_new_password").attr("type", "password");
        }
    });

    $("#update_name").click(function(e) {
        // Get WiFi Essid and password and submit to ajax
        e.preventDefault();
        console.log("update_name clicked");
        var name = $("#name").val();
        token = localStorage.getItem("token");
        console.log(name);
        var data = {
            "token": token,
            "name": name,
        };
        var settings = {
            //"url": "http://"+server+":9000/user/update/name",
            //url: 'http://192.168.100.1/api/?function=/user/update/name',
            url: "http://"+server+"/api/?function=/user/update/name",
            
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(data),
        };
        $.ajax(settings).done(function (response) {
            console.log(response);
            if (response.status) {
                // Get token from response and save that in local
                console.log('success  ');
                $("#message").removeClass("alert alert-sm alert-warning");
                $("#message").addClass("alert alert-sm alert-success");
                $("#message").html(response.message);
                $("#message").show();
                // Wait for 1.5 sec and redirect to profile.html
                setTimeout(function() {
                    window.location.href = "/profile.html";
                }, 1500);
                
            }else{
                $("#message").removeClass("alert alert-sm alert-success");
                $("#message").addClass("alert alert-sm alert-warning");
                $("#message").html(response.message);
                $("#message").show();
                // Wait for 1.5 sec and redirect to profile.html
                if(response.message=="Token Verification Failed"){
                    setTimeout(function() {
                        window.location.href = "/login.html";
                    }, 1500);
                }
            }
        });
    });

    $("#update_password").click(function(e) {
        e.preventDefault();
        console.log("update_password clicked");
        var password = $("#user_password").val();
        var new_password = $("#new_password").val();
        var repeat_new_password = $("#repeat_new_password").val();
        token = localStorage.getItem("token");

        if(new_password != repeat_new_password || new_password.length < 6 || repeat_new_password.length < 6){
            if (new_password != repeat_new_password){
                $("#message").removeClass("alert alert-sm alert-success");
                $("#message").addClass("alert alert-sm alert-warning");
                $("#message").html("New Password and Repeat New Password does not match");
                $("#message").show();
                return;
            }else{
                $("#message").removeClass("alert alert-sm alert-success");
                $("#message").addClass("alert alert-sm alert-warning");
                $("#message").html("Password length should be greater than 6");
                $("#message").show();
                return;
            }
        }else{
            var data = {
                "token": token,
                "password": password,
                "new_password": new_password,
                "new_password_repeat": repeat_new_password,
            };
            console.log(data);
            var settings = {
                //"url": "http://"+server+":9000/user/update/password",
                //url: 'http://192.168.100.1/api/?function=/user/update/password',
                url: "http://"+server+"/api/?function=/user/update/password",
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(data),
            };
            $.ajax(settings).done(function (response) {
                console.log(response);
                if (response.status) {
                    // Get token from response and save that in local
                    console.log('success  ');
                    $("#message").removeClass("alert alert-sm alert-warning");
                    $("#message").addClass("alert alert-sm alert-success");
                    $("#message").html(response.message);
                    $("#message").show();
                    // Wait for 1.5 sec and redirect to profile.html
                    setTimeout(function() {
                        window.location.href = "/profile.html";
                    }, 1500);
                    
                }else{
                    $("#message").removeClass("alert alert-sm alert-success");
                    $("#message").addClass("alert alert-sm alert-warning");
                    $("#message").html(response.message);
                    $("#message").show();
                    // Wait for 1.5 sec and redirect to profile.html
                    if(response.message=="Token Verification Failed"){
                        setTimeout(function() {
                            window.location.href = "/login.html";
                        }, 1500);
                    }
                }
            });
        }
    });
});