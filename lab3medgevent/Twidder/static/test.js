userInfo = function(email) {    // Om vi gör userInfo() så tilldelar vi email till vår lokala/inloggade mail, så att funktionen kan användas både till att visa info om sig själv och om andra
    var token = localStorage.getItem("token");

    if (email == null) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                user = JSON.parse(xhttp.responseText);

            if (user.success) {
                document.getElementById("loggedinname").innerHTML = user.data[0].firstname;
                document.getElementById("loggedinfamilyname").innerHTML = user.data[0].familyname;
                document.getElementById("loggedinemail").innerHTML = user.data[0].email;
                document.getElementById("loggedingender").innerHTML = user.data[0].gender;
                document.getElementById("loggedincity").innerHTML = user.data[0].city;
                document.getElementById("loggedincountry").innerHTML = user.data[0].country;
                return true;
            } else {
                alert(user.message);
                return false;
            }
        }
    };
        xhttp.open("GET",'/get-user-data-by-token/', true);
        xhttp.setRequestHeader("Authorization", token);
        xhttp.send();

    } else {

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            user = JSON.parse(xhttp.responseText);

            if (user.success) {
                document.getElementById("loggedinname").innerHTML = user.data[0].firstname;
                document.getElementById("loggedinfamilyname").innerHTML = user.data[0].familyname;
                document.getElementById("loggedinemail").innerHTML = user.data[0].email;
                document.getElementById("loggedingender").innerHTML = user.data[0].gender;
                document.getElementById("loggedincity").innerHTML = user.data[0].city;
                document.getElementById("loggedincountry").innerHTML = user.data[0].country;
                return true;
            } else {
                alert(user.message);
                return false;
            }
        }
    };
    xhttp.open("GET",'/get-user-data-by-email/' + email, true);
    xhttp.setRequestHeader("Authorization", token);
    xhttp.send();
        }
};



    if (email == null) {
        email = getEmailByToken(token, function() {
            if (this.success) {
                alert(this.message);
                return "linus@tjena.se";
            } else {
                console.log(this.message)
            }
        });
    }


/// SKICKA MEDDELANDE

   if (tabbis === "Browse") {       // Om vi är inne på Browsetaben så vill vi använda "den andra varianten/innehållet" i "posttextarea" = 1
       var postMessage = {
           "message" : text[1].value,
           "recipient" : document.getElementById("searchemail").value
       };

       var xhttp = new XMLHttpRequest();
       xhttp.onreadystatechange = function() {
           if (this.readyState == 4 && this.status == 200) {
               result = JSON.parse(xhttp.responseText);

               if (result.success) {
                   document.getElementsByName("posttextarea")[1].value = "";
                   searchForUser();
                   return true;
               } else {
                   alert(result.message);
                   return false;
            }
        }
    };
    xhttp.open("POST",'/post-message', true);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.setRequestHeader("Authorization", localStorage.getItem("token"));
    xhttp.send(JSON.stringify(postMessage));

    } else {
       var postMessage = {
           "message" : text[0].value,
           "recipient" : "linus@tjena.se"
       };

       var xhttp = new XMLHttpRequest();
       xhttp.onreadystatechange = function() {
           if (this.readyState == 4 && this.status == 200) {
               result = JSON.parse(xhttp.responseText);

               if (result.success) {
                   document.getElementsByName("posttextarea")[0].value = "";
                   updateWall();
                   return true;
               } else {
                   alert(result.message);
                   return false;
            }
        }
    };
    xhttp.open("POST",'/post-message', true);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.setRequestHeader("Authorization", localStorage.getItem("token"));
    xhttp.send(JSON.stringify(postMessage));
    }





MESSAGES
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(xhttp.responseText);

            if (result.success) {
                for (var i = 0; i<result.data.length; ++i) {
                    if (i === 0)
                        document.getElementById("messages").innerHTML = "<div>From: " + result.data[i].sender + " Message: " + result.data[i].message + "</div>";
                    else
                        document.getElementById("messages").innerHTML += "<div>From: "+ result.data[i].sender + " Message: " + result.data[i].message + "</div>";
                }
                return true;
            } else {
                document.getElementById("messages").innerHTML = result.message;
                return false;
            }
        }
    };
    xhttp.open("GET",'/get-user-messages-by-email/' + email, true);
    xhttp.setRequestHeader("Authorization", localStorage.getItem("token"));
    xhttp.send();
};




Login

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(xhttp.responseText);

            if (result.success) {
                localStorage.token = result.data;
                localStorage.email = loginData.email;
                displayView();
                return true;
            } else {
                document.getElementById("mess2").innerHTML = result.message;
                return false;
            }
        }
    };
    xhttp.open("POST",'/signin', true);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.send(JSON.stringify(loginData));
};



Signup


    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            added = JSON.parse(xhttp.responseText);

            if (added.success) {
                loginValidation(document.forms["signupform"]["email"].value, document.forms["signupform"]["password"].value);
                return true;
            } else {
                mess.innerHTML = added.message;
                return false;
            }
        }
    };
    xhttp.open("POST",'/signup', true);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.send(JSON.stringify(regData));


    PostFunctionAJAX("/signin", localStorage.getItem("token"), "Content-Type", "application/json", loginData, function() {
            if (this.success) {
                localStorage.token = this.data;
                localStorage.email = loginData.email;
                displayView();
                return true;
            } else {
                document.getElementById("mess2").innerHTML = this.message;
                return false;
            }
        });
