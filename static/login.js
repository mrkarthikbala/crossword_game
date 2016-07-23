/*Makes POST request to login. If successful, redirect to puzzle.*/
function login(){
	var username = $("#username").val();
	var password = $("#password").val();

	
	//Cross side scripting prevention
	username = username.replace("<", "&lt;");
	username = username.replace(">", "&rt;");

	password = password.replace("<", "&lt;");
	password = password.replace(">", "&rt;");

	//calculate hashes
	hashedUsername = window.btoa(username);
	hashedPassword = window.btoa(password);

	$.ajax({
		url: '/loginWithUser',
		data: {"username": hashedUsername, "password": hashedPassword},
		contentType: 'application/json',
		type: 'POST',
		async: false,
		success: function(data){
			data = JSON.parse(data);
			if ("error" in data){
				alert("Login invalid.");
				return;
			}
			// Storing the username/password/high score info in the page
			localStorage.setItem("username",username);
			localStorage.setItem("highScore", data['high_score']);
			
			//redirect to puzzle
			window.location.href = "/";
		},
		error: function(data){
			alert("Login unsuccessful.");
		}
	});
	return false;
}
