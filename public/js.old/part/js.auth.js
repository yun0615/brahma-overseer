 $('body').css("backgroundImage","url('../img/background/blur_background9.jpg')");

//======================================
//           調整登入框位置
//======================================
  var wbox = $(".auth_box").outerWidth();
  var hbox = $(".auth_box").outerHeight();
  $(".auth_box").css({"margin-left":-(wbox/2)});
  $(".auth_box").css({"margin-top":-(hbox/2)});

//======================================

$(function(){
	
	$.cookie.json = true; // turns on automatic JSON parsing for jquery.cookie
	//var data = $.cookie("svmpData");
	//if (data) {
	//    window.location.replace(data.sessionInfo.role);
	//}
	

	//======================================
	//      登入的基本表單檢查及送出
	//======================================

	var loginUrl = "/auth/signin";
	$("#loginForm").submit(function(event) {
	    event.preventDefault();

	    var credentials = {
	        username: $("#username").val(),
	        password: $("#password").val()
	    };

	    // Basic validation
	    if(credentials.username && credentials.username.length > 0
	            && credentials.password && credentials.password.length > 0){
	        submitCredentials(credentials, loginUrl);
	    } else {
	        $("#hint").html("Please enter username and password").show();
	        $("#username").focus();
	    }
	});


	//======================================
	//      註冊的基本表單檢查及送出
	//======================================

	var signupUrl = "/auth/signup";
	//http://172.16.0.10:3000/login
	$("#signupForm").submit(function(event) {
	    event.preventDefault();

	    var credentials = {
	    	email: $("#email").val(),
	        username: $("#username").val(),
	        password: $("#password").val()
	    };
	    // Basic validation
	    if(credentials.username && credentials.username.length > 0
	            && credentials.password && credentials.password.length > 0){
	    	submitSignUp(credentials, signupUrl);
	    } else {
	        $("#hint").html("Please enter all information").show();
	        $("#username").focus();
	    }
	});




/*	$("button.btn-signin").click(function(e){
		e.preventDefault(); // Prevents the page from refreshing
		var url = $(this).attr("action");
		//-----------------
		var userID = $("input[name=username]").val();
		var userPWD = $("input[name=password]").val();
		
		if(userID.length == 0 || userPWD.length == 0){
			$("#hint").html("Please enter username and password").show();
		}else{

			$("form.loginForm").submit();
		//	$.post('/signin',{
		//		username:userID,
		//		password:userPWD
		//	},function(data){
		//		console.log(data);
		//		if(data.signinStatus == "YES"){
		//			console.log(data);
		//			//window.location = '/admin';
		//		}else{
		//			$("#hint").text("username or password wrong");
		//			$("#hint").css("display","block");
		//		}
		//	});
		}
	});*/
	//======================================
	
	//======================================
	//            欄位檢查
	//======================================	
	$("div.form-group input").focusout(function(){
		var value = $(this).val();
		if(value.length == 0){
			$("#hint").html("Please enter all information").show();
			//$("#hint").css("display","block");
		}
	});

	$("form.signupForm input[name=email]").on('change',function(){
		emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
		var strEmail = $(this).val();
		if(strEmail.search(emailRule)!= -1){
		}else{
			$("#hint").text("Your email does not meet complexity requirements, please try again!");
		}
	})
	//======================================
});
