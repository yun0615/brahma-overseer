(function($){
    $(window).on("load",function(){
        //----------------------------------
        //    scrollbar
        //----------------------------------
        $("#newArea").mCustomScrollbar({
            theme: "minimal-dark"
        });

        $("#show_classApp").mCustomScrollbar({
            theme: "minimal-dark"
        });
        //----------------------------------
        //    change class
        //----------------------------------
        loadAppClass("game");

        $(".appClassPicker").on('change', function() {
            var appClass = $(this).val();
            if(appClass != ""){
                loadAppClass(appClass);
            }
        });

        function loadAppClass(appClass){
            console.log(appClass);
            $.post("/admin/show_appClass",{
                appClass : appClass
            },function(data){
                $("#classAppArea").html(data);
            });
        }

        $(".appClassPicker").click(function(){
            $(this).children(".dropdown-menu").toggle();
        });

        $(document).mouseup(function(e){
            dropdownHidden(e,"div.dropdown-menu");
        });

    });
})(jQuery);