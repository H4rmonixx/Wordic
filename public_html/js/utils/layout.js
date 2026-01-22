$.ajax({
    url: '/user/current/username',
    method: 'POST',
    dataType: 'json',
    contentType: "application/json"
}).then(function(response) {
    if (response.success) {
        $('.profile-username').text(response.username);
    } else {
        $('.profile-username').text("");
    }
}).catch(function(error) {
    console.log('Error loading username:', error);
    showAlert('Error loading username', 'danger');
});

document.addEventListener("DOMContentLoaded", () => {
    // wait a moment for CSS layout to settle
    requestAnimationFrame(() => {

        const recalc = () => {
            const minHeight = $(window).height()
                - $('header').outerHeight(true)
                - $('footer').outerHeight(true);

            $("main").css("min-height", `${minHeight}px`);
        };

        recalc();

        $(window).on('load resize', recalc);
    });
});