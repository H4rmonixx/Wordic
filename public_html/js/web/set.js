function loadSet(){
    const setCode = SEO.getCodeAfter("set");
    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    return $.ajax({
        url: `/set/${setCode}/info`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            $('.loading-mask[data-mask="info"]').remove();

            $(document).prop("title", response.info.name);
            $("#breadcrumb-set-name").text(response.info.name);

            $("#set-name").text(response.info.name);
            $("#set-description").text(response.info.description);

            if(response.info.image_name == null) response.info.image_path += 'default.jpg';
            $(".set-img").prop("src", response.info.image_path);
            $(".set-img").prop("alt", response.info.name);

            $(".card-bg").css("background-image", `url("${response.info.image_path}")`);

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

$(document).ready(function() {
    
    loadProfileUsername();

    loadSet()
    .catch(function(error) {
        if(error.statusText){
            console.log('Error trying to load set:', error.statusText);
            showAlert('Error trying to load set: ' + error.statusText, 'danger');
        } else {
            console.log('Error trying to load set:', error);
            showAlert('Error trying to load set: ' + error, 'danger');
        }
    });

});