/*eslint-env browser*/
/*eslint "no-console": "off"*/
/*global $*/

$(document).ready(function () {
	loadMainPage();
	document.getElementById("google").addEventListener("click", logInGoogle);
	document.getElementById("facebook").addEventListener("click", logInFacebook);
	document.getElementById("loginEmail").addEventListener("click", logInEmail);
	document.getElementById("newUser").addEventListener("click", newUser);

	$('.fliper-btn').click(function () {
		$('.flip').find('.card').toggleClass('flipped');

	});
	
	
	
	$(".list-group-item").click(function (e) {
		e.preventDefault();
		$('#main-page').hide();
		$('#locations').hide();
		if ($(this).data('rel') == "chat") {
			loadLoginPage();
		} else if ($(this).data('rel') == "game-info") {
			$('#' + $(this).data('rel')).show();
			var month = getCurrentMonth();
			var monthName = getCurrentTextMonth(month);
			$('#month').text(monthName);
			$('#month').val(month);
			console.log("estamos en el mes" + month);
			loadJSONData(monthName);

		} else {
			$('#' + $(this).data('rel')).show();
		}
	});
	$(".link-bottom").click(function (e) {
		e.preventDefault();
		$('#game-info').hide();
		$('#main-page').hide();
		$('#chat').hide();
		$('#locations').hide();
		$('.container-maps').hide();
		$('#login-page').hide();
		if ($(this).data('rel') == "chat") {
			loadLoginPage();
		} else {
			$('#' + $(this).data('rel')).show();
		}
	});

	$('#previous-month').click(function () {

		var currentMonth = $('#month').val();
		console.log(currentMonth);
		if (Number(currentMonth) > 1) {
			var element = document.getElementById("card");
			element.innerHTML = "";
			var previousmonth = getCurrentTextMonth(Number(currentMonth - 1));
			$('#month').text(previousmonth);
			$('#month').val(currentMonth - 1);
			loadJSONData(previousmonth);
		}
	});
	$('#next-month').click(function () {

		var month = $('#month').val();
		if (month < 12) {
			var element = document.getElementById("card");
			element.innerHTML = "";
			var nextmonth = getCurrentTextMonth(Number(month) + 1);
			$('#month').text(nextmonth);
			$('#month').val(Number(month) + 1);
			loadJSONData(nextmonth);
		}
	});
	$('#btn-chat').on('click', function () {
		writeNewPost();
		$('#btn-input').val('');

	});

	$('.logout').on('click', function () {
		logOut();
		loadMainPage();
	});
});

function loadMainPage() {
	$('#game-info').hide();
	$('#login-page').hide();
	$('#main-page').hide();
	$('#locations').hide();
	$('#game-info').hide();
	$('.container-maps').hide();
	$('#chat').hide();
	$('#main-page').show();
	$('#bottomm-bar').show();


}

function loadLoginPage() {
	$('#login-page').show();
	$('#bottomm-bar').hide();

}

function loadChatPage() {
	getPost();
	var currentUser = document.getElementById("chat-user");
	var logged = firebase.auth().currentUser.displayName;
	console.log(logged);
	if (logged == null) {
		currentUser.textContent = firebase.auth().currentUser.email;
	} else {
		currentUser.textContent = logged;
	}
	$('#game-info').hide();
	$('#main-page').hide();
	$('#locations').hide();
	$('#game-info-10').hide();
	$('.container-maps').hide();
	$('#login-page').hide();
	$('#chat').show();
	$('#bottomm-bar').show();
}

function getCurrentMonth() {
	var currentDate = new Date();
	var currentMonth = currentDate.getMonth();

	return currentMonth;
}

function getCurrentTextMonth(month) {

	var monthNames = ["1", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

	return monthNames[month];

}

function logInGoogle() {
	var provider1 = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider1).then(function () {
			loadChatPage();
		})
		.catch(function () {
			alert("Failed to login, try again");
		});

}

function logInFacebook() {
	var provider2 = new firebase.auth.FacebookAuthProvider();
	firebase.auth().signInWithPopup(provider2).then(function () {
			console.log("Logged");
			loadChatPage();
		})
		.catch(function () {
			alert("Failed to login, try again");
		});
}

function logInEmail() {
	var email = $("#Username").val();
	var password = $("#Password").val();

	firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
			$("#Username").val('');
			 $("#Password").val('');
			loadChatPage();
		})
		.catch(function (error) {

			var errorCode = error.code;
			var errorMessage = error.message;

			if (errorCode === 'auth/wrong-password') {
				
				$('#login-error').html("Wrong password.");
			} else {
				
				$('#login-error').html(errorMessage);
			}

		});

}

function writeNewPost() {
	var text = document.getElementById("btn-input").value;
	var userName = firebase.auth().currentUser.displayName;
	var provider = firebase.auth().currentUser.providerData[0].providerId;
	if (userName == null) {
		userName = firebase.auth().currentUser.email;
	}
	var postData = {
		name: userName,
		body: text,
		provider: provider
	};


	var newPostKey = firebase.database().ref().child('NYSLChat').push().key;

	var updates = {};
	updates[newPostKey] = postData;


	return firebase.database().ref().child('NYSLChat').update(updates);
}

function getPost() {
	firebase.database().ref('NYSLChat').on('value', function (data) {
		var logs = document.getElementById("chat-area");
		logs.innerHTML = "";

		var posts = data.val();

		for (var key in posts) {
			var element = posts[key];
			createMessageChat(logs, element)
		}

	});


}

