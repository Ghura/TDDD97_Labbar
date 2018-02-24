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