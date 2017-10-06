$(function(){

    /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */

    $(".dropbtn").click(function(){
    	$("#myDropdown").toggle("show");
    });

    $(document).mouseup(function(e){
        dropdownHidden(e,"#myDropdown");
    });


    //////////////////////////////////////////////////////////////
    // check to make sure we have a session cookie
 
    // logout button
    $("#logoutBtn").click(function() {
console.log("click the logout btn");
    	$.confirm({
    		theme: 'material',
    		type: 'blue',
    		title: 'Reminder',
    		content: 'Are you sure you want to log out?',
    		buttons: {
    	        confirm: {
    	        	text: 'Log out',
    	            btnClass: 'btn-blue',
    		        action: function () {
                        $.removeCookie("brahmaData", {path: '/'});
                        $.removeCookie("username", {path: '/'});
                        $.get("/auth/signout", function(data, status){
                            window.location.replace("/");
                        });
    	            	//$.removeCookie("brahmaData", {path: '/'});
                        //$.removeCookie("username", {path: '/'});
      				    //window.location.replace("/");
    	            }
    		    },
    	        cancel: function () {
    	            //close
    	        }
    	    }
    	});
    });


    $("#changePswBtn").click(function(){
    	a.open();
    })

    $("a.firstNav").click(function(){
        var navid = "#" + $(this).attr("id") + " + ul";
        $("a.firstNav + ul").hide();
        $(navid).toggle(1000);
    })

    $(".navbar").css("margin-bottom","0px");

});
