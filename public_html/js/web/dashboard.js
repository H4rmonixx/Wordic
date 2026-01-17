let privatePaginationConfig = {
    limit: 7,
    page: 1,
    count: null
}

function trimDescription(desc, n = 32){
    if(desc.length > n){
        desc = desc.substring(0, n) + "...";
    }

    return desc;
}

function getTotalPrivatePages() {
    return Math.ceil(privatePaginationConfig.count / privatePaginationConfig.limit);
}


function changePrivatePage(newPage){
    if(newPage >= 1 && newPage <= getTotalPrivatePages()){
        privatePaginationConfig.page = newPage;
        loadPrivateSets();
        buildPrivatePagination();
    }
}

function buildPrivatePagination(){

    let $root = $("#pagination-private");

    $root.children().not(":first").not(":last").remove();
    let $links = $();

    $("#pagination-private-prev").toggleClass("disabled", privatePaginationConfig.page === 1);
    $("#pagination-private-next").toggleClass("disabled", privatePaginationConfig.page === getTotalPrivatePages());

    let tmpPage = (privatePaginationConfig.page - 2 > 0) ? privatePaginationConfig.page - 2 : 1;
    let tmpPagesListed = 0;
    while(tmpPagesListed < 4 && tmpPage <= getTotalPrivatePages()){
        const page = tmpPage;
        let $newLink = $(`<li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>`);
        if(privatePaginationConfig.page == page) $newLink.find("a").addClass("active");
        $links = $links.add($newLink);
        tmpPage++;
        tmpPagesListed++;
    }

    $root.children().first().after($links);
}

