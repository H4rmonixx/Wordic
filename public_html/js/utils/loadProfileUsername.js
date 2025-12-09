function loadProfileUsername() {
    $.ajax({
        url: '/user/current/username',
        method: 'POST',
        dataType: 'json',
        contentType: "application/json"
    }).then(function(response) {
        if (response) {
            $('.profile-username').text(response.username);
        }
    }).catch(function(error) {
        console.log('Error loading username:', error);
        showAlert('Error loading username', 'danger');
    });
}