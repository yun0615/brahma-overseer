function submitCredentials(credentials, url) {


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
            ExpireCookie(60,"username",data.username);

            if(data.roles == "user"){
                window.location.replace("/client");
            }else{
                window.location.replace(data.roles);
            }

        },
        error: function (jqXHR, status) {
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