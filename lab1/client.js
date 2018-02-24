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

    var result = serverstub.changePassword(token, oldPassword, newPassword);
    newpassmess.innerHTML = result.message;

};

// Sign up for life //
signupValidation = function () {
    var password = document.getElementById("password").value;
    var repeatpw = document.getElementById("repeatpw").value;

    if (password.length < 4) {              // "guard block"
        return false;
    }
    if (password != repeatpw) {            // "guard block"
        return false;
    }

    var regdata = {
        email: document.forms["signupform"]["email"].value,
        password: document.forms["signupform"]["password"].value,
        firstname: document.forms["signupform"]["firstname"].value,
        familyname: document.forms["signupform"]["familyname"].value,
        gender: document.forms["signupform"]["gender"].value,
        city: document.forms["signupform"]["city"].value,
        country: document.forms["signupform"]["country"].value
    };

    var mess = document.getElementById("mess");
    var added = serverstub.signUp(regdata);

    if (added.success) {
        var result = serverstub.signIn(document.forms["signupform"]["email"].value, document.forms["signupform"]["password"].value);
        localStorage.token = result.data;
        displayView();
        return true;
    } else {                                // Om användaren redan finns hämtas felmeddelande
        mess.innerHTML = added.message;
        return false;
    }
};

// Logga in. Visar felmeddelande om användare/lösenord är fel, annars får man en token tilldelad, kör en dispview => profileview
loginValidation = function () {
    var mess2 = document.getElementById("mess2");
    var result = serverstub.signIn(document.forms["loginform"]["loginemail"].value, document.forms["loginform"]["loginpassword"].value);

    if (result.success) {
        localStorage.token = result.data;
        displayView();
        return true;
    } else {
        mess2.innerHTML = result.message;
        return false;
    }
};

// Logga ut från profileview
signOut = function () {
    localStorage.removeItem("token");
    displayView();
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


// Home-tab
// Visa userinfo
userInfo = function(email) {    // Om vi gör userInfo() så tilldelar vi email till vår lokala/inloggade mail, så att funktionen kan användas både till att visa info om sig själv och om andra
    if (email == null) {
        email = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
    }

    var userinfo = serverstub.getUserDataByEmail(localStorage.getItem("token"), email).data;

    document.getElementById("loggedinname").innerHTML = userinfo.firstname;
    document.getElementById("loggedinfamilyname").innerHTML = userinfo.familyname;
    document.getElementById("loggedingender").innerHTML = userinfo.gender;
    document.getElementById("loggedincity").innerHTML = userinfo.city;
    document.getElementById("loggedincountry").innerHTML = userinfo.country;
    document.getElementById("loggedinemail").innerHTML = userinfo.email;
};

postToWall = function() {
    var recipient;
    var text = document.getElementsByName("posttextarea");
    var result;

    // The getElementsByName() method returns a collection of all elements in the document with the specified name (the value of the name attribute), as a NodeList object.
    // The NodeList object represents a collection of nodes. The nodes can be accessed by index numbers. The index starts at 0.

   if (tabbis === "Browse") {       // Om vi är inne på Browsetaben så vill vi använda "den andra varianten/innehållet" i "posttextarea" = 1
        recipient = document.getElementById("searchemail").value;
        text = text[1].value;
        result = serverstub.postMessage(localStorage.getItem("token"), text, recipient);

        document.getElementsByName("posttextarea")[1].value = "";
        searchForUser();

        return result.success;

    } else {
        recipient = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
        text = text[0].value;
        result = serverstub.postMessage(localStorage.getItem("token"), text, recipient);

        document.getElementsByName("posttextarea")[0].value = "";
        updateWall();

        return result.success;
    }
};


updateWall = function(email) {
    if (email == null) {
        email = serverstub.getUserDataByToken(localStorage.getItem("token")).data.email;
    }

    var messages = serverstub.getUserMessagesByEmail(localStorage.getItem("token"), email).data;

    if (messages.length === 0) {                // "guard block"
        document.getElementById("messages").innerHTML = "This wall is empty! Post the first message!";
    return false;
    }

    for (var i = 0; i<messages.length; ++i) {
        if (i === 0)                              // Om vi inte har denna så "dubbleras" messages för varje gång vi skriver ett nytt meddelande.
            document.getElementById("messages").innerHTML = "<div>From: " + messages[i].writer + " Message: " + messages[i].content + "</div>";                 // här kan vi använda .sender och .message (som vi använde i servern)
        else
            document.getElementById("messages").innerHTML += "<div>From: "+ messages[i].writer + " Message: " + messages[i].content + "</div>"; // += adderar till messages (från typ sista FÖ)
    }
};


searchForUser = function() {
    var email = document.getElementById("searchemail").value;
    var result = serverstub.getUserDataByEmail(localStorage.getItem("token"), email);

    if (email === serverstub.getUserDataByToken(localStorage.getItem("token")).data.email) {        // "guard block"
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