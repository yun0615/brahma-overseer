function dropdownHidden(e,container){
    var container = $(container);
    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) 
    {
        container.hide();
    }
}



var username = $.cookie("username");

var a = $.confirm({
    lazyOpen: true,
    theme: 'material',
    type: 'blue',
    title: 'Change Password',
    content: '' +
    '<form action="" class="formName">' +
        '<div class="form-group">' +
            '<label>Current Password</label>' +
            '<input type="password" id="currentPassword" name="currentPassword" placeholder="Current Password" class="form-control" required />' +
        '</div>' +
        '<div class="form-group">' +
            '<label>New Password</label>' +
            '<input type="password" id="newPassword" name="newPassword" placeholder="New Password" class="form-control" required />' +
        '</div>' +
        '<div class="form-group">' +
            '<label>Verify Password</label>' +
            '<input type="password" id="verifyPassword" name="verifyPassword" placeholder="Verify Password" class="form-control " required />' +
        '</div>' +
        '<div id="hint" class="text-center red">' +
                '<strong></strong>' +
        '</div>' +
    '</form>',
    buttons: {
        formSubmit: {
            text: 'Save Change',
            btnClass: 'btn-blue',
            action: function () {
                var cpsw = this.$content.find('#currentPassword').val();
                var npsw = this.$content.find('#newPassword').val();
                var vpsw = this.$content.find('#verifyPassword').val();
                if(!cpsw || !npsw || !vpsw){
                    this.$content.find("#hint strong").text("Each field must be provided");
                    return false;
                }else if(npsw != vpsw){
                    this.$content.find("#hint strong").text("Passwords do not match");
                    return false;
                }else{
                    var credentials = {
                        username: username,
                        currentPassword: cpsw,
                        newPassword: npsw,
                        verifyPassword: vpsw
                    };
                       
                    var url = "/users/password";

                    submitChangePsw(credentials, url);
                    return false;

                }
                   // $.alert('Your name is ' + name);
            }
        },
        cancel: function () {
            //close
        },
    },
    onContentReady: function () {
        // bind to events
        var jc = this;
        this.$content.find('form').on('submit', function (e) {
            console.log("formName");
            // if the user submits the form by pressing enter in the field.
            e.preventDefault();
            jc.$$formSubmit.trigger('click');
             //submitChangePsw(credentials, url);
        });
    }
});