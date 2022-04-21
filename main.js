"use strict";

// Document elements
const text = document.querySelector('#words');
const input = document.querySelector('#input');

// Paragraph and positional variables
var wordCount;      // number of words in typing test
var paragraph;      // array containing words in typing test
var curr;           // index of current word
var first;          // bool
var done;           // bool

// Scoring variables
var time;
var score;

initialize();

// Updates 'wordCount' and stores in local storage for preference
function setWordCount(n) {
    localStorage.setItem('wordCount', n);
    wordCount = n;
    initialize();
}

// Randomly generates a paragraph of 'wordCount' length
function createParagraph() {
    fetch('words.txt')
    .then(response => response.text())
    .then(data => {
        // generate paragraph randomly
        let words = data.split('\n');
        for(let i = 0; i < wordCount; i++) {
            paragraph[i] = words[Math.floor(Math.random() * words.length)];
        }
    printParagraph();
    })
    .catch(err => console.log(err));
}

// Display paragraph
function printParagraph() {
    text.innerHTML = '';     // reset display when REDO pressed
    for(let word of paragraph) {
        let span = document.createElement('span');
        let space = document.createElement('span');
        span.innerHTML = word;
        space.innerHTML = ' ';
        text.appendChild(span);
        text.appendChild(space);
    }
    text.firstChild.classList.add('selected');  // highlight first word
}

// Calculates time elapsed
function timer() {
    // uses closure to cycle through start/stop
    let toggle = 0; // 0 = start, 1 = stop
    let start;
    return function cycle() {
        if(toggle === 0) {
            start = Date.now();
        } else {
            let end = Date.now();
            return end - start;
        }
        toggle += 1;
    };
}

// Reset variables (activated on refresh and REDO)
function initialize() {
    input.focus(); // select input box
    input.value = ''    // clear input box
    input.className = '';   // remove 'wrong' className

    // generate paragraph
    wordCount = localStorage.getItem("wordCount");
    if(wordCount === null)
        wordCount = 25; // default number of words
    paragraph = [];
    createParagraph();

    // reset positional and score variables
    curr = 0;
    first = true;
    done = false;
    score = 0;
    time = timer();

    // hide previous score
    document.querySelector('#wpm').innerHTML = 'wpm';
    document.querySelector('#accuracy').innerHTML = 'accuracy';
}

// Input (key pressed)
input.addEventListener('keydown', e => {
    if(!done)
        input.value = input.value.replace(/\s/g, "");   // remove extra space
    if(curr < paragraph.length)
        checkInput();

    function checkInput() {
        // valid input characters (excluding backspace and space)
        let valid = (e.key >= 'a' && e.key <= 'z' ||
                    (e.key >= '0' && e.key <= '9') ||
                    (e.key === `'`|| e.key === ',' || e.key === '.' || e.key === ';' || e.key === '?'
                    || e.key === '[' || e.key === ']' || e.key === '{' || e.key === '}' || e.key === '|'
                    || e.key === '\\' || e.key === '-' || e.key === '_' || e.key === '/' || e.key === '!')
                    || e.key === '`' || e.key === '~' || e.key === '@' || e.key === '#' || e.key === '$'
                    || e.key === '%' || e.key === '^' || e.key === '*' || e.key === '(' || e.key === ')'
                    || e.key === '+' || e.key === '=' || e.key === ';' || e.key === ':');

        // if first input, start timer
        if(first && valid) {
            first = false;
            time();
        }
        if(valid) {
            let inputWord = input.value + e.key;
            let actualWord = paragraph[curr].slice(0, inputWord.length);
            input.className = (inputWord === actualWord ? '' : 'wrong');    // compare input to expected input
        } else if(e.key === "Backspace") {
            let inputWord = input.value.slice(0, input.value.length-1);
            let actualWord = paragraph[curr].slice(0, inputWord.length);
            input.className = (inputWord === actualWord ? '' : 'wrong');    // compare input to expected input
        } else if(e.key === " ") {
            if(input.value === paragraph[curr]) {   // update text color to signify correct or not
                score++;
                text.childNodes[curr*2].classList.add('correct');   // curr*2 since text contains twice as many nodes as words due to spaces
            } else
                text.childNodes[curr*2].classList.add('wrong');
            input.value = '';   // clear input
            input.className = '';   // remove 'wrong' className
            text.childNodes[curr*2].classList.remove('selected');
            curr++;
            if(curr < paragraph.length)
                text.childNodes[curr*2].classList.add('selected');    // highlight next word
        }
    }

    if(curr === paragraph.length-1) {
        if((input.value + e.key) === paragraph[curr]) {
            text.childNodes[curr].classList.add('correct');
            score++;
            scoring();
        }
    }
    if(curr === paragraph.length && !done)
        scoring();
});

// Calculate WPM and accuracy
function scoring() {
    let secs = time() / 1000;    // converts ms to s
    let accuracy = (score / wordCount) * 100;
    let wpm = Math.floor((score/secs) * 60);
    done = true;
    
    displayScore();

    function displayScore() {
        document.querySelector('#wpm').innerHTML = `wpm: ${wpm}`;
        document.querySelector('#accuracy').innerHTML = `accuracy: ${accuracy}%`;
    }
}
