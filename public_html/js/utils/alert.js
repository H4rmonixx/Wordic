let alert_timeout = null;

function showAlert(message, type = 'info', duration = 3000) {
    if(alert_timeout) clearTimeout(alert_timeout);
    let alertBox = $('#alert-box');
    if(!alertBox.length) {
        alertBox = $('<div>', {
            class: `alert position-fixed bottom-0 start-50 translate-middle-x p-3 rounded text-center shadow`,
            id: 'alert-box',
            css: {
                zIndex: 100,
                minWidth: '200px',
                display: 'none'
            }
        });
        $('body').append(alertBox);
    }
    alertBox.removeClass('alert-info alert-success alert-warning alert-danger')
    .addClass(`alert-${type}`)
    .text(message)
    .fadeIn();

    alert_timeout = setTimeout(() => {
        alertBox.fadeOut();
    }, duration);
}