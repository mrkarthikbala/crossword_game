
function getNewPuzzle(){
	var puzzleAndClues;
	$.ajax({
		url: '/getNewPuzzle',
      		data: {},
       		type: 'POST',	
		async: false,
		success: function(data){
			puzzleAndClues = jQuery.parseJSON(data);
			},
		error: function(data){
			console.log(data);
		}
    });
	return puzzleAndClues;
}

function login(username, password){

	//Cross side scripting prevention
	username = username.replace("<", "&lt;");
	username = username.replace(">", "&rt;");

	password = password.replace("<", "&lt;");
	password = password.replace(">", "&rt;");

	//calculate hashes
	hashedUsername = window.btoa(username);
	hashedPassword = window.btoa(password);
	var result = "";
	$.ajax({
		url: '/loginWithUser',
		data: {"username": hashedUsername, "password": hashedPassword},
		contentType: 'application/json',
		type: 'POST',
		async: false,
		success: function(data){
			data = JSON.parse(data);
			if ("error" in data){
				result= "error";
				return;
			}
			// Storing the username/password/high score info in the page
			localStorage.setItem("username",username);
			localStorage.setItem("highScore", data['high_score']);
			result= "success";
			
		},
		error: function(data){
			alert("Login unsuccessful.");
		}
	});
	return result;
}
function submitSignupValueChecks(username, password, passwordConfirm){

	
	badCombination = false;
	//check if passwords match
	if (password != passwordConfirm){
		badCombination = true;
	}
	//check if any fields are blank
	if (username == undefined || username == null || username.length == 0){
		badCombination = true;
	}
	if (password == undefined || password == null || password.length == 0){
		badCombination = true;
	}

	return badCombination;
	
}

QUnit.test( "test get new puzzle", function( assert ) {
  var puzzleAndClues = getNewPuzzle();
  assert.ok( puzzleAndClues["puzzle"] != undefined, "Passed!" );
});

QUnit.test( "test login  valid", function( assert ) {
  var result = login("Karthik", "karthik");
  assert.ok( result == "success", "Passed!" );
});

QUnit.test( "test login  invalid", function( assert ) {
  var result = login("sdfsfs", "dfslkjfsljk;");
  assert.ok( result == "error", "Passed!" );
});

QUnit.test( "test login  local storage", function( assert ) {
  login("Karthik", "karthik");
  assert.ok( localStorage.getItem("username") == "Karthik", "Passed!" );
});

QUnit.test("test submit signup bad values - good combination", function(assert){
  var result = submitSignupValueChecks("Karthik", "karthik", "karthik");
  assert.ok(result == false, "Passed!");
});

QUnit.test("test submit signup bad values - bad combination", function(assert){
  var result = submitSignupValueChecks("Karthik", "kathik", "karthik");
  assert.ok(result == true, "Passed!");
});

QUnit.test("test submit signup bad values - null values", function(assert){
  var result = submitSignupValueChecks(undefined, null, "karthik");
  assert.ok(result == true, "Passed!");
});


/*Tests persistence of high score tracking across multiple logins.*/
QUnit.test("test score persistence", function(assert){
  login("Karthik", "karthik");
  var karthikScore = localStorage.getItem("highScore");
  login("Bill", "good");

  login("Karthik", "karthik");
  assert.ok(karthikScore == localStorage.getItem("highScore"), "Passed!");
});
