const userCode = SEO.getCodeAfter("profile");

let authorPaginationConfig = {
    limit: 4,
    page: 1,
    count: null,
    omit_ids: []
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

function loadUser(){
    
    return $.ajax({
        url: `/user/${userCode || "current"}/info`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            $('.loading-mask[data-mask="info"]').remove();
            if(userCode){
                $(document).prop("title", response.info.username);
                $("#breadcrumb-username").text(response.info.username);
            }

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function loadAuthorSetsCount(){
    return $.ajax({
        url: `/user/${userCode || "current"}/sets/count`,
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
        url: `/user/${userCode || "current"}/sets`,
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

loadUser().then(loadAuthorSetsCount).then(loadAuthorSets).then(buildAuthorPagination)
.catch(function(error) {
    if(error.statusText){
        console.log('Error trying to load user:', error.statusText);
        showAlert('Error trying to load user: ' + error.statusText, 'danger');
    } else {
        console.log('Error trying to load user:', error);
        showAlert('Error trying to load user: ' + error, 'danger');
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