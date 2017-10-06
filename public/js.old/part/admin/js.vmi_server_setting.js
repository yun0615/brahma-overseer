$("#serverSetting").submit(function(event){
	event.preventDefault();

	var ipRule = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
	var ip = $("#ip").val();
	var netmask = $("#netmask").val();
	var gateway = $("#gateway").val();
	var ipRegex = ip.match(ipRule);
	var maskRegex = netmask.match(ipRule);
	var gateRegex = gateway.match(ipRule);

	if(!ipRegex || ipRegex[1]>255 || ipRegex[2]>255 || ipRegex[3]>255 || ipRegex[4]>255){
		$("#hint").html("IP does not match the correct format");
	}else if(!maskRegex || maskRegex[1]>255 || maskRegex[2]>255 || maskRegex[3]>255 || maskRegex[4]>255){
		$("#hint").html("Netmask does not match the correct format");
	}else if(!gateRegex || gateRegex[1]>255 || gateRegex[2]>255 || gateRegex[3]>255 || gateRegex[4]>255){
		$("#hint").html("Gateway does not match the correct format");
	}else{
		$.post("/admin/server_setting",{
			ip: ip,
			netmask: netmask,
			gateway: gateway
		},function(data){
			$("#hint").html(data.msg);
			if(typeof data.msg == 'undefined'){
				window.location.replace("/admin/vm"); 
			}
		})
	}
});
