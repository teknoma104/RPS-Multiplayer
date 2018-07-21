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

    var playerList = database.ref("/players");

    var connectionsRef = database.ref("/connections");

    var connectedRef = database.ref(".info/connected");

    var playerSlots = database.ref("/player-slot-status");


    var player1 = null;
    var player2 = null;

    var userCount = 0;

    var defaultUserName = "Player";

    var userKeyList = 0;

    var userCurrentKey = 0;

    var userInputtedName = "";

    var playerWins = 0;

    var playerLosses = 0;

    var playerTies = 0;

    var player1name = "";
    var player2name = "";

    var localplayer1Status = "empty";
    var globalplayer1Status = "empty";

    var localplayer2Status = "empty";
    var globalplayer2Status = "empty";


    $("#userName").text(defaultUserName);

    $("#instructions-text").text("Please enter your name.");

    $("#claim-player1").prop("disabled", true);
    $("#claim-player2").prop("disabled", true);



    // When the client's connection state changes...
    connectedRef.on("value", function (snap) {
        console.log("added", snap.key);

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
        userCount = snap.numChildren();

        console.log("Number of people online: " + userCount);
        $("#connected-viewers").text(snap.numChildren());
    });

    playerList.on("value", function (snapshot) {
        // The number of online users is the number of children in the connections list.
        console.log("Counting # of players in FirebaseDB");
        var playerCount = snapshot.numChildren();
        console.log("playerCount:  " + playerCount);

        var playerDB = snapshot.val();

        console.log(playerDB);
        // console.log(playerDB[1].playerslot);

        // Increments total user keylist by 1 so that there is no overlapping when multiple 
        // users join in and add their username to the firebase db
        userKeyList = playerCount + 1;
        
        console.log("snapshot.length: " + snapshot.val().length);


        snapshot.forEach(function(childSnapshot) {
            // key will be "ada" the first time and "alan" the second time
            var key = childSnapshot.key;
            console.log("childSnapshot.key:  " + childSnapshot.key);

            // childData will be the actual contents of the child
            var childData = childSnapshot.val();
            
            console.log("childData:");
            console.log(childData);

            console.log("childSnapshot.player:      " + childData.player);
            console.log("childSnapshot.playerslot:  " + childData.playerslot);

            if (childData.playerslot === "player1") {
                console.log("(childData.playerslot === 'player1') = true");
                console.log("key[" + key + "]childData.playerslot: " + childData.playerslot);

                if (localplayer1Status != "taken") {
                    console.log("localplayer1Status != taken");
                    player1 = childData;

                    player1name = childData.player;
                    $("#player1-side").text(player1name);
                    $("#claim-player1").addClass("hideThis");
                }
            }

            if (childData.playerslot === "player2") {
                console.log("(childData.playerslot === 'player2') = true");
                console.log("key[" + key + "]childData.playerslot: " + childData.playerslot);

                if (localplayer2Status != "taken") {
                    console.log("localplayer2Status != taken");
                    player2 = childData;

                    player2name = childData.player;
                    $("#player2-side").text(player2name);
                    $("#claim-player2").addClass("hideThis");
                }
            }
        })

        if (player1 && player2) {
            console.log("BOTH PLAYERS ARE IN GAME");
            console.log(player1);
            console.log(player2);
        }

        console.log("Number of players in database: " + playerCount);
    });


    connectionsRef.on("child_added", function (snapshot) {
        console.log("new connection added", snapshot.key);
    });

    // playerSlots.on("value", function (snapshot) {
    //     if (snapshot.child("player1").exists() && !(snapshot.child("player2").exists())) {
            
    //         console.log("player1 present - player 2 is not present");

    //         globalplayer1Status = snapshot.val().player1;
    //         globalplayer2Status = "none";

    //         console.log("player1status: " + globalplayer1Status);
    //         console.log("player2status: " + globalplayer2Status);

    //     }

    //     if (!(snapshot.child("player1").exists()) && snapshot.child("player2").exists()) {
    //         // Set the variables for highBidder/highPrice equal to the stored values.
    //         console.log("player1 is not present - player 2 is present");

    //         globalplayer1Status = "none";
    //         globalplayer2Status = snapshot.val().player2;

    //         console.log("player1status: " + globalplayer1Status);
    //         console.log("player2status: " + globalplayer2Status);

    //     }

    //     if (snapshot.child("player1").exists() && snapshot.child("player2").exists()) {
    //         // Set the variables for highBidder/highPrice equal to the stored values.

    //         console.log("player1 status: " + snapshot.child("player1").val());
    //         console.log("player2 status: " + snapshot.child("player2").val());

    //         console.log("both players present - ready to start the game");
    //     }

    //     // if (player1Status != "none")

    // });

    $("#add-player").on("click", function (event) {
        console.log("button clicked");

        // Don't refresh the page!
        event.preventDefault();

        userInputtedName = $("#playername-input").val().trim();

        console.log(userInputtedName);
        console.log(playerWins);
        console.log(playerLosses);

        userCurrentKey = userKeyList;
        console.log("userCurrentKey: " + userCurrentKey);


        $("#userName").text(userInputtedName);

        database.ref("/players/" + userCurrentKey).set({
            player: userInputtedName,
            wins: playerWins,
            loses: playerLosses,
            ties: playerTies,
            playerslot: "none",
            choice: ""
        });

        // If this user disconnects by closing or refreshing the browser, remove the user from the database
        database.ref("/players/"+userCurrentKey).onDisconnect().remove();

        userKeyList++;
        console.log(userKeyList);

        $("#instructions-text").text("Now select which player you want to be.");

        // enables the buttons for user to select which player slot 
        $("#claim-player1").prop("disabled", false);
        $("#claim-player2").prop("disabled", false);

        // disables entering another playername
        $("#playername-input").prop("disabled", true);
        $("#add-player").prop("disabled", true);

        // enables chat box once user gives a player name
        $("#chatText").prop("disabled", false);
        $("#sendChat").prop("disabled", false);

    });

    $(".claim-player").on("click", function (event) {
        var whichPlayer = $(this).attr("id");

        console.log(whichPlayer);

        if (whichPlayer === "claim-player1") {

            console.log("user clicked to claim player 1 slot");

            localplayer1Status = "taken";

            database.ref("/players/" + userCurrentKey).update({
                playerslot: "player1"
            });

            player1 = { player: userInputtedName,
                wins: playerWins,
                loses: playerLosses,
                ties: playerTies,
                playerslot: localplayer1Status,
                choice: "" }

            $("#player1-side").text("Welcome " + userInputtedName);
            $("#claim-player1").addClass("hideThis");
            $("#claim-player1").prop("disabled", true);
            $("#claim-player2").prop("disabled", true);

            // database.ref("/player-slot-status/").set({
            //     player1: localplayer1Status
            // });

        }
        else if (whichPlayer === "claim-player2") {

            console.log("user clicked to claim player 2 slot");

            localplayer2Status = "taken";

            database.ref("/players/" + userCurrentKey).update({
                playerslot: "player2"
            });

            player2 = { player: userInputtedName,
                wins: playerWins,
                loses: playerLosses,
                ties: playerTies,
                playerslot: localplayer2Status,
                choice: "" }

            $("#player2-side").text("Welcome, " + userInputtedName);
            $("#claim-player2").addClass("hideThis");
            $("#claim-player1").prop("disabled", true);
            $("#claim-player2").prop("disabled", true);

            // database.ref("/player-slot-status/").set({
            //     player2: localplayer2Status
            // });
        }

    });


    // // Firebase watcher + initial loader HINT: .on("value")
    // database.ref("/players/").on("value", function (snapshot) {
    //     console.log("Database updated");

    //     // Log everything that's coming out of snapshot
    //     console.log(snapshot.val());

    //     var newPlayerList = snapshot.val();

    //     console.log(newPlayerList);

    //     // Change the HTML to reflect
    //     // $("#name-display").text(snapshot.val().name);
    //     // $("#email-display").text(snapshot.val().email);
    //     // $("#age-display").text(snapshot.val().age);
    //     // $("#comment-display").text(snapshot.val().comment);

    //     // Handle the errors
    // }, function (errorObject) {
    //     console.log("Errors handled: " + errorObject.code);
    // });

});