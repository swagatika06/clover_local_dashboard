// On sign-in click get values from username and password fields also stop submit
$(document).ready(function() {
  // If get has logout=1 then delte localStorate 
  var url_string = window.location.href;
  var url = new URL(url_string);
  var logout = url.searchParams.get("logout");
  // If logout is set and its value is 1 then delete localStorage
  // Check if logout is set 
  if (logout != null) {
      // Check if logout is 1

      if (logout == 1) {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
      }
  }

  $("#sign-in").click(function(e) {
      e.preventDefault();
      var username = $("#username").val();
      var password = $(".login_password").val();
      // Check if username and password are empty
      console.log(username);
      console.log(password);
      console.log(localStorage.getItem("token"));
      if (username == "" || password == "") {
          console.log("Username or password is empty");
          return;
      }
      var data = {
        "username": username,
        "password": password
      };
      console.log("Data being sent:", JSON.stringify(data));  

      var settings = {
          //"url": "http://"+server+":9000/userlogin",
          //url: 'http://192.168.100.1/api/?function=/userlogin',
          url: "http://"+server+"/api/?function=/userlogin",
          method: "POST",
          timeout: 0,
          headers: {
            "Content-Type": "application/json"
          },
          "data": JSON.stringify(data)
      };
        
      $.ajax(settings).done(function(response) {
        console.log("===================",response);
        if (response.status) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("name", response.name);
            window.location.href = "/analytics.html";
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log("Request failed: " + textStatus + ", " + errorThrown);
    });
  });
});

