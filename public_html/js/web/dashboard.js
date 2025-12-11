const setImagePath = "/assets/sets/";

function loadPrivateSets(){
    $.ajax({
        url: "/user/current/sets",
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            let $root = $("#private-sets-container");
            $root.children().not(":first").remove();
            response.sets.forEach(function(set) {

                if(set.image_name === null) set.image_name = "default.jpg";
                else set.image_name = 'uploaded/' + set.image_name;

                let $setElem = $(`
                    <div class="col-sm-6 col-md-4 col-lg-3">
                        <div class="card h-100 text-center text-black set-card">
                            <img src="${setImagePath}${set.image_name}" class="card-img-top" alt="Set Image">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center">
                                <h5 class="card-title">Title</h5>
                                <p class="card-text mb-4">Text</p>
                                <div class="mt-auto d-flex justify-content-end w-100 gap-1 flex-wrap">
                                    <button class="btn btn-outline-warning btn-sm btn-edit"><i class="bi bi-pencil-fill"></i></button>
                                    <button class="btn btn-outline-primary btn-sm btn-preview"><i class="bi bi-eye-fill"></i></button>
                                    <button class="btn btn-outline-success btn-sm btn-play"><i class="bi bi-play-fill"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
                $setElem.find('.card-title').text(set.name);
                $setElem.find('.card-text').text(set.description);

                $setElem.find('.btn-edit').on('click', function() {
                    window.location.href = `/set/${set.set_id}/edit`;
                });

                $setElem.find('.btn-preview').on('click', function() {

                    $("#modal-set-preview").find('.modal-title').find('span').text(set.name + ": ");
                    bootstrap.Modal.getOrCreateInstance('#modal-set-preview').show();

                    $.ajax({
                        url: `/set/${set.set_id}/words`,
                        method: "POST",
                        dataType: "json"
                    }).then(function(response) {
                        if(response.success) {

                            let $tbody = $("#modal-set-preview-tbody");
                            $tbody.empty();
                            
                            if(response.words.length === 0) {
                                $tbody.append('<tr><td colspan="3" class="text-center">No words in this set.</td></tr>');
                            } else {
                                response.words.forEach(function(word, index) {
                                    $tbody.append(`<tr><td>${index + 1}</td><td>${word.term}</td><td>${word.definition}</td></tr>`);
                                });
                            }
                            
                        } else {
                            showAlert(response.message, 'warning');
                        }
                    }).catch(function(error) {
                        console.log('Error trying to load set words:', error);
                        showAlert('Error trying to load set words', 'danger');
                    });
                    
                });

                $setElem.find('.btn-play').on('click', function() {
                    window.location.href = `/set/${set.set_id}/play`;
                });
                
                $root.append($setElem);
                
            });

        } else {
            showAlert(response.message, 'warning');
        }
    }).catch(function(error) {
        console.log('Error trying to load private sets:', error);
        showAlert('Error trying to load private sets', 'danger');
    });
}

$(document).ready(function() {
    
    loadProfileUsername();
    loadPrivateSets();

});