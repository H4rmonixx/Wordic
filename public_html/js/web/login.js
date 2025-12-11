$(document).ready(function() {
    
    loadProfileUsername();

    // Handle login form submission
    $('#login-form').on('submit', function(event) {
        event.preventDefault();

        let fd = new FormData();
        fd.append("username", $(this).find('input[name="username"]').val());
        fd.append("password", $(this).find('input[name="password"]').val());

        $('#login-error-message').text("");
        $("#login-form").find('button[type="submit"]').prop('disabled', true);
        $("#login-form").find('button[type="submit"] .btn-content').toggleClass('d-none');

        $.ajax({
            url: "/login/try",
            method: "POST",
            data: fd,
            dataType: "json",
            processData: false,
            contentType: false
        }).then(function(response) {
            $("#login-form").find('button[type="submit"]').prop('disabled', false);
            $("#login-form").find('button[type="submit"] .btn-content').toggleClass('d-none');
            if(response.success) {
                window.location.href = '/dashboard';
            } else {
                $('#login-error-message').text(response.message);
            }
        }).catch(function(error) {
            console.log('Error trying to login:', error);
            showAlert('Error trying to login', 'danger');
        });
        
    });

});