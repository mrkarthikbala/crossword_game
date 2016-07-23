/*Makes POST request to /createNewPlayer */
function submitSignup(){

	var username = $("#createUsername").val();
	var password = $("#createPassword").val();
	var passwordConfirm = $("#confirmPassword").val();

	//check if passwords match
	if (password != passwordConfirm){
		alert("Passwords don't match.");
		return;
	}
	//check if any fields are blank
	if (username == undefined || username == null || username.length == 0){
		alert("Username invalid.");
		return;
	}
	if (password == undefined || password == null || password.length == 0){
		alert("Password invalid.");
		return;
	}

	
	//Cross side scripting prevention
	username = username.replace("<", "&lt;");
	username = username.replace(">", "&rt;");

	password = password.replace("<", "&lt;");
	password = password.replace(">", "&rt;");
	
	passwordConfirm = passwordConfirm.replace("<", "&lt;");
	passwordConfirm = passwordConfirm.replace(">", "&rt;");
	
	//hash username and password
	var hashedUsername = window.btoa(username);
	var hashedPassword = window.btoa(password);

	$.ajax({
		url: '/createNewPlayer',
		data: {"username": hashedUsername, "password": hashedPassword},
		contentType: 'application/json',
		type: 'POST',
		async: true,
		success: function(data){
			//check if username exists. if so, alert and return.
			data = JSON.parse(data);
			
			if ("error" in data){
				alert("Username already exists!");
				return;
			}
			$("#signUpContainer").empty();
			$("#signUpContainer").html("<h1>Player created!</h1>");

			//save username and high score, redirect to game
			localStorage.setItem("username", username);
			localStorage.setItem("highScore", 0);

			window.location.href = "/";
		},
		error: function(data){
			alert("Signup error.");
		}
	});
	
	
}