function logOut() {
	firebase.auth().signOut().then(function () {
		console.log("Logout success!");
	}, function (error) {
		console.log("Unable to Logout!!!!");
	});
}

function createNewMatch(info,monthname, index) {

	var element = document.getElementById("card");
	var cardblock = document.createElement("div");
	cardblock.setAttribute("class", "card-block contentCenter");
	cardblock.setAttribute("data-month-name",monthname);
	cardblock.setAttribute("data-match-index",index);
	cardblock.setAttribute("data-rel", "game-detail");
	element.appendChild(cardblock);
	var leftcolumn = document.createElement("div");
	leftcolumn.setAttribute("class", "col-sm-4");
	leftcolumn.innerHTML = "<img src=" + info.team1 + " class=team-logo>";
	cardblock.appendChild(leftcolumn);
	var centercolumn = document.createElement("div");
	centercolumn.setAttribute("class", "col-sm-6");
	var day = document.createElement("span");
	day.setAttribute("class", "day");
	day.textContent = info.date;
	centercolumn.appendChild(day);
	var time = document.createElement("span");
	time.setAttribute("class", "time");
	time.textContent = info.hour;
	centercolumn.appendChild(time);
	var location = document.createElement("span");
	location.setAttribute("class", "location");
	location.textContent = info.location;
	centercolumn.appendChild(location);
	cardblock.appendChild(centercolumn);
	var rightColumn = document.createElement("div");
	rightColumn.setAttribute("class", "col-sm-4");
	rightColumn.innerHTML = "<img src=" + info.team2 + " class=team-logo>";
	cardblock.appendChild(rightColumn);


}

function createMessageChat(logs, element) {
	var row = document.createElement("div");
	row.setAttribute("class", "msg_container base_sent");
	logs.appendChild(row);
	console.log(element.provider);
	if(element.provider=="google.com"){
		var colleft = document.createElement("div");
		colleft.setAttribute("class", "col-md-10 col-xs-10");
		row.appendChild(colleft);
		var messages = document.createElement("div");
		messages.setAttribute("class", "messages msg_receive");
		messages.innerHTML = "<span class=user >" + element.name + "</span>";
		messages.innerHTML += "<p>" + element.body + "</p>";
		colleft.appendChild(messages);
		var colright = document.createElement("div");
		colright.setAttribute("class", "col-md-2 col-xs-2 avatar");
		colright.innerHTML = "<img src=http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg class=img-responsive>";
		row.appendChild(colright);
	}
	else{
		colleft = document.createElement("div");
		colleft.setAttribute("class", "col-md-2 col-xs-2 avatar");
		colleft.innerHTML = "<img src=http://www.bitrebels.com/wp-content/uploads/2011/02/Original-Facebook-Geek-Profile-Avatar-1.jpg class=img-responsive>";
		row.appendChild(colleft);
		colright = document.createElement("div");
		colright.setAttribute("class", "col-md-10 col-xs-10");
		messages = document.createElement("div");
		messages.setAttribute("class", "messages");
		messages.innerHTML = "<span class=blue>" + element.name + "</span>";
		messages.innerHTML += "<p>" + element.body + "</p>";
		colright.appendChild(messages);
		row.appendChild(colright);
		
		
	}

}

function loadJSONData(month) {
	$.getJSON('https://api.myjson.com/bins/1ca2nn', function (data) {
		var games = data.months;
		var datamonth = games[month.toLocaleLowerCase()];

		for (var i = 0; i < datamonth.length; i++) {
			createNewMatch(datamonth[i], month.toLocaleLowerCase(),i);
		}
		$('.card-block').on('click', function(){
			var monthname=$(this).attr("data-month-name");
			var index=$(this).attr("data-match-index");
			loadGameDetail(datamonth,monthname,index);
		});
	});
}


function newUser() {
	var email = $("#new-email").val();
	var pass = $("#new-password").val();
	firebase.auth().createUserWithEmailAndPassword(email, pass)
		.then(function () {
			firebase.auth().onAuthStateChanged(function (user) {

				if (user) {
					// Updates the user attributes:
					var nameOfUser = $("#new-username").val();
					user.updateProfile({
						displayName: nameOfUser
					}).then(function () {
						// Profile updated successfully!
						//  "NEW USER NAME"
						
						$('#newuser-mess').html("User successfuly created");

					}, function (error) {
						$('#newuser-mess').html(error);
					});
				}
				$("#new-email").val('');
				$("#new-password").val('');
				$("#new-username").val('');

			});
		})
		.catch(function (error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			$('#newuser-mess').html(errorMessage);
		});

}
function loadGameDetail(data,monthname,index){
		$("#game-info").hide();
		$("#game-detail").show();
		var logo1=document.getElementById("team-1");
		
		logo1.innerHTML="<img src="+data[index].team1+" class=team-detail>";
		$("#day-match").html(data[index].date);
		$("#time-match").html(data[index].hour);
		$("#game-location").html("<h3>"+data[index].location.toUpperCase()+"</h3>");
		var iframe=document.createElement("iframe");
		iframe.setAttribute("src", data[index].url);
		iframe.setAttribute("height", "300px");
	    $('#location-iframe').html(iframe);
	
		var logo2=document.getElementById("team-2");
		logo2.innerHTML="<img src="+data[index].team2+" class=team-detail>";
}