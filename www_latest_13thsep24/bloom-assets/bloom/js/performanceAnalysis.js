
$(document).ready(function () {
  // Get token from url 
  var token = localStorage.getItem("token");
  console.log(token);
  // Call ajax function
  $("#username").html(localStorage.getItem("name"));

  function updateTime() {
    var currentTime = new Date();
    var timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    document.getElementById('current-time').textContent = "Time " + timeString;
  }

  updateTime();
  //setInterval(updateTime, 60000);
    

  var action_id = 0;
  var loadingTexts = [
    "Processing..",
    "Please wait...",
    "Analyzing data...",
    "Almost there...",
    "Loading...",
    "Hold on...",
    "Checking speed...",
    "Getting results..."
  ];
  var loadingspeedTexts = [
    "Connecting to Speedtest Server...",
    "Performing Speedtest...",
    "Analysing Speedtest Results..."];

  var loadingTextIndex = 0;
  var loadingTextInterval;
  var loadingspeedTextIndex = 0;
  var loadingspeedTextInterval;
  function showButtons() {
    $("#peformance_analysis_list").append(`
        <li id="action_${action_id}" style="background-color:#ecf1fb; border: 3px">
          <div class="message other-message pull-right">
            <a class="btn btn-user-options btn-sm show_interfaces" href="#">Show Active Interfaces</a>
            <a class="btn btn-user-options btn-sm mt-1 mb-1 pr-1" href="#" id="show_speedtest">Run Speedtest</a>
            <a class="btn btn-user-options btn-sm ping_to_google" href="#">Ping to Google</a>
            <a class="btn btn-user-options btn-sm mt-1 mb-1 pr-1" href="#" id="Show_Connected_Clients">Show Connected Clients</a>
            <a class="btn btn-user-options btn-sm Wifi_Status" href="#">Wifi Status</a>
            <a class="btn btn-user-options btn-sm Tunnel_Status" href="#">Tunnel Status</a>
          </div>
        </li>
      `);


  }

  function showRightMessage(message) {
    $("#peformance_analysis_list").append(`
        <li style="background-color:#ecf1fb; border: 3px;">
          <div class="message my-message" style="background-color: #fff;">
            <img class="float-end chat-user-img img-40" src="./assets/images/zifilink-icon.png" alt="">
            <div class="message-data text-start">
              <span class="message-data-time">${new Date().toLocaleTimeString()}</span>
            </div>
            ${message}
          </div>
        </li>
      `);
  }

  // Add a div id = "action_"+action_id to performance_analysis_list div.
  showButtons();

  $("#peformance_analysis_list").on('click', '.show_interfaces', function () {
    var d = new Date();
    var n = d.toLocaleTimeString();
    var action_div_id = "action_" + action_id;
    $("#" + action_div_id).remove();
    action_id++;
    var loading_div_id = "loading_" + action_id;
    console.log("Action id is " + action_id);

    // Clear the loading text interval when starting a new action
    clearInterval(loadingTextInterval);
    loadingTextIndex = 0;

    showRightMessage("Show Active Interfaces");

    $("#peformance_analysis_list").append('<li class="clearfix" id="' + loading_div_id + '" ><div class="message other-message pull-right"><img class="float-start chat-user-img img-30" src="assets/images/loading.gif" alt=""><div class="message-data">' + loadingTexts[loadingTextIndex] + '</div></div></li>');

    loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
    loadingTextInterval = setInterval(function () {
      $("#" + loading_div_id + " .message-data").text(loadingTexts[loadingTextIndex]);
      loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;

      // Check if it's the last text, and stop the interval
      if (loadingTextIndex === loadingTexts.length - 1) {
        clearInterval(loadingTextInterval);
      }
    }, 1000);

    var settings = {
        url: "http://" + server + "/api/?function=/interface/info",  
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
        console.log("Response: ", response);  

        const totalInterfaces = response.interface_info.total_interfaces;
        const activeInterfaces = response.interface_info.active_interfaces;

        console.log("Total Interfaces: ", totalInterfaces);
        console.log("Active Interfaces: ", activeInterfaces);

        $("#peformance_analysis_list").append(`
              <li style="background-color:#ecf1fb; border: 3px">
                <div class="message my-message" style="background-color: #fff;">
                  <img class="float-start chat-user-img img-30" src="./assets/images/zifilink-icon.png" alt="">
                  <div class="message-data text-start">
                    <span class="message-data-time">${new Date().toLocaleString()}</span>
                  </div>
                  <p>
                    Total Interfaces: ${totalInterfaces}<br>
                    Active Interfaces: ${activeInterfaces}<br>
                  </p>
                </div>
              </li>
        `);

        $("#" + loading_div_id).remove();

        showButtons();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert("Error: " + textStatus);
        $("#" + loading_div_id).remove();
    });
});

///////////////////////////////////////////////


  $("#peformance_analysis_list").on('click', '.ping_to_google', function () {
    var d = new Date();
    var n = d.toLocaleTimeString();
    var action_div_id = "action_" + action_id;
    $("#" + action_div_id).remove();
    action_id++;
    var loading_div_id = "loading_" + action_id;
    console.log("Action id is " + action_id);

    // Clear the loading text interval when starting a new action
    clearInterval(loadingTextInterval);
    loadingTextIndex = 0;

    showRightMessage("Ping To Google");

    $("#peformance_analysis_list").append('<li class="clearfix" id="' + loading_div_id + '" ><div class="message other-message pull-right"><img class="float-start chat-user-img img-30" src="assets/images/loading.gif" alt=""><div class="message-data">' + loadingTexts[loadingTextIndex] + '</div></div></li>');

    loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
    loadingTextInterval = setInterval(function () {
      $("#" + loading_div_id + " .message-data").text(loadingTexts[loadingTextIndex]);
      loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;

      // Check if it's the last text, and stop the interval
      if (loadingTextIndex === loadingTexts.length - 1) {
        clearInterval(loadingTextInterval);
      }
    }, 1000);

    var settings = {
        url: "http://" + server + "/api/?function=/ping_to_google",  
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
        console.log("Response: ", response);  

        const averageTime = response.ping_info.average_time || "N/A";  
        console.log("Average Time: ", averageTime);

        $("#peformance_analysis_list").append(`
              <li style="background-color:#ecf1fb; border: 3px">
                <div class="message my-message" style="background-color: #fff;">
                  <img class="float-start chat-user-img img-30" src="./assets/images/zifilink-icon.png" alt="">
                  <div class="message-data text-start">
                    <span class="message-data-time">${new Date().toLocaleString()}</span>
                  </div>
                  <p>
                    Time taken to ping Google: <b>${averageTime}</b> ms.
                  </p>
                </div>
              </li>
        `);

        $("#" + loading_div_id).remove();

        showButtons();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert("Error: " + textStatus);  
        $("#" + loading_div_id).remove();  
    });
});


