const setCode = SEO.getCodeAfter("set");
const urlParams = new URLSearchParams(window.location.search);

const game = new Game();
const loaderDuration = 1000;

function loadSet(){
    
    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    return $.ajax({
        url: `/set/${setCode}/info`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            $('.loading-mask[data-mask="info"]').remove();

            $(document).prop("title", `Flashcards: ${response.info.name}`);
            $("#breadcrumb-set-name").text(response.info.name);
            $("#breadcrumb-set-name").prop("href", `/set/${setCode}`);
            $("#btn-end-exit").prop("href", `/set/${setCode}`);
            $(".btn-exit").prop("href", `/set/${setCode}`);
            $("#words-number").text(`${response.info.words_count}`);

            game.setTrackProgress(response.info.meta ? response.info.meta.track_progress : true);

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function loadWords(){

    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    let targetUrl = `/set/${setCode}/words/rehearse`;
    if(!game.getTrackProgress()) targetUrl = `/set/${setCode}/words`;

    return $.ajax({
        url: targetUrl,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            if(urlParams.get("swap") == "1"){
                game.setWordsSwapped(response.words);
            } else {
                game.setWords(response.words);
            };

            game.randomizeWords();

        } else {
            return $.Deferred().reject(response.message);
        }
    });
}

function showNextWord(word){

    $("#quiz-answers .answer").removeClass("wrong correct marked loader");
    $(".rehearse-words-number").text(game.getWordsToRehearseCount());
    $(".accuration-words-number").text(game.getAccuracy());

    if(word == null){
        $(".game-section").toggleClass("d-none");

        if(game.getTrackProgress())
            $.ajax({
                url: `/set/${setCode}/nearest-review-date`,
                method: "POST",
                dataType: "json"
            }).then(function(response) {
                if(response.success) {
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
        else {
            $("#nearest-revision").text("N/A");
            $("#mistakes-count").text(game.getUnknownWordsCount());
            $("#btn-review-mistakes").closest("div").removeClass("d-none").addClass("d-flex");
        }

        return;
    }

    $("#quiz-question").text(word.term);
    $("#quiz-answers").empty();
    const allAnswers = game.randomAnswerOptions(word, 4);
    allAnswers.forEach((ans, index) => {
        const $answerDiv = $(`
        <div class="col-12 col-sm-6 col-md-3">
            <div class="answer h-100 d-flex justify-content-center align-items-center p-2 border rounded" data-answer="${ans}">${ans}</div>
        </div>
        `);
        $("#quiz-answers").append($answerDiv);
    });

}    


loadSet().then(loadWords).then(function() {
    showNextWord(game.nextWord());
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
    game.markKnown();
    const button = this;
    $(button).find('.btn-text').toggleClass('d-none');
    $(button).find('.btn-spinner').toggleClass('d-none');
    $(button).prop("disabled", true);
    $("#flip-card-checkbox").prop("checked", false);
    setTimeout(() => {
        $(button).find('.btn-text').toggleClass('d-none');
        $(button).find('.btn-spinner').toggleClass('d-none');
        $(button).prop("disabled", false);
        showNextWord(game.nextWord());
    }, 400);
});

$('#foreign-button').on('click', function() {
    game.markUnknown();
    const button = this;
    $(button).prop("disabled", true).find('.btn-text').toggleClass('d-none');
    $(button).find('.btn-spinner').toggleClass('d-none');
    $(button).prop("disabled", true);
    $("#flip-card-checkbox").prop("checked", false);
    setTimeout(() => {
        $(button).prop("disabled", false).find('.btn-text').toggleClass('d-none');
        $(button).find('.btn-spinner').toggleClass('d-none');
        $(button).prop("disabled", false);
        showNextWord(game.nextWord());
    }, 400);
});

$(".btn-fullscreen").on('click', function() {
    $(".game-section").toggleClass("fullscreen");
});

$("#btn-review-mistakes").on('click', function() {
    if(game.getUnknownWordsCount() == 0){
        showAlert('There are no mistakes to review!', 'info');
        return;
    }
    $(".game-section").toggleClass("d-none");
    game.repeatUnknownWords();
    showNextWord(game.nextWord());
});

$("#btn-next").on("click", function(){
    game.repeat();
    $(".game-section").toggleClass("d-none");
    showNextWord(game.nextWord());
});

$("#quiz-answers").on("click", ".answer", function(){
    $("#quiz-answers .answer").addClass("disabled");
    const ans = $(this).text().trim();
    const goodAns = game.currentWord().definition.trim();
    if(ans == goodAns){
        game.markKnown();
        $(this).addClass("correct loader");
    } else {
        game.markUnknown();
        $(this).addClass("wrong loader");
        $("#quiz-answers .answer").filter(function() {
            return $(this).text().trim() == goodAns;
        }).addClass("marked");
    }
    setTimeout(()=>{
        showNextWord(game.nextWord());
    }, loaderDuration);
});