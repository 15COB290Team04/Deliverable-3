/*
 Loughborough University (February 2016)
 
 Timetabling Website
 Login script.js file (includes jQuery)
 Used for login page
 */

// Log in form JavaScript
function pwdc() {
  var password = document.log_in.password.value;
  var user = document.log_in.user.value;
  if ((password == "team12") && (user == "team12")) {
    location.href = 'booking.html';
    return true;
  }
  else if ((password == "admin") && (user == "admin")) {
    location.href = 'booking.html';
    return true;
  }
  else {
    alert("Incorrect Username or Password");
    return false;
  }
}