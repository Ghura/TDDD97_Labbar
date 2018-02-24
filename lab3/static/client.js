var tabbis;         // en global variabel så att vi kan använda den senare med att posta till en wall ("Browse").

// Välja vilken sida som ska visas beroende på inloggad eller ej.
displayView = function () {
    if (localStorage.getItem("token")) {
        document.getElementById("content").innerHTML = document.getElementById("profileview").innerHTML;
        document.getElementById("defaultOpen").click();
    } else {
        document.getElementById("content").innerHTML = document.getElementById("welcomeview").innerHTML;
    }
};

window.onload = function () {
    displayView();
};

// Validation: Kolla lösenord och repeatpw (behövs inte egentligen, men det ger snygyga "onkeyup" för användaren)...
checkpassword = function () {
    var password = document.getElementById("password").value;
    var mess = document.getElementById("mess");

    if (password.length < 4) {
        mess.innerHTML = "Password is too short.";
    } else {
        mess.innerHTML = "";
    }
};

checkpassword2 = function () {
    var password = document.getElementById("password").value;
    var repeatpw = document.getElementById("repeatpw").value;
    var mess = document.getElementById("mess");

    if (password.length < 4) {
        mess.innerHTML = "Password is too short.";
    }
    if (password != repeatpw) {
        mess.innerHTML = "Passwords does not match.";
    } else {
        mess.innerHTML = "";
    }
};

// Byta password och grejer
checknewpassword = function() {
    var newpassword = document.getElementById("newpassword").value;
    var newpassmess = document.getElementById("newpassmess");

    if (newpassword.length < 4) {
        newpassmess.innerHTML = "New password is too short.";
    } else {
        newpassmess.innerHTML = "";
    }
};

checknewpassword2 = function() {
    var newpassword = document.getElementById("newpassword").value;
    var repeatnewpassword = document.getElementById("repeatnewpassword").value;
    var newpassmess = document.getElementById("newpassmess");

    if (newpassword.length < 4) {
        newpassmess.innerHTML = "New password is too short.";
    }
    if (newpassword != repeatnewpassword) {
        newpassmess.innerHTML = "New passwords does not match.";
    } else {
        newpassmess.innerHTML = "";
    }
};

changePassword = function(){
    var token = localStorage.getItem("token");
    var oldPassword = document.getElementById("oldpassword").value;
    var newPassword = document.getElementById("newpassword").value;
    var repeatnewpassword = document.getElementById("repeatnewpassword").value;
    var newpassmess = document.getElementById("newpassmess");

    if (newPassword.length < 4) {                // "guard block"
        newpassmess.innerHTML = "New password is too short.";
        return false;
    }
    if (newPassword != repeatnewpassword) {    // "guard block"
        newpassmess.innerHTML = "New passwords does not match.";
        return false;
    }

    var changepass = {
        "old_password" : document.getElementById("oldpassword").value,
        "new_password" : document.getElementById("newpassword").value
    };

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(xhttp.responseText);
            if (result == true) {
                newpassmess.innerHTML = result.message;
            } else {
                newpassmess.innerHTML = result.message;
            }
        }
    };
    xhttp.open("POST",'/changepassword',true);
    xhttp.setRequestHeader("Authorization", token);
    xhttp.setRequestHeader("Content-Type","application/json");
    xhttp.send(JSON.stringify(changepass));
};

// Sign up for life //
signupValidation = function () {
    var password = document.getElementById("password").value;
    var repeatpw = document.getElementById("repeatpw").value;
    var mess = document.getElementById("mess");

    if (password.length < 4) {              // "guard block"
        return false;
    }
    if (password != repeatpw) {            // "guard block"
        return false;
    }

    var regData = {
        "email": document.forms["signupform"]["email"].value,
        "password": document.forms["signupform"]["password"].value,
        "firstname": document.forms["signupform"]["firstname"].value,
        "familyname": document.forms["signupform"]["familyname"].value,
        "gender": document.forms["signupform"]["gender"].value,
        "city": document.forms["signupform"]["city"].value,
        "country": document.forms["signupform"]["country"].value
    };

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
};

// Logga in. Visar felmeddelande om användare/lösenord är fel, annars får man en token tilldelad, kör en dispview => profileview
loginValidation = function (email, password) {

    if (email == null || password == null) {
        var loginData = {
            "email" : document.forms["loginform"]["loginemail"].value,
            "password" : document.forms["loginform"]["loginpassword"].value
        };
    } else {
        var loginData = {
            "email" : email,
            "password" : password
        };
    }

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(xhttp.responseText);

            if (result.success) {
                localStorage.token = result.data;
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


// Logga ut från profileview                DO YOU NEED XMLHttpRequest FOR THIS????? Ja, måste ju ta bort token från table
signOut = function () {
    token = localStorage.getItem("token");
    // localStorage.removeItem("token");

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(xhttp.responseText);
            if (result.success) {
                localStorage.removeItem("token");
                displayView();
                return true;
            } else {
                alert(result.message);
                return false;
            }
        }
    };
    xhttp.open("POST",'/signout', true);
    xhttp.setRequestHeader("Authorization", token);
    xhttp.send();
};

// Tabs och grejs
function openTab(evt, tabName) {                        // evt = eventet, som är ett är ett klick
    // De variabler som används
    var i, tabcontent, tablinks;

    // Vi tar alla element som har classen tabcontent, alltså allt innehåll för Home, Browse och Account, och gömmer detta
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Sedann tar vi alla element som har classen tablink, alltså de olika tabsen och tar bort den aktiva statusen för alla tabs.
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Beroende på vilken vi vi har klickat på så får den taben en active-status, samtidigt som innehållet för denna tab visas.
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    tabbis = tabName;

   if (tabName === "Home") {
        userInfo();
        updateWall();
    }
}

var getEmailByToken = function(token, callback) {
     var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                callback.call(JSON.parse(xhttp.responseText));
        }
    };
        xhttp.open("GET",'/get-user-data-by-token/', true);
        xhttp.setRequestHeader("Authorization", token);
        xhttp.send();
};



// Home-tab
// Visa userinfo
userInfo = function(email) {    // Om vi gör userInfo() så tilldelar vi email till vår lokala/inloggade mail, så att funktionen kan användas både till att visa info om sig själv och om andra
    var token = localStorage.getItem("token");

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
};

postToWall = function() {
    var text = document.getElementsByName("posttextarea");
    var result;

    // The getElementsByName() method returns a collection of all elements in the document with the specified name (the value of the name attribute), as a NodeList object.
    // The NodeList object represents a collection of nodes. The nodes can be accessed by index numbers. The index starts at 0.

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
};


updateWall = function(email) {

    email = "linus@tjena.se";

    if (email == null) {
        email = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
    }

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


searchForUser = function() {
    var email = document.getElementById("searchemail").value;
    var result = serverstub.getUserDataByEmail(localStorage.getItem("token"), email);

    if (email == serverstub.getUserDataByToken(localStorage.getItem("token")).data.email) {        // "guard block"
         document.getElementById("searchusermess").innerHTML = "You can't search for yourself, go to your Homeview instead!";
         document.getElementById("searcheduserpage").innerHTML = "";
         return false;
    }

    if (result.success) {
        userInfo(email);
        updateWall(email);
        document.getElementById("searchusermess").innerHTML = "";
        document.getElementById("searcheduserpage").innerHTML = document.getElementById("Home").innerHTML;

    }  else {
        document.getElementById("searchusermess").innerHTML = result.message;
        document.getElementById("searcheduserpage").innerHTML = "";
    }
};

















