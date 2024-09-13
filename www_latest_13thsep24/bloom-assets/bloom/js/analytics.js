// On document ready call ajax function with the token from URL

$(document).ready(function() {
    // Get token from url 
    var token = localStorage.getItem("token");
    console.log("Token retrieved from localStorage:", token);
    // Call ajax function
    $("#username").html(localStorage.getItem("name"));


    var settings = {
        //"url": "http://"+server+":9000/analytics",
        //url: 'http://192.168.100.1/api/?function=analytics',
        url: "http://"+server+"/api/?function=analytics",
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify({
          "token": token
        }),
    };
      
    $.ajax(settings).done(function (response) {
        console.log("Response of clients:", response);
        if (response.status) {
            // Get token from response and save that in local
            console.log('success  ');
            $("#connected_devices").html(response.wifi_info.connected_devices);
            $("#wifi_essid").html(response.wifi_info.wifi_essid);
            $("#wifi_password").html(response.wifi_info.wifi_password);
            $("#lan_ip_address").html(response.wifi_info.lan_ip_address+'/'+response.wifi_info.lan_ip_netmask);

            // Loop through clinets list and add them to table
            for (var i = 0; i < response.clients.length; i++) {
                client = response.clients[i];
                console.log(client);
                console.log(client.hostname);
                var client_div = '<div class="media"><div class="activity-dot-primary"></div><div class="media-body"><span>'+client.hostname+'</span><h5 class="font-roboto mt-2" id="">'+client.ip_address+' / '+client.mac_address+'</h5></div></div>';
                $("#connected_device_list").append(client_div);
            }
        }else{
            console.log('Analytics request failed with message:', response.message);
            if(response.message=="Token Verification Failed"){
                window.location.href = "/login.html";
            }
        }
    });

    console.log(token);

    var uplink_status_settings = {
        //"url": "http://"+server+":9000/uplinkstatus",
        //url: 'http://192.168.100.1/api/?function=uplinkstatus',
        url: "http://"+server+"/api/?function=uplinkstatus",
        method: "POST",
        timeout: 0,
        headers: {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify({
            "token": token
        }),
    };

    setInterval(function() {
        $.ajax(uplink_status_settings).done(function (response) {
            console.log(response);

            if (response.status) {
                console.log('inside success  ');
                // Get token from response and save that in local
                console.log('Uplink status request success');
                var total_downloaded = 0;
                var total_uploaded = 0;
                console.log(response.uplink_status.downloads[0]);
                var downloads=[0,0];
                var uploads = [0,0];    
                // Iterate over downloads and add all of them
                var active_uplinks = 0;
                for (var i = 0; i < 2; i++) {
                    // Convert to integer
                    downloads[i] = Math.round(parseFloat(response.uplink_status.downloads[i]));
                    
                    total_downloaded += downloads[i]
                }
                // Iterate over uploads and add all of them
                for (var i = 0; i < 2; i++) {
                    // Convert to integer
                    uploads[i] = Math.round(parseFloat(response.uplink_status.uploads[i]));
                    total_uploaded += uploads[i]
                }
                console.log('Download Before :'+total_downloaded);
                total_downloaded=(Math.round(total_downloaded/100)/10).toFixed(1);
                console.log('After :'+total_downloaded);
                console.log('Upload Before :'+total_uploaded);
                total_uploaded=(Math.round(total_uploaded/100)/10).toFixed(1);
                console.log('Upload After :'+total_uploaded);

                // Loop through downloads and uploads and if atleast one of them is greater than 0 then increment active_uplinks
                for (var i = 0; i < 2; i++) {
                    if(downloads[i]>0 || uploads[i]>0){
                        active_uplinks++;
                    }   
                }
                console.log('Active uplinks:', active_uplinks);
                $("#active_uplinks").html(active_uplinks);
                if(total_downloaded>150){
                    chart4.updateSeries([100]);
                }else{
                    // console.log('Log of total_downloaded:: '+map_numbers(total_downloaded,0,150,0,100));
                    var modified_value = 0;
                    
                    console.log(map_numbers(total_downloaded,0,150,0,100));

                    chart4.updateSeries([total_downloaded]);
			
                }
                if(total_uploaded>150){
                    uploadChart.updateSeries([100]);
                }else{
                    console.log('Log of total_uploaded:: '+map_numbers(total_uploaded,0,150,0,100));
                    uploadChart.updateSeries([total_uploaded]);
                }
                chart3.updateSeries([{
                    name: 'Downloads',
                    data: downloads
                  }, {
                    name: 'Uploads',
                    data: uploads
                  }]);
            }
        }
    )}, 1000);

    function map_numbers(mynum, in_min, in_max, out_min, out_max) {
        return (mynum - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
      }
});