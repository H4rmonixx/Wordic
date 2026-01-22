const setCode = SEO.getCodeAfter("set");
const urlParams = new URLSearchParams(window.location.search);

const game = new Game();
const loaderDuration = 1250;

function loadSet(){
    
    if(setCode == null) return new Promise((resolve, reject) => {reject("No set ID");});

    return $.ajax({
        url: `/set/${setCode}/info`,
        method: "POST",
        dataType: "json"
    }).then(function(response) {
        if(response.success) {

            $('.loading-mask[data-mask="info"]').remove();

            $(document).prop("title", `Quiz: ${response.info.name}`);
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

    $(" input").removeClass("wrong correct");
    $("#answer-form .input-group").removeClass("loader");
    $("#correct-ans").addClass("d-none");
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
    $("#answer-form input").val("");

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

$("#answer-form").on("submit", function(event){
    event.preventDefault();
    const fieldset = $(this).find("fieldset");
    fieldset.prop("disabled", true);
    const ans = $(this).find("input").val().trim();
    const goodAns = game.currentWord().definition.trim();
    if(isCorrect(ans, goodAns)){
        game.markKnown();
        $(this).find("input").addClass("correct");
        $(this).find(".input-group").addClass("loader");
    } else {
        game.markUnknown();
        $(this).find("input").addClass("wrong loader");
        $(this).find(".input-group").addClass("loader");
        $("#correct-ans").find("span").eq(1).text(goodAns);
        $("#correct-ans").removeClass("d-none");
    }
    setTimeout(()=>{
        fieldset.prop("disabled", false);
        fieldset.find("input").focus();
        showNextWord(game.nextWord());
    }, loaderDuration);
});



// USER INPUT SIMILAR ENOUGH TO CORRECT ANSWER
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
function levenshtein(a, b) {
    const m = [];
    for (let i = 0; i <= b.length; i++) m[i] = [i];
    for (let j = 0; j <= a.length; j++) m[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
        m[i][j] = b[i - 1] === a[j - 1]
        ? m[i - 1][j - 1]
        : Math.min(
            m[i - 1][j - 1] + 1,
            m[i][j - 1] + 1,
            m[i - 1][j] + 1
            );
    }
    }
    return m[b.length][a.length];
}
function isCorrect(userInput, correctAnswer) {
    let tolerance;
    if(correctAnswer.length <= 5) tolerance = 0;
    else if(correctAnswer.length <= 8) tolerance = 1;
    else tolerance = 2;
    const n1 = normalize(userInput);
    const n2 = normalize(correctAnswer);
    return levenshtein(n1, n2) <= tolerance;
}