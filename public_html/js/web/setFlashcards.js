const setCode = SEO.getCodeAfter("set");
const urlParams = new URLSearchParams(window.location.search);

let words = [];
let currentWordIndex = -1;
let knownWords = 0;
let unknownWords = 0;

function loadSet(){
    
    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    return $.ajax({
        url: `/set/${setCode}/info`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            $('.loading-mask[data-mask="info"]').remove();

            $(document).prop("title", `Fishcards: ${response.info.name}`);
            $("#breadcrumb-set-name").text(response.info.name);
            $("#breadcrumb-set-name").prop("href", `/set/${setCode}`);
            $("#btn-end-exit").prop("href", `/set/${setCode}`);
            $("#btn-exit").prop("href", `/set/${setCode}`);
            $("#words-number").text(`${response.info.words_count}`);

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function loadWords(){

    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    return $.ajax({
        url: `/set/${setCode}/words/rehearse`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            if(urlParams.get("swap") == "1"){
                words = response.words.map(word => {
                    return {
                        word_id: word.word_id,
                        term: word.definition,
                        definition: word.term
                    };
                });
            } else words = response.words;

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function showNextWord(direction = 0){

    // First call skips updating progress
    if(direction != 0){
        $.ajax({
            url: `/word/${words[currentWordIndex].word_id}/update/progress`,
            method: "POST",
            dataType: "json",
            data: JSON.stringify({
                direction: direction
            })
        }).then(function(response) {
            if(!response.success) {
                return $.Deferred().reject(response.message);
            }
        }).catch(function(error) {
            if(error.statusText){
                console.log('Error updating progress: ', error.statusText);
                showAlert('Error updating progress: ' + error.statusText, 'danger');
            } else {
                console.log('Error updating progress:', error);
                showAlert('Error updating progress: ' + error, 'danger');
            }
        });
    }

    currentWordIndex++;
    $("#rehearse-words-number").text(words.length - currentWordIndex);
    if(unknownWords + knownWords > 0){
        const totalAnswered = unknownWords + knownWords;
        $(".accuration-words-number").text(Math.round((knownWords) / totalAnswered * 100));
    } else $(".accuration-words-number").text("-");
    if(currentWordIndex >= words.length){
        $('.mask[data-mask="end"]').toggleClass("d-none");
        $.ajax({
            url: `/set/${setCode}/nearest-review-date`,
            method: "POST",
            dataType: "json"
        }).then(function(response) {
            if(response.success) {
                $("#nearest-revision").empty();
                $("#nearest-revision").text(response.nearest_review);
                const date1 = new Date(response.nearest_review);
                const dateNow = new Date();
                if(date1.getTime() > dateNow.getTime()){
                    $("#btn-next").remove();
                }
            } else {
                return $.Deferred().reject(response.message);
            }
        }).catch(function(error) {
            if(error.statusText){
                console.log('Error loading nearest review: ', error.statusText);
                showAlert('Error loading nearest review: ' + error.statusText, 'danger');
            } else {
                console.log('Error loading nearest review:', error);
                showAlert('Error loading nearest review: ' + error, 'danger');
            }
        });
        return;
    }
    const word = words[currentWordIndex];
    $("#word-card-foreign").text(word.term);
    $("#word-card-native").text(word.definition);
}

$(document).ready(function() {
    
    loadProfileUsername();

    loadSet().then(loadWords).then(function() {
        showNextWord();
    })
    .catch(function(error) {
        if(error.statusText){
            console.log('Error trying to load set:', error.statusText);
            showAlert('Error trying to load set: ' + error.statusText, 'danger');
        } else {
            console.log('Error trying to load set:', error);
            showAlert('Error trying to load set: ' + error, 'danger');
        }
    });

    $('#known-button').on('click', function() {
        knownWords++;
        const button = this;
        $(button).find('.btn-text').toggleClass('d-none');
        $(button).find('.btn-spinner').toggleClass('d-none');
        $("#flip-card-checkbox").prop("checked", false);
        setTimeout(() => {
            $(button).find('.btn-text').toggleClass('d-none');
            $(button).find('.btn-spinner').toggleClass('d-none');
            showNextWord(1);
        }, 400);
    });

    $('#foreign-button').on('click', function() {
        unknownWords++;
        const button = this;
        $(button).prop("disabled", true).find('.btn-text').toggleClass('d-none');
        $(button).find('.btn-spinner').toggleClass('d-none');
        $("#flip-card-checkbox").prop("checked", false);
        setTimeout(() => {
            $(button).prop("disabled", false).find('.btn-text').toggleClass('d-none');
            $(button).find('.btn-spinner').toggleClass('d-none');
            showNextWord(-1);
        }, 400);
    });

    $("#btn-fullscreen").on('click', function() {
        $("#game-interface").toggleClass("fullscreen");
    });

});