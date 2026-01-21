const setCode = SEO.getCodeAfter("set");

let authorPaginationConfig = {
    limit: 4,
    page: 1,
    count: null,
    omit_ids: [SEO.getIDAfter("set")]
}

function trimDescription(desc, n = 32){
    if(desc.length > n){
        desc = desc.substring(0, n) + "...";
    }

    return desc;
}

function getTotalAuthorPages() {
    return Math.ceil(authorPaginationConfig.count / authorPaginationConfig.limit);
}

function changeAuthorPage(newPage){
    if(newPage >= 1 && newPage <= getTotalAuthorPages()){
        authorPaginationConfig.page = newPage;
        loadAuthorSets();
        buildAuthorPagination();
    }
}

function buildAuthorPagination(){

    let $root = $("#pagination-author");

    $root.children().not(":first").not(":last").remove();
    let $links = $();

    $("#pagination-author-prev").toggleClass("disabled", authorPaginationConfig.page === 1);
    $("#pagination-author-next").toggleClass("disabled", authorPaginationConfig.page === getTotalAuthorPages());

    let tmpPage = (authorPaginationConfig.page - 2 > 0) ? authorPaginationConfig.page - 2 : 1;
    let tmpPagesListed = 0;
    while(tmpPagesListed < 4 && tmpPage <= getTotalAuthorPages()){
        const page = tmpPage;
        let $newLink = $(`<li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>`);
        if(authorPaginationConfig.page == page) $newLink.find("a").addClass("active");
        $links = $links.add($newLink);
        tmpPage++;
        tmpPagesListed++;
    }

    $root.children().first().after($links);
}

function loadSet(){
    
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
            $("#set-author")
            .text(response.info.user_username)
            .prop("href", `/profile/${SEO.createCode(response.info.user_id, response.info.user_username)}`)
            .data("author-code", SEO.createCode(response.info.user_id, response.info.user_username));

            if(response.info.image_name == null) response.info.image_path += 'default.jpg';
            $("#set-img").prop("src", response.info.image_path);
            $("#set-img").prop("alt", response.info.name);

            $("#card-bg").css("background-image", `url("${response.info.image_path}")`);

            $("#btn-preview").data("set-name", response.info.name);
            $("#btn-preview-count").text(response.info.words_count);

            if(!response.isOwner){
                $("#btn-edit").remove();
            } else {
                $("#btn-edit").on("click", function(){
                    window.location.href = `/set/${setCode}/edit`;
                });
            }

            if(response.info.meta){
                $("#use-progress").prop("checked", response.info.meta.track_progress);
            }
            $("#use-progress").on("change", function(){
                updateSetProgress(Number($(this).is(":checked")));
            });

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function loadAuthorSetsCount(){
    return $.ajax({
        url: `/user/${$("#set-author").data("author-code")}/sets/count`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {
            authorPaginationConfig.count = response.count;
        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function loadAuthorSets(){
    const $root = $("#author-sets");
    const minHeight = $root.height();
    $root.css("min-height", minHeight + "px");

    $root.html(`
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100 text-center text-secondary">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                    <div class="spinner-border text-black"></div>
                </div>
            </div>
        </div>
    `);

    return $.ajax({
        url: `/user/${$("#set-author").data("author-code")}/sets`,
        method: "POST",
        dataType: "json",
        data: JSON.stringify(authorPaginationConfig)
    }).then(function(response) {
        if(response.success) {

            if(response.sets.length === 0) {
                $root.html(`
                    <div class="col-sm-6 col-md-4 col-lg-3">
                        <div class="card h-100 text-center text-black">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center">
                                <h3 class="card-title text-danger"><i class="bi bi-slash-circle"></i></h3>
                                <p class="card-text">User has no public sets</p>
                            </div>
                        </div>
                    </div>
                `);
                return;
            }

            let fragment = document.createDocumentFragment();
            response.sets.forEach(function(set) {

                if(set.image_name === null) set.image_path += "default.jpg";

                let $setElem = $(`
                    <div class="col-sm-6 col-md-4 col-lg-3">
                        <a class="card h-100 text-center text-black set-card text-decoration-none">
                            <img class="card-img-top" alt="Set Image">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center">
                                <h5 class="card-title"></h5>
                                <p class="card-text"></p>
                            </div>
                        </a>
                    </div>
                `);
                
                $setElem.find(".card").prop("href", `/set/${SEO.createCode(set.set_id, set.name)}`);
                $setElem.find("img").attr("src", set.image_path);
                $setElem.find(".card-title").text(set.name);
                $setElem.find(".card-text").text(trimDescription(set.description));
                
                fragment.appendChild($setElem[0]);
                
            });

            $root[0].replaceChildren(fragment);
            $root.css("min-height", "");

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function updateSetProgress(trackProgress){
    $("#use-progress").prop("disabled", true);
    return $.ajax({
        url: `/set/${setCode}/edit/meta`,
        method: "POST",
        dataType: "json",
        data: JSON.stringify({
            track_progress: trackProgress
        })
    }).then(function(response) {
        if(response.success) {
            $("#use-progress").prop("disabled", false);
            showAlert('Set progress tracking updated successfully.', 'success');
        } else {
            return $.Deferred().reject(response.message);
        }
    }).catch(function(error) {
        $("#use-progress").prop("disabled", false);
        if(error.statusText){
            console.log('Error updating set progress tracking:', error.statusText);
            showAlert('Error updating set progress tracking: ' + error.statusText, 'danger');
        } else {
            console.log('Error updating set progress tracking:', error);
            showAlert('Error updating set progress tracking: ' + error, 'danger');
        }
    });
}

loadSet().then(loadAuthorSetsCount).then(loadAuthorSets).then(buildAuthorPagination)
.catch(function(error) {
    if(error.statusText){
        console.log('Error trying to load set:', error.statusText);
        showAlert('Error trying to load set: ' + error.statusText, 'danger');
    } else {
        console.log('Error trying to load set:', error);
        showAlert('Error trying to load set: ' + error, 'danger');
    }
});

$("#pagination-author").on("click", ".page-link[data-page]", function (event) {
    event.preventDefault();
    changeAuthorPage(parseInt($(this).data("page")));
});

$("#pagination-author-next").on("click", function (event) {
    event.preventDefault();
    changeAuthorPage(authorPaginationConfig.page + 1);
});

$("#pagination-author-prev").on("click", function (event) {
    event.preventDefault();
    changeAuthorPage(authorPaginationConfig.page - 1);
});

$("#btn-preview").on("click", function(){
    const setName = $(this).data("set-name");
    if(setCode == null){
        showAlert('Error with set ID', 'danger');
        return;
    };

    $("#modal-words-preview").find('.modal-title').find('span').text(setName + ": ");
    bootstrap.Modal.getOrCreateInstance('#modal-words-preview').show();
    let $tbody = $("#modal-words-preview-tbody");
    $tbody.empty().append('<tr><td colspan="3"><div class="d-flex justify-content-center align-items-center gap-2 p-2"><div>Loading</div><div class="spinner-border spinner-border-sm text-black"></div></div></td></tr>');

    $.ajax({
        url: `/set/${setCode}/words`,
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
            bootstrap.Modal.getOrCreateInstance('#modal-words-preview').hide();
            showAlert(response.message, 'warning');
        }
    }).catch(function(error) {
        bootstrap.Modal.getOrCreateInstance('#modal-words-preview').hide();
        if(error.statusText){
            console.log('Error trying to load set words:', error.statusText);
            showAlert('Error trying to load set words: ' + error.statusText, 'danger');
        } else {
            console.log('Error trying to load set words:', error);
            showAlert('Error trying to load set words: ' + error, 'danger');
        }
    });
});

$("#form-play").on("submit", function(event){
    event.preventDefault();
    const game = $("#form-play-game").val();
    const swapWords = $("#swap-words").is(":checked");
    window.location.href = `/set/${setCode}/${game}${swapWords ? '?swap=1' : ''}`;
});

$("#btn-reset-progress").on("click", function(){
    bootstrap.Modal.getOrCreateInstance('#modal-reset-progress').show();
});

$("#btn-accept-reset").on("click", function(){
    const button = this;
    $(button).prop("disabled", true).find(".btn-text").toggleClass("d-none");
    $(button).find(".btn-spinner").toggleClass("d-none");
    $.ajax({
        url: `/set/${setCode}/reset/progress`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {
            $(button).prop("disabled", false).find(".btn-text").toggleClass("d-none");
            $(button).find(".btn-spinner").toggleClass("d-none");
            bootstrap.Modal.getOrCreateInstance('#modal-reset-progress').hide();
            showAlert('Set progress has been reset successfully.', 'success');
        } else {
            return $.Deferred().reject(response.message);
        }
    }).catch(function(error) {
        $(button).prop("disabled", false).find(".btn-text").toggleClass("d-none");
        $(button).find(".btn-spinner").toggleClass("d-none");
        bootstrap.Modal.getOrCreateInstance('#modal-reset-progress').hide();
        if(error.statusText){
            console.log('Error resetting set progress:', error.statusText);
            showAlert('Error resetting set progress: ' + error.statusText, 'danger');
        } else {
            console.log('Error resetting set progress:', error);
            showAlert('Error resetting set progress: ' + error, 'danger');
        }
    });
});