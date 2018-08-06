$(document).ready(function () {
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

    // Global Variables for Firebase usage
    var database = firebase.database();

    var playerList = database.ref("/players");

    var connectionsRef = database.ref("/connections");

    var connectedRef = database.ref(".info/connected");

    var turnComplete = database.ref("/turn");

    var chatLog = database.ref("/chat");


    // Global variables
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

    var player1choice = "";
    var player2choice = "";

    var player1Key = 0;
    var player2Key = 0;

    var localplayer1Status = null;

    var localplayer2Status = null;

    var gameInPlay = "no";

    var lastKey = "";

    var lastText = "";


    // ================== START UP ==================
    $("#userName").text(defaultUserName);

    $("#instructions-text").text("Please enter your name.");

    // Disables the claim buttons on page load
    $("#claim-player1").prop("disabled", true);
    $("#claim-player2").prop("disabled", true);

    var intervalID = window.setInterval(function () {
        $("#playername-input").toggleClass("active");
    }, 1000);


    // ================== FIREBASE LISTENERS  ==================

    // When the client's connection state changes...
    // Re-using code from coderbay-viewtracker in-class activity
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
    // Re-using code from coderbay-viewtracker in-class activity
    connectionsRef.on("value", function (snap) {
        // Display the viewer count in the html.
        // The number of online users is the number of children in the connections list.
        userCount = snap.numChildren();

        $("#connected-viewers").text(snap.numChildren());
    });

    // Listens for changes to player db in Firebase
    playerList.on("value", function (snapshot) {
        // The number of online users is the number of children in the connections list.
        var playerCount = snapshot.numChildren();

        // Increments total user key list by 1 so that there is no overlapping when multiple 
        // users join in and add their username to the firebase db
        userKeyList = playerCount + 1;

        // Instead of using iteration loops, Firebase has a forEach function to traverse through each child element in the database
        snapshot.forEach(function (childSnapshot) {
            // childData will be the actual contents of the child
            // in this case, all the player values
            var childData = childSnapshot.val();

            // If found player1 in firebase db under players section
            if (childData.playerslot === "player1") {
                player1Key = childSnapshot.key;
                player1 = childData;

                // Checks if the user playing is not player 1 (case when the user is player2)
                // if true, sets global variable player 1 with all the information found in firebase db for player1
                // then updates display with text of player1's name on the board then shows p1 scoreboard
                // also hides the claim button to set yourself as player 1
                if (localplayer1Status != "taken") {
                    player1name = childData.player;
                    $("#player1-side-text").text(player1name);
                    $("#claim-player1").addClass("hideThis");
                }

                $("#player1-scorecard").text("W: " + player1.wins + " | L: " + player1.losses + " | T: " + player1.ties);
            }

            // If found player2 in firebase db under players section
            if (childData.playerslot === "player2") {
                player2Key = childSnapshot.key;
                player2 = childData;


                // Checks if the user playing is not player 2 (case when the user is player1)
                // if true, sets global variable player 2 with all the information found in firebase db for player2
                // then updates display with text of player2's name on the board then shows p2 scoreboard
                // also hides the claim button to set yourself as player 2
                if (localplayer2Status != "taken") {
                    player2name = childData.player;
                    $("#player2-side-text").text(player2name);
                    $("#claim-player2").addClass("hideThis");
                }

                $("#player2-scorecard").text("W: " + player2.wins + " | L: " + player2.losses + " | T: " + player2.ties);
            }
        })

        // This condition checks when both player 1 and player 2 slots are found in the firebase DB
        // This condition only runs when the page first loads
        // After both players are in and start playing, the rounds keep going until a player disconnects
        // either by closing the browser or refreshing the page which forces the game to restart for everyone
        if (player1 && player2) {

            if (gameInPlay === "no") {

                $("#instructions-text").text("Time to play the game! Pick between rock/paper/scissors.");

                setUpRPSpanels();

                gameInPlay = "yes";
            }
        }

    });


    // Listener for Firebase DB whenever a player gets removed from the player list
    // Once a disconnect happens, this will restart the game as if the user refreshed/first loaded the page
    // So everyone has to re-enter a name again and pick which player side they want to be on
    playerList.on("child_removed", function (snapshot) {
        console.log("");
        console.log("Someone d/c'd");

        var test = snapshot.val();
        var disconnectedPlayerName = test.player;
        var disconnectedPlayerSlot = test.playerslot;

        console.log("test:  ");
        console.log(test);
        console.log("disconnectedPlayerName:   " + disconnectedPlayerName);
        console.log("disconnectedPlayerSlot:   " + disconnectedPlayerSlot);

        console.log("snapshot key:   " + snapshot.key);

        var msg = disconnectedPlayerName + " has disconnected!";

        console.log("msg: " + msg);

        console.log("player1 object:  ");
        console.log(player1);
        console.log("player2 object:  ");
        console.log(player2);
        console.log("player1.player:  " + player1.player);
        console.log("player2.player:  " + player2.player);


        if (disconnectedPlayerName === player2.player) {
            console.log("(disconnectedPlayerName === player2.player) = " + (disconnectedPlayerName === player2.player));
            // resets if user is player 1 and player 2 d/c's
            if (localplayer1Status === "taken") {
                console.log("localplayer1status:  " + localplayer1Status);
                console.log("resets if user is player 1 and player 2 d/c's");

                if (disconnectedPlayerSlot === "player2")
                    player2 = null;

                $("#instructions-text").text("Player 2 has disconnected, restarting game in 5 seconds..");

                setTimeout(() => {
                    newGame()
                }, 5000);
            }
        }

        if (disconnectedPlayerName === player1.player) {
            console.log("disconnectedPlayerName === player1.player = " + disconnectedPlayerName === player1.player);
            // resets if user is player 2 and player 1 d/c's
            if (localplayer2Status === "taken") {
                console.log("localplayer2status:  " + localplayer2Status);
                console.log("resets if user is player 2 and player 1 d/c's");

                if (disconnectedPlayerSlot === "player1")
                    player1 = null;

                setTimeout(() => {
                    newGame()
                }, 5000);

                $("#instructions-text").text("Player 1 has disconnected, restarting game in 5 seconds..");
            }
        }


        chatLog.push({
            name: "System",
            text: msg
        });

    });

    // Once the game is underway, this Firebase DB listener checks for changes to playerturn fields
    // This listener will update the game screen in real time to show if a player has made a move ahead of 
    // the other player then displays that info in HTML for the other player
    // It also watches for when both players turn are complete to call the decision() function to 
    // decide who won the round
    turnComplete.on("value", function (snapshot) {

        var player1turn = snapshot.child("player1").val();
        var player2turn = snapshot.child("player2").val();


        if ((localplayer1Status === "taken") && (player2turn === "done"))
            $("#player2-info-text").text("Player 2 has made a move.");

        if ((localplayer2Status === "taken") && (player1turn === "done"))
            $("#player1-info-text").text("Player 1 has made a move.");

        // Both players finished picking their choices, calling decision function
        if ((player1turn === "done") && (player2turn === "done")) {
            decision();
        }

    });

    // Listener for whenever sends a text that gets pushed to the firebase database based on a new child added to chat key
    chatLog.on('child_added', function (snapshot) {
        var message = snapshot.val();

        // variable used to construct the table row containing the user's name + their text
        var text = "<tr>" + "<td>" + message.name + ": </td>" + "<td>" + message.text + "</td>" + "</tr>";

        $("#chatLog tr:last").after(text);

        // jquery method to animate chat log expanding
        // scrollTop value is set to the value of the height of scrollDiv's div window (which is set to 300px in style.css)
        $("#scrollDiv").animate({
            scrollTop: $('#scrollDiv')[0].scrollHeight
        }, 0);

    });


    // ================== Button Event Listeners ==================

    $("#add-player").on("click", function (event) {

        // Don't refresh the page!
        event.preventDefault();

        clearInterval(intervalID);
        $("#playername-input").removeClass("active");

        intervalID = window.setInterval(function () {
            $("#claim-player1").toggleClass("active");
            $("#claim-player2").toggleClass("active");
        }, 1000);

        var chatMSG = "";

        userInputtedName = $("#playername-input").val().trim();

        // Condition check if the user entered a blank name or a valid name
        if (userInputtedName !== "") {

            userCurrentKey = userKeyList;

            $("#userName").text(userInputtedName);

            // Pushes the object below into firebase db under the user's current key
            database.ref("/players/" + userCurrentKey).set({
                player: userInputtedName,
                wins: playerWins,
                losses: playerLosses,
                ties: playerTies,
                playerslot: "none",
                choice: ""
            });

            // removes the user from the firebase database if they disconnect (usually refreshing the page or closing the browser)
            database.ref("/players/" + userCurrentKey).onDisconnect().remove();

            // increments global userkeylist to make sure no user will have the same user key
            userKeyList++;

            $("#instructions-text").text("Now select which player you want to be.");

            // enables the buttons for user to select which player slot 
            $("#claim-player1").prop("disabled", false);
            $("#claim-player2").prop("disabled", false);

            // disables entering another player name
            $("#playername-input").prop("disabled", true);
            $("#add-player").prop("disabled", true);

            // enables chat box once user gives a player name
            $("#chatText").prop("disabled", false);
            $("#sendChat").prop("disabled", false);

            // text created to indicate a player has joined the chat
            // only happens if the user enters a name and hits the submit button
            chatMSG = userInputtedName + " has joined!";

            // Marks the name as System (as in system event) and the join text msg to text
            chatLog.push({
                name: "System",
                text: chatMSG
            });

        } else if (userInputtedName === "") {
            $("#instructions-text").text("Do not enter a blank name. Please enter your name");
        }
    });

    // Claim Player function, after the user types their name in, there is two buttons to click to select to be either player 1 or player 2
    $(".claim-player").on("click", function (event) {
        var whichPlayer = $(this).attr("id");

        clearInterval(intervalID);
        $("#claim-player1").removeClass("active");
        $("#claim-player2").removeClass("active");

        // sets the localplayer variable to "taken" for either player 1 or 2 depending on which side the player wants to be on
        // also pushes that data to the firebase database
        if (whichPlayer === "claim-player1") {

            localplayer1Status = "taken";

            player1 = {
                player: userInputtedName,
                wins: playerWins,
                losses: playerLosses,
                ties: playerTies,
                playerslot: "player1",
                choice: ""
            }

            $("#player1-side-text").text("Welcome " + userInputtedName);
            $("#claim-player1").addClass("hideThis");
            $("#claim-player1").prop("disabled", true);
            $("#claim-player2").prop("disabled", true);
            $("#player1-scorecard").text("W: " + playerWins + " | L: " + playerLosses + " | T: " + playerTies);

            database.ref("/players/" + userCurrentKey).update({
                playerslot: "player1"
            });
        }
        else if (whichPlayer === "claim-player2") {

            localplayer2Status = "taken";

            player2 = {
                player: userInputtedName,
                wins: playerWins,
                losses: playerLosses,
                ties: playerTies,
                playerslot: "player2",
                choice: ""
            }

            $("#player2-side-text").text("Welcome, " + userInputtedName);
            $("#claim-player2").addClass("hideThis");
            $("#claim-player1").prop("disabled", true);
            $("#claim-player2").prop("disabled", true);
            $("#player2-scorecard").text("W: " + playerWins + " | L: " + playerLosses + " | T: " + playerTies);

            database.ref("/players/" + userCurrentKey).update({
                playerslot: "player2"
            });
        }

    });

    // Button listener for when the game has started and the rock-paper-scissors-buttons have been enabled for user
    // to click on
    // Will update the HTML to show the icon of which choice they picked
    $(".rps-buttons").on("click", function (event) {
        var whichRPSButton = $(this).attr("id");

        if (localplayer1Status === "taken") {
            switch (whichRPSButton) {
                case "p1-rock-button":
                    player1choice = "rock";
                    $("#p1-rps-img").html("<i class='far fa-hand-rock fa-5x'></i>");
                    break;
                case "p1-paper-button":
                    player1choice = "paper";
                    $("#p1-rps-img").html("<i class='far fa-hand-paper fa-5x'></i>");
                    break;
                case "p1-scissors-button":
                    player1choice = "scissors";
                    $("#p1-rps-img").html("<i class='far fa-hand-scissors fa-5x fa-flip-horizontal'></i>");
                    break;
            }

            // Hides those buttons after the user has made their choice
            $("#player1-info-text").text("You picked " + player1choice + "!");
            $("#p1-rock-button").addClass("hideThis");
            $("#p1-paper-button").addClass("hideThis");
            $("#p1-scissors-button").addClass("hideThis");

            // Pushes the user's choice to firebase database
            database.ref("/players/" + userCurrentKey).update({
                choice: player1choice
            });

            // Pushes to firebase that the user has completed their turn
            turnComplete.update({
                player1: "done"
            });
        }

        if (localplayer2Status === "taken") {
            switch (whichRPSButton) {
                case "p2-rock-button":
                    player2choice = "rock";
                    $("#p2-rps-img").html("<i class='far fa-hand-rock fa-5x fa-flip-horizontal'></i>");
                    break;
                case "p2-paper-button":
                    $("#p2-rps-img").html("<i class='far fa-hand-paper fa-5x fa-flip-horizontal'></i>");
                    player2choice = "paper";
                    break;
                case "p2-scissors-button":
                    $("#p2-rps-img").html("<i class='far fa-hand-scissors fa-5x'></i>");
                    player2choice = "scissors";
                    break;
            }

            // Hides those buttons after the user has made their choices
            $("#player2-info-text").text("You picked " + player2choice + "!");
            $("#p2-rock-button").addClass("hideThis");
            $("#p2-paper-button").addClass("hideThis");
            $("#p2-scissors-button").addClass("hideThis");

            // Pushes the user's choice to firebase database
            database.ref("/players/" + userCurrentKey).update({
                choice: player2choice
            });

            // Pushes to firebase that the user has completed their turn
            turnComplete.update({
                player2: "done"
            });
        }
    });

    // Button listener for the send chat button
    $("#sendChat").on('click', function (event) {
        // prevents page from refreshing
        event.preventDefault();

        var text = $("#chatText").val();

        // if there's any text that exists, pushes that text to the firebase database
        if (text) {
            chatLog.push({
                name: userInputtedName,
                text: text
            });

            // clears the input field after the text has been sent
            $("#chatText").val("");
        }
    });




    // ================== FUNCTIONS ==================

    // This function is used to set up the game board with the rock-paper-scissors buttons enabled
    // and updating instructions text
    function setUpRPSpanels() {

        if ((localplayer1Status === "taken") || (localplayer2Status === "taken")) {

            if (localplayer1Status === "taken") {
                $("#p1-rock-button").removeClass("hideThis");
                $("#p1-paper-button").removeClass("hideThis");
                $("#p1-scissors-button").removeClass("hideThis");
                $("#player1-info-text").text("Make a choice!");
                $("#player2-info-text").text("Player 2 hasn't made a move.");
            }

            if (localplayer2Status === "taken") {
                $("#p2-rock-button").removeClass("hideThis");
                $("#p2-paper-button").removeClass("hideThis");
                $("#p2-scissors-button").removeClass("hideThis");
                $("#player2-info-text").text("Make a choice!");
                $("#player1-info-text").text("Player 1 hasn't made a move.");
            }

        }

        $("#instructions-text").text("Make a choice between rock-paper-scissors.");

        turnComplete.set({
            player1: null,
            player2: null
        });
    }


    // This function determins who won the round between player 1 and player 2 based on their choices
    function decision() {
        var versusIMG = $("<img>");

        versusIMG.attr({ src: "./assets/images/vs.png", height: "200", align: "middle" });

        // Used to add the VS graphic in the middle of the center div
        $("#versus").append(versusIMG);

        // Show Player 1's choice in the middle div for everyone to see
        switch (player1.choice) {
            case "rock":
                player1choice = "rock";
                $("#show-p1-results").html("<i class='far fa-hand-rock fa-5x' style='color:white'></i>");
                break;
            case "paper":
                player1choice = "paper";
                $("#show-p1-results").html("<i class='far fa-hand-paper fa-5x' style='color:white'></i>");
                break;
            case "scissors":
                player1choice = "scissors";
                $("#show-p1-results").html("<i class='far fa-hand-scissors fa-5x fa-flip-horizontal' style='color:white'></i>");
                break;
        }

        // Show Player 2's choice in the middle div for everyone to see
        switch (player2.choice) {
            case "rock":
                player2choice = "rock";
                $("#show-p2-results").html("<i class='far fa-hand-rock fa-5x fa-flip-horizontal' style='color:white'></i>");
                break;
            case "paper":
                player1choice = "paper";
                $("#show-p2-results").html("<i class='far fa-hand-paper fa-5x fa-flip-horizontal' style='color:white'></i>");
                break;
            case "scissors":
                player1choice = "scissors";
                $("#show-p2-results").html("<i class='far fa-hand-scissors fa-5x' style='color:white'></i>");
                break;
        }

        // The actual comparison is done here with 3 If statements
        // Updates center text with what happened (what the players pick and the outcome)
        if (player1.choice === "rock") {
            switch (player2.choice) {
                case "rock":
                    $("#rps-conclusion").text("ROCK versus ROCK. No winner, it's a TIE!");

                    database.ref("/players/" + player1Key).update({
                        ties: player1.ties + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        ties: player2.ties + 1
                    });

                    break;
                case "paper":
                    $("#rps-conclusion").text("Player 1's rock gets covered by Player 2's paper. Player 2 WINS!");

                    database.ref("/players/" + player1Key).update({
                        losses: player1.losses + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        wins: player2.wins + 1
                    });

                    break;
                case "scissors":
                    $("#rps-conclusion").text("Player 1's rock crushes Player 2's paper. Player 1 WINS!");

                    database.ref("/players/" + player1Key).update({
                        wins: player1.wins + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        losses: player2.losses + 1
                    });

                    break;
            }
        }

        if (player1.choice === "paper") {
            switch (player2.choice) {
                case "rock":
                    $("#rps-conclusion").text("Player 1's paper covers Player 2's rock. Player 1 WINS!");

                    database.ref("/players/" + player1Key).update({
                        wins: player1.wins + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        losses: player2.losses + 1
                    });

                    break;
                case "paper":
                    $("#rps-conclusion").text("PAPER versus PAPER. No winner, it's a TIE!");

                    database.ref("/players/" + player1Key).update({
                        ties: player1.ties + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        ties: player2.ties + 1
                    });

                    break;
                case "scissors":
                    $("#rps-conclusion").text("Player 1's paper gets cut by Player 2's scissors. Player 2 WINS!");

                    database.ref("/players/" + player1Key).update({
                        losses: player1.losses + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        wins: player2.wins + 1
                    });

                    break;
            }
        }

        if (player1.choice === "scissors") {
            switch (player2.choice) {
                case "rock":
                    $("#rps-conclusion").text("Player 1's scissors gets crushed by Player 2's rock. Player 2 WINS!");

                    database.ref("/players/" + player1Key).update({
                        losses: player1.losses + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        wins: player2.wins + 1
                    });

                    break;
                case "paper":
                    $("#rps-conclusion").text("Player 1's scissors cuts Player 2's paper. Player 1 WINS!");

                    database.ref("/players/" + player1Key).update({
                        wins: player1.wins + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        losses: player2.losses + 1
                    });

                    break;
                case "scissors":
                    $("#rps-conclusion").text("SCISSORS versus SCISSORS. No winner, it's a TIE!");

                    database.ref("/players/" + player1Key).update({
                        ties: player1.ties + 1
                    });

                    database.ref("/players/" + player2Key).update({
                        ties: player2.ties + 1
                    });

                    break;
            }
        }

        // delays resetting the board by 10 seconds to allow everyone time to see the outcome of the round
        setTimeout(() => {
            resetboard()
        }, 10000);
    }

    // Used between rounds to reset the text on the board then calls setUpRPSPanels() function to set up the board there
    function resetboard() {
        $("#rps-conclusion").text("");

        $("#show-p1-results").html("");
        $("#show-p2-results").html("");

        $("#p1-rps-img").html("");
        $("#p2-rps-img").html("");

        $("#versus").html("");

        setUpRPSpanels();
    }

    // This function is only called when a user has disconnected
    // It resets all global values and the HTML displayed back to original state as if the user first loaded the page
    function newGame() {
        player1 = null;
        player2 = null;

        userCount = 0;

        defaultUserName = "Player";

        userKeyList = 0;

        userCurrentKey = 0;

        userInputtedName = "";

        playerWins = 0;

        playerLosses = 0;

        playerTies = 0;

        player1name = "";
        player2name = "";

        player1choice = "";
        player2choice = "";

        player1Key = 0;
        player2Key = 0;

        localplayer1Status = null;

        localplayer2Status = null;

        gameInPlay = "no";


        $("#userName").text(defaultUserName);

        $("#instructions-text").text("Please enter your name.");

        // Removes the class hideThis, making the claim buttons viewable
        $("#claim-player1").removeClass("hideThis");
        $("#claim-player2").removeClass("hideThis");

        // Disables the claim buttons as per the norm until the user types in their name
        $("#claim-player1").prop("disabled", true);
        $("#claim-player2").prop("disabled", true);

        $("#player1-side-text").text("Waiting for Player One");
        $("#player2-side-text").text("Waiting for Player Two");

        // Hides the rock-paper-scissors buttons on Player 1's and 2's side
        $("#p1-rock-button").addClass("hideThis");
        $("#p1-paper-button").addClass("hideThis");
        $("#p1-scissors-button").addClass("hideThis");

        $("#p2-rock-button").addClass("hideThis");
        $("#p2-paper-button").addClass("hideThis");
        $("#p2-scissors-button").addClass("hideThis");

        // enables typing the player's name in the input field
        $("#playername-input").prop("disabled", false);

        // disables chat box
        $("#chatText").prop("disabled", true);
        $("#sendChat").prop("disabled", true);

        // enables submit button for name submission
        $("#add-player").prop("disabled", false);
        $("#playername-input").val("");

        $("#player1-scorecard").text("");
        $("#player2-scorecard").text("");

        $("#player1-info-text").text("");
        $("#player2-info-text").text("");

        playerList.remove();


    }
});