function loadPrivateSetsCount(){
    return $.ajax({
        url: "/user/current/sets/count",
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {
            privatePaginationConfig.count = response.count;
        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function createSetCardElement(set) {
    if(set.image_name === null) set.image_path += "default.jpg";
    let $setElem = $(`
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 text-center text-black set-card">
                <img class="card-img-top" alt="Set Image">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                    <h5 class="card-title"></h5>
                    <p class="card-text mb-4"></p>
                    <div class="mt-auto d-flex justify-content-end w-100 gap-1 flex-wrap">
                        <button class="btn btn-outline-warning btn-sm btn-edit"><i class="bi bi-pencil-fill"></i></button>
                        <button class="btn btn-outline-primary btn-sm btn-preview"><i class="bi bi-eye-fill"></i></button>
                        <button class="btn btn-outline-success btn-sm btn-play"><i class="bi bi-play-fill"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `);

    $setElem.find("img").attr("src", set.image_path);
    $setElem.find(".card-title").text(set.name);
    $setElem.find(".card-text").text(trimDescription(set.description));
    $setElem.find(".btn-edit, .btn-preview, .btn-play")
    .data("set-id", set.set_id)
    .data("set-name", set.name);

    return $setElem;
}

function loadPrivateSets(){

    const $root = $("#private-sets-container");
    const minHeight = $root.height();
    $root.css("min-height", minHeight + "px");

    $root.children().not(":first").remove();
    $root.append($(`
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 text-center text-secondary">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                    <div class="spinner-border text-black"></div>
                    <div>Loading</div>
                </div>
            </div>
        </div>
    `));

    return $.ajax({
        url: "/user/current/sets",
        method: "POST",
        dataType: "json",
        data: JSON.stringify(privatePaginationConfig)
    }).then(function(response) {
        if(response.success) {

            $root.children().not(":first").remove();
            response.sets.forEach(function(set) {

                let $setElem = createSetCardElement(set);
                $root.append($setElem);
                
            });

            $root.css("min-height", "");

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

$(document).ready(function() {
    
    loadProfileUsername();

    loadPrivateSetsCount().then(loadPrivateSets).then(buildPrivatePagination)
    .catch(function(error) {
        if(error.statusText){
            console.log('Error trying to load private sets:', error.statusText);
            showAlert('Error trying to load private sets: ' + error.statusText, 'danger');
        } else {
            console.log('Error trying to load private sets:', error);
            showAlert('Error trying to load private sets: ' + error, 'danger');
        }
    });

    $("#pagination-private").on("click", ".page-link[data-page]", function (event) {
        event.preventDefault();
        changePrivatePage(parseInt($(this).data("page")));
    });

    $("#pagination-private-next").on("click", function (event) {
        event.preventDefault();
        changePrivatePage(privatePaginationConfig.page + 1);
    });

    $("#pagination-private-prev").on("click", function (event) {
        event.preventDefault();
        changePrivatePage(privatePaginationConfig.page - 1);
    });

    $("#private-sets-container").on("click", ".btn-preview", function (event) {
        const setID = parseInt($(this).data("set-id"));
        const setName = $(this).data("set-name");

        $("#modal-set-preview").find('.modal-title').find('span').text(setName + ": ");
        bootstrap.Modal.getOrCreateInstance('#modal-set-preview').show();
        let $tbody = $("#modal-set-preview-tbody");
        $tbody.empty().append('<tr><td colspan="3"><div class="d-flex justify-content-center align-items-center gap-2 p-2"><div>Loading</div><div class="spinner-border spinner-border-sm text-black"></div></div></td></tr>');

        $.ajax({
            url: `/set/${setID}/words`,
            method: "POST",
            dataType: "json"
        }).then(function(response) {
            if(response.success) {

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
            if(error.statusText){
                console.log('Error trying to load set words:', error.statusText);
                showAlert('Error trying to load set words: ' + error.statusText, 'danger');
            } else {
                console.log('Error trying to load set words:', error);
                showAlert('Error trying to load set words: ' + error, 'danger');
            }
        });

    });

    $("#private-sets-container").on("click", ".btn-edit", function () {
        const setID = parseInt($(this).data("set-id"));
        const setName = $(this).data("set-name");
        window.location.href = `/set/${SEO.createCode(setID, setName)}/edit`;
    });

    $("#private-sets-container").on("click", ".btn-play", function () {
        const setID = parseInt($(this).data("set-id"));
        const setName = $(this).data("set-name");
        window.location.href = `/set/${SEO.createCode(setID, setName)}`;
    });

    $("#new-set").on("click", function () {
        bootstrap.Modal.getOrCreateInstance('#modal-new-set').show();
    });

    $("#form-new-set").on("submit", function (event) {
        event.preventDefault();

        const name = $("#form-new-set-name").val().trim();
        const description = $("#form-new-set-description").val().trim();
        const isPublic = $("#form-new-set-public").is(":checked");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("public", isPublic ? "1" : "0");

        $("#form-new-set-submit .btn-text").prop("disabled", true).toggleClass("d-none");
        $("#form-new-set-submit .btn-spinner").toggleClass("d-none");

        $.ajax({
            url: "/set/new",
            method: "POST",
            dataType: "json",
            data: formData,
            processData: false,
            contentType: false
        }).then(function(response) {
            $("#form-new-set-submit .btn-text").prop("disabled", false).toggleClass("d-none");
            $("#form-new-set-submit .btn-spinner").toggleClass("d-none");
            if(response.success) {
                bootstrap.Modal.getInstance('#modal-new-set').hide();
                showAlert('Set created successfully!', 'success');
                const newElement = createSetCardElement(response.set);
                $("#private-sets-container").children().eq(0).after(newElement);
                if(response.set.public){
                    $("#public-sets-container").children().eq(0).after(newElement);
                }
                setTimeout(function(){
                    window.location.href = `/set/${SEO.createCode(response.set.set_id, response.set.name)}/edit`;
                }, 200);
            } else {
                return $.Deferred().reject(response.message);
            }
        }).catch(function(error) {
            bootstrap.Modal.getInstance('#modal-new-set').hide();
            if(error.statusText){
                console.log('Error trying to create new set:', error.statusText);
                showAlert('Error trying to create new set: ' + error.statusText, 'danger');
            } else {
                console.log('Error trying to create new set:', error);
                showAlert('Error trying to create new set: ' + error, 'danger');
            }
        });

    });

});