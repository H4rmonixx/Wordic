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
            $("#breadcrumb-set-name").prop("href", `/set/${SEO.createCode(response.info.set_id, response.info.name)}`);

            $("#form-settings-name").val(response.info.name);
            $("#form-settings-description").text(response.info.description);
            $("#form-settings-public").prop("checked", response.info.public);

            if(response.info.image_name){
                $("#set-image").prop("src", response.info.image_path);
            }

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function loadWords(){
    const setCode = SEO.getCodeAfter("set");
    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    return $.ajax({
        url: `/set/${setCode}/words`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            $('.loading-mask[data-mask="words"]').remove();

            let $root = $("#words-tbody");
            $root.children().not(":first").remove();
            response.words.forEach((word, index) => {
                $root.append(createWordTr(word.term, word.definition, index));
            });

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function createWordTr(term, definition, index){
    let $tr = $(`
    <tr class="word-row">
        <td class="word-index">${index + 1}</td>
        <td><input type="text" class="form-control form-control-plaintext word-term" maxlength="100" minlength="1" id=""></td>
        <td><input type="text" class="form-control form-control-plaintext word-definition" maxlength="100" minlength="1" id=""></td>
        <td><button class="btn btn-danger word-btn-del"><i class="bi bi-trash"></i></button></td>
    </tr>
    `);

    $tr.find(".word-term").val(term);
    $tr.find(".word-definition").val(definition);

    return $tr;
}

function markWordsUnsaved(){
    let $root = $("#words-save-feedback");
    $root.empty();

    $root.append($(`
        <div class="text-warning"><i class="bi bi-exclamation-triangle"></i> Changes not saved</div>
    `));

    $(".not-saved-line").removeClass("d-none");
}

function reindexWords(){
    let index = 0;
    $(".word-index").each(function(){
        $(this).text(index + 1);
        index++;
    });
}

$(document).ready(function() {
    
    loadProfileUsername();

    loadSet().then(loadWords)
    .catch(function(error) {
        if(error.statusText){
            console.log('Error trying to load set:', error.statusText);
            showAlert('Error trying to load set: ' + error.statusText, 'danger');
        } else {
            console.log('Error trying to load set:', error);
            showAlert('Error trying to load set: ' + error, 'danger');
        }
    });

    $("#form-settings").on("submit", function(event){
        event.preventDefault();
        let formData = new FormData();
        formData.append("name", $("#form-settings-name").val());
        formData.append("description", $("#form-settings-description").val());
        formData.append("public", $("#form-settings-public").prop("checked") ? 1 : 0);

        const setCode = SEO.getCodeAfter("set");
        if(setCode == null){
            showAlert('No set ID', 'danger');
            return;
        }

        const form = this;

        $(form).find(".btn-text").toggleClass("d-none");
        $(form).find(".btn-spinner").toggleClass("d-none");
        $(form).find(".btn").prop("disabled", true);
        $.ajax({
            url: `/set/${setCode}/edit/info`,
            type: "post",
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false
        }).then(function(response){
            if(response.success){
                $(form).find(".btn-text").toggleClass("d-none");
                $(form).find(".btn-spinner").toggleClass("d-none");
                $(form).find(".btn").prop("disabled", false);
                showAlert('Settings saved.', 'success');
            } else {
                return $.Deferred().reject(response.message);
            }
        }).catch(function(error){
            $(form).find(".btn-text").toggleClass("d-none");
            $(form).find(".btn-spinner").toggleClass("d-none");
            $(form).find(".btn").prop("disabled", false);
            if(error.statusText){
                console.log('Error trying to edit info:', error.statusText);
                showAlert('Error trying to edit info: ' + error.statusText, 'danger');
            } else {
                console.log('Error trying to edit info:', error);
                showAlert('Error trying to edit info: ' + error, 'danger');
            }
        });

    });

    $("#form-image").on("submit", function(event){
        event.preventDefault();
        
        if($(this).find('input[type="file"]')[0].files.length == 0) return;

        let formData = new FormData();
        formData.append("image", $(this).find('input[type="file"]')[0].files[0]);

        const setCode = SEO.getCodeAfter("set");
        if(setCode == null){
            showAlert('No set ID', 'danger');
            return;
        }

        const form = this;

        $(form).find(".btn-text").toggleClass("d-none");
        $(form).find(".btn-spinner").toggleClass("d-none");
        $(form).find(".btn").prop("disabled", true);
        $.ajax({
            url: `/set/${setCode}/edit/image`,
            type: "post",
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false
        }).then(function(response){
            if(response.success){
                $(form).find(".btn-text").toggleClass("d-none");
                $(form).find(".btn-spinner").toggleClass("d-none");
                $(form).find(".btn").prop("disabled", false);
                $("#set-image").prop("src", response.image_path);
                showAlert('Image saved.', 'success');
            } else {
                return $.Deferred().reject(response.message);
            }
        }).catch(function(error){
            $(form).find(".btn-text").toggleClass("d-none");
            $(form).find(".btn-spinner").toggleClass("d-none");
            $(form).find(".btn").prop("disabled", false);
            if(error.statusText){
                console.log('Error trying to edit image:', error.statusText);
                showAlert('Error trying to edit image: ' + error.statusText, 'danger');
            } else {
                console.log('Error trying to edit image:', error);
                showAlert('Error trying to edit image: ' + error, 'danger');
            }
        });

    });

    $("#form-add-word").on("submit", function(event){
        event.preventDefault();
        const term = $("#form-add-word-term").val().trim();
        const definition = $("#form-add-word-definition").val().trim();
        if(term.length < 1 || term.length > 100){
            showAlert('Term should contain 1-100 characters', 'danger');
            return;
        }
        if(definition.length < 1 || definition.length > 100){
            showAlert('Definition should contain 1-100 characters', 'danger');
            return;
        }

        const pattern = /^[\p{L}\p{N}]+$/u;
        if(!pattern.test(term) || !pattern.test(definition)){
            showAlert('Only letters and digits allowed', 'danger');
            return;
        }

        const lastIndex = parseInt($(".word-index:last").text());
        $("#words-tbody").append(createWordTr(term, definition, lastIndex));
        $("#form-add-word-term").val("");
        $("#form-add-word-definition").val("");

        markWordsUnsaved();

    });

    $("#form-words-search").on("submit", function(event){
        event.preventDefault();
        const searchedPhrase = $("#form-words-search-input").val().toLowerCase();
        let found = false;

        $(".word-term").removeClass("text-primary fw-bold");
        $(".word-definition").removeClass("text-primary fw-bold");

        $(".word-term, .word-definition").each(function () {
            if(found) return;
            const value = $(this).val().toLowerCase();
            if(value.includes(searchedPhrase)){
                found = true;
                $(this).addClass("text-primary fw-bold");
                $(this)[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });

    });

    $("#words-save-btn").on("click", function(){

        const setCode = SEO.getCodeAfter("set");
        if(setCode == null){
            showAlert('No set ID', 'danger');
            return;
        }

        let words = $(".word-row").map(function(){
            const term = $(this).find(".word-term").val().trim();
            const definition = $(this).find(".word-definition").val().trim();

            if (!term || !definition) return null;
            return { term, definition };
        }).get();


        const button = this;
        $(button).find(".btn-text").toggleClass("d-none");
        $(button).find(".btn-spinner").toggleClass("d-none");
        $(button).prop("disabled", true);

        $.ajax({
            url: `/set/${setCode}/edit/words`,
            method: 'post',
            dataType: 'json',
            data: JSON.stringify(words)
        }).then(function(response){
            if(response.success){

                $(button).find(".btn-text").toggleClass("d-none");
                $(button).find(".btn-spinner").toggleClass("d-none");
                $(button).prop("disabled", false);

                $(".not-saved-line").addClass("d-none");
                $("#words-save-feedback").empty().append($(`<div class="text-success"><i class="bi bi-check"></i> Words saved</div>`));

            } else {
                return $.Deferred().reject(response.message);
            }
        }).catch(function(error) {
            $(button).find(".btn-text").toggleClass("d-none");
            $(button).find(".btn-spinner").toggleClass("d-none");
            $(button).prop("disabled", false);
            if(error.statusText){
                console.log('Error trying to save words:', error.statusText);
                showAlert('Error trying to save words: ' + error.statusText, 'danger');
            } else {
                console.log('Error trying to save words:', error);
                showAlert('Error trying to save words: ' + error, 'danger');
            }
        });

    })

    $("#words-tbody").on("input", ".word-term, .word-definition", function(){
        markWordsUnsaved();
    });

    $("#words-tbody").on("click", ".word-btn-del", function(){
        $(this).closest("tr").remove();
        markWordsUnsaved();
        reindexWords();
    });

});