
//======================================
//           設定DataTable
//======================================
//var table = $('#dataTables').DataTable({stateSave: true,destory:true});


 // Restore state
/*var state = table.state.loaded();
if ( state ) {
	var searchVal = $("#dataTables_filter input").val();
	//console.log(searchVal);

	table.search(searchVal).draw();
}*/


loadTable();
function loadTable(){
	$.post("show_user_table",{},function(data){
		$(".tableArea").html(data);
	});
}




//======================================
//           設定switchButton
//======================================
$("div.switch-wrapper input[type=checkbox]").switchButton({
	labels_placement: "right",
	checked: true,
	width: 60,
	height: 20,
	button_width: 30
});


//======================================
//           autoUpdate
//======================================	
function autoUpdate(){
	
	if ($("#autoUpdateCkb").prop('checked')) {
		//timer = setTimeout(function() { location.reload(); }, 5000);
		loader = setInterval(function(){loadTable();},10000);
	} else {
		if(typeof loader !== 'undefined'){
			//clearTimeout(timer);
			clearInterval(loader);
		}
	}
}

autoUpdate();

$("#autoUpdateCkb").change(function(){
	autoUpdate();
});

//======================================
//            customScrollBar
//======================================	
$(".main_block").mCustomScrollbar({
	axis:"x",
	theme:"minimal",
	advanced:{ autoExpandHorizontalScroll:true }
});




//======================================
//           刪除使用者
//======================================	
(function($){
	$.fn.delete_user = function(username){
		var reply = confirm("您確定要刪除該使用者:"+username+" ?");
			if (reply == true) {
			 location.href="/admin/delete_user/"+username ;
		 } 
	}

})(jQuery);
//======================================