$("#peformance_analysis_list").on('click', '#Show_Connected_Clients', function () {
  var action_div_id = "action_" + action_id;
  $("#" + action_div_id).remove();
  action_id++;
  var loading_div_id = "loading_" + action_id;
  console.log("Action id is " + action_id);

  // Clear the loading text interval when starting a new action
  clearInterval(loadingTextInterval);
  loadingTextIndex = 0;

  showRightMessage("Show Connected Devices");

  $("#peformance_analysis_list").append('<li class="clearfix" id="' + loading_div_id + '" ><div class="message other-message pull-right"><img class="float-start chat-user-img img-30" src="assets/images/loading.gif" alt=""><div class="message-data">' + loadingTexts[loadingTextIndex] + '</div></div></li>');

  loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
  loadingTextInterval = setInterval(function () {
    $("#" + loading_div_id + " .message-data").text(loadingTexts[loadingTextIndex]);
    loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;

    if (loadingTextIndex === loadingTexts.length - 1) {
      clearInterval(loadingTextInterval);
    }
  }, 1000);

  var settings = {
      url: "http://" + server + "/api/?function=analytics",  
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
    console.log("Responseeeeeee:", response);
    if (response.status) {
      const clients = response.clients;
  
      let clientHtml = '';
      for (let i = 0; i < clients.length; i++) {
          let client = clients[i];
          // Apply the border only if it's not the last device
          let borderStyle = i < clients.length - 1 ? 'border-bottom: 1px solid #ccc;' : '';
  
          let client_div = `
              <div style="padding: 10px 0; ${borderStyle}">
                  <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
                      Device ${i + 1}
                  </div>
                  <div style="font-size: 14px;">
                      <p style="margin: 5px 0;"><strong>Device Name:</strong> ${client.hostname}</p>
                      <p style="margin: 5px 0;"><strong>MAC Address:</strong> ${client.mac_address}</p>
                  </div>
              </div>
          `;
          clientHtml += client_div;
      }
  
      $("#peformance_analysis_list").append(`
          <li style="background-color:#ecf1fb; border: 3px; padding: 15px; border-radius: 5px;">
              <div class="message my-message" style="background-color: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  <img class="float-start chat-user-img img-30" src="./assets/images/zifilink-icon.png" alt="">
                  <div class="message-data text-start" style="margin-bottom: 10px;">
                      <span class="message-data-time">${new Date().toLocaleTimeString()}</span>
                  </div>
                  <div>
                      ${clientHtml}
                  </div>
              </div>
          </li>
      `);
  
      $("#" + loading_div_id).remove();
      showButtons();
  }  
      else {
          alert("Failed to fetch client data.");
          $("#" + loading_div_id).remove();
      }
  }).fail(function (jqXHR, textStatus, errorThrown) {
      alert("Error: " + textStatus);
      $("#" + loading_div_id).remove();
  });
});


  $("#peformance_analysis_list").on('click', '.Tunnel_Status', function () {
    var action_div_id = "action_" + action_id;
    $("#" + action_div_id).remove();
    action_id++;
    var loading_div_id = "loading_" + action_id;
    clearInterval(loadingTextInterval);
    loadingTextIndex = 0;
    showRightMessage("Tunnel Status");
    // Send the POST request with dictionary data
    $("#peformance_analysis_list").append('<li class="clearfix" id="' + loading_div_id + '" ><div class="message other-message pull-right"><img class="float-start chat-user-img img-30" src="assets/images/loading.gif" alt=""><div class="message-data">' + loadingTexts[loadingTextIndex] + '</div></div></li>');
    loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
    loadingTextInterval = setInterval(function () {
      $("#" + loading_div_id + " .message-data").text(loadingTexts[loadingTextIndex]);
      loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;

      // Check if it's the last text, and stop the interval
      if (loadingTextIndex === loadingTexts.length - 1) {
        clearInterval(loadingTextInterval);
      }
    }, 1000);
    $.ajax({
      url: "http://192.168.100.1:9000/performance_analysis?arg=Tunnel_Status",
      type: "POST",
      dataType: "json",
      timeout: 10000,
      contentType: 'application/json',
      headers: {
        "Authorization": "Bearer " + token  // Include the JWT token in the Authorization header
      },
      data: JSON.stringify({
        "arg": "Tunnel_Status",
        //  "token": token
      }),
      success: function (ajaxData) {
        const tunnel_stats = ajaxData.status;
        const timer = ajaxData.time;
        let htmlContent = `
                  <div>
                      Tunnel Status: ${tunnel_stats}<br>
                  </div>
              `;
        if (tunnel_stats === "Tunnel Up") {
          htmlContent += `Time to link with the bonding server: ${timer} ms<br>`;
        }
        else {
          htmlContent += "";
        }
        $("#peformance_analysis_list").append(`
                  <li style="background-color:#ecf1fb; border: 3px">
                      <div class="message my-message" style="background-color: #fff;">
                          <img class="float-start chat-user-img img-30" src="./assets/images/zifilink-icon.png" alt="">
                          <div class="message-data text-start"><span class="message-data-time">${new Date().toLocaleTimeString()}</span></div>
                          <p>${htmlContent}</p>
                      </div>
                  </li>
              `);
        $("#" + loading_div_id).remove();
        showButtons();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert("Error: " + errorThrown);
        $("#" + loading_div_id).remove();
      }
    });
  });

  $("#peformance_analysis_list").on('click', '.Wifi_Status', function () {
    var action_div_id = "action_" + action_id;
    $("#" + action_div_id).remove();
    action_id++;
    var loading_div_id = "loading_" + action_id;
    clearInterval(loadingTextInterval);
    loadingTextIndex = 0;
    showRightMessage("WiFi Status");

    // Display loading indicator
    $("#peformance_analysis_list").append('<li class="clearfix" id="' + loading_div_id + '" ><div class="message other-message pull-right"><img class="float-start chat-user-img img-30" src="assets/images/loading.gif" alt=""><div class="message-data">' + loadingTexts[loadingTextIndex] + '</div></div></li>');
    loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;
    loadingTextInterval = setInterval(function () {
      $("#" + loading_div_id + " .message-data").text(loadingTexts[loadingTextIndex]);
      loadingTextIndex = (loadingTextIndex + 1) % loadingTexts.length;

      // Stop the interval after the last text
      if (loadingTextIndex === loadingTexts.length - 1) {
        clearInterval(loadingTextInterval);
      }
    }, 1000);

    var settings = {
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
        console.log("Response: ", response);

        // Extract the WiFi information
        const wifiEssid = response.wifi_info.wifi_essid;
        const wifiPassword = response.wifi_info.wifi_password;

        // Display the WiFi information
        $("#peformance_analysis_list").append(`
            <li style="background-color:#ecf1fb; border: 3px">
                <div class="message my-message" style="background-color: #fff;">
                    <img class="float-start chat-user-img img-30" src="./assets/images/zifilink-icon.png" alt="">
                    <div class="message-data text-start">
                        <span class="message-data-time">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <p>
                        WiFi ESSID: ${wifiEssid}<br>
                        WiFi Password: ${wifiPassword}<br>
                    </p>
                </div>
            </li>
        `);

        $("#" + loading_div_id).remove();
        showButtons();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert("Error: " + textStatus);
        $("#" + loading_div_id).remove();
    });
});

  // code to close the modal

  $(".show-popup").click(function () {
    $("#exampleModalCenter1").modal('show');
    setTimeout(function () {
      $("#action_0").fadeIn(150);
    }, 1000);
  });

  $("#close-button").click(function () {
    $("#exampleModalCenter1").modal('hide');
  });
  $("#go-back").click(function () {
    $("#exampleModalCenter1").modal('hide');
  });
});










