$(document).ready(function () {
  console.log("ready!");

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyB0RyNjY9rlD93xyk1VK3bIYisAQOZPr6I",
    authDomain: "myrpsproject.firebaseapp.com",
    databaseURL: "https://myrpsproject.firebaseio.com",
    projectId: "myrpsproject",
    storageBucket: "myrpsproject.appspot.com",
    messagingSenderId: "811242828966"
  };

  firebase.initializeApp(config);

  var database = firebase.database();

  var userStatus = "notplaying";

  var defaultUserName = "Player";

  var userKeyList = 1;

  var userInputtedName = "";

  var playerWins = 0;

  var playerLosses = 0;

  var player1Status = "empty";
  
  var player2Status = "empty";


  $("#userName").text(defaultUserName);

  $("#instructions-text").text("Please enter your name.");

  var connectionsRef = database.ref("/connections");

  var connectedRef = database.ref(".info/connected");

  // When the client's connection state changes...
  connectedRef.on("value", function (snap) {

    // If they are connected..
    if (snap.val()) {

      // Add user to the connections list.
      var con = connectionsRef.push(true);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });

  // When first loaded or when the connections list changes...
  connectionsRef.on("value", function (snap) {

    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#connected-viewers").text(snap.numChildren());
  });


  $("#add-player").on("click", function (event) {
    console.log("button clicked");

    // Don't refresh the page!
    event.preventDefault();

    // YOUR TASK!!!
    // Code in the logic for storing and retrieving the most recent user.
    // Don't forget to provide initial data to your Firebase database.
    userInputtedName = $("#playername-input").val().trim();

    console.log(userInputtedName);
    console.log(playerWins);
    console.log(playerLosses);


    $("#userName").text(userInputtedName);

    database.ref("/players/" + userKeyList).push({
      player: userInputtedName,
      wins: playerWins,
      loses: playerLosses,
    });

    userKeyList++;
    console.log(userKeyList);

    $("#instructions-text").text("Now select which player you want to be.");

    $("#claim-player1").prop("disabled",false);
    $("#claim-player2").prop("disabled",false);

    $("#player-name").addClass("hideThis");

    // enables chat box once user gives a player name
    $("#chatText").prop("disabled", false);
    $("#sendChat").prop("disabled", false);

  });

  $(".claim-player").on("click", function (event) {
    var whichPlayer = $(this).attr("id");

    console.log(whichPlayer);

    if (whichPlayer === "claim-player1") {

      console.log("user clicked to claim player 1 slot");

      player1Status = "taken";

      $("#claim-player1").prop("disabled",true);
      $("#claim-player2").prop("disabled",true);

    }
    else if (whichPlayer === "claim-player2") {

      console.log("user clicked to claim player 2 slot");

      player2Status = "taken";

      $("#claim-player1").prop("disabled",true);
      $("#claim-player2").prop("disabled",true);
    }

  });

  // $("#claim-player2").on("click", function (event) {
  //   console.log("user click player 2 button");

  // });


  // Firebase watcher + initial loader HINT: .on("value")
  database.ref("/players/").on("value", function (snapshot) {
    console.log("Database updated");

    // Log everything that's coming out of snapshot
    console.log(snapshot.val());

    var newPlayerList = snapshot.val();

    console.log(newPlayerList);

    // Change the HTML to reflect
    // $("#name-display").text(snapshot.val().name);
    // $("#email-display").text(snapshot.val().email);
    // $("#age-display").text(snapshot.val().age);
    // $("#comment-display").text(snapshot.val().comment);

    // Handle the errors
  }, function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

});