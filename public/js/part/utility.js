function submitSignin(credentials,username , url) {


    //ExpireCookie(10);

    function ExpireCookie(minutes,cookieName,cookieValue) {
        var date = new Date();
        var m = minutes;
        date.setTime(date.getTime() + (m * 60 * 1000));
        $.cookie(cookieName, cookieValue, { expires: date });
    }

    $.ajax({
        type: "POST",
        url: url,
        data: credentials,
        dataType: "json",
        success: function (data, status, jqXHR) {
            ExpireCookie(60,"brahmaData",data);
            ExpireCookie(60,"username",username);

console.log(data);

	    if(data.roles == "user"){
//            if(data.sessionInfo.role == "user"){
                window.location.replace("/client");
            }else{
		window.location.replace(data.roles);
//                window.location.replace(data.sessionInfo.role);
//		console.log("login");
//		console.log(data.sessionInfo.role);
		
            }

        },
        error: function (jqXHR, status) {
            console.log(jqXHR);
            $("#hint").html(jqXHR.responseJSON.message).show();
            $("#username").focus();
        }
    });
}


function submitSignUp(credentials, url) {
    $.ajax({
        type: "POST",
        url: url,
        data: credentials,
        dataType: "json",
        success: function (data, status, jqXHR) {
            $("#hint").html("Please check your email account and verify your brahma account.").show();
        },
        error: function (jqXHR, status) {
            $("#hint").html(jqXHR.responseJSON.message).show();
        }
    });
}

function submitChangePsw(credentials, url) {
    $.ajax({
        type: "POST",
        url: url,
        data: credentials,
        dataType: "json",
        success: function (data, status, jqXHR) {
            $("#hint").html(jqXHR.responseJSON.message).show();
            setTimeout(function(){ a.close(); }, 3000);
        },
        error: function (jqXHR, status) {
            $("#hint").html(jqXHR.responseJSON.message).show();      

        }
    });
}
