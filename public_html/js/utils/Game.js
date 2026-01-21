class Game {
    #knownWords;
    #knownWordsArray;
    #unknownWords;
    #unknownWordsArray;
    #currentWordIndex;
    #words;
    #trackProgress;

    constructor() {
        this.#knownWords = 0;
        this.#unknownWords = 0;
        this.#currentWordIndex = -1;
        this.#words = [];
        this.#trackProgress = true;
        this.#knownWordsArray = [];
        this.#unknownWordsArray = [];
    }

    setTrackProgress(track) {
        this.#trackProgress = track;
    }

    getTrackProgress() {
        return this.#trackProgress;
    }

    setWords(words) {
        this.#words = words.map(word => {
            return {
                word_id: word.word_id,
                term: word.term.trim(),
                definition: word.definition.trim()
            };
        });
    }

    setWordsSwapped(words) {
        this.#words = words.map(word => {
            return {
                word_id: word.word_id,
                term: word.definition.trim(),
                definition: word.term.trim()
            };
        });
    }

    repeatUnknownWords() {
        this.#knownWords = 0;
        this.#unknownWords = 0;
        this.#currentWordIndex = -1;
        this.#words = this.#unknownWordsArray;
        this.#knownWordsArray = [];
        this.#unknownWordsArray = [];
    }

    repeat(){
        this.#knownWords = 0;
        this.#unknownWords = 0;
        this.#currentWordIndex = -1;
        this.#knownWordsArray = [];
        this.#unknownWordsArray = [];
    }

    randomizeWords() {
        for (let i = this.#words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.#words[i], this.#words[j]] = [this.#words[j], this.#words[i]];
        }
    }

    updateWordProgress(direction, wordId = this.#currentWordIndex) {
        $.ajax({
            url: `/word/${this.#words[wordId].word_id}/update/progress`,
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

    markKnown() {
        this.#knownWords += 1;
        this.#knownWordsArray.push(this.#words[this.#currentWordIndex]);
        if(this.#trackProgress)
            this.updateWordProgress(1);
    }

    markUnknown() {
        this.#unknownWords += 1;
        this.#unknownWordsArray.push(this.#words[this.#currentWordIndex]);
        if(this.#trackProgress)
            this.updateWordProgress(-1);
    }

    getUnknownWordsCount() {
        return this.#unknownWords;
    }

    getKnownWordsCount() {
        return this.#knownWords;
    }

    getAccuracy() {
        const totalAnswered = this.#knownWords + this.#unknownWords;
        if (totalAnswered === 0) return '-';
        return Math.round((this.#knownWords / totalAnswered) * 100, 2);
    }

    getWordsToRehearseCount(){
        return this.#words.length - this.#currentWordIndex;
    }

    nextWord() {
        this.#currentWordIndex += 1;
        if(this.#currentWordIndex >= this.#words.length){
            return null;
        }
        return this.#words[this.#currentWordIndex];
    }

    currentWord(){
        return this.#words[this.#currentWordIndex];
    }

    randomAnswerOptions(correctWord, numOptions = 4) {
        let options = [];
        options.push(correctWord.definition);

        while (options.length < Math.min(numOptions, this.#words.length)) {
            const randomIndex = Math.floor(Math.random() * this.#words.length);
            const randomWord = this.#words[randomIndex];
            if (!options.includes(randomWord.definition) && randomWord.word_id !== correctWord.word_id) {
                options.push(randomWord.definition);
            }
        }

        return options.sort(() => Math.random() - 0.5);
    }

}