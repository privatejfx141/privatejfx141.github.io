window.onload = (function () {
    "use strict";

    let quotes = [
        {
            text: "Hello pretty bird!",
            author: "Mr. Simoneau",
            cite: 'RCI ICS2U1'
        },
        {
            text: "When the Hulk gets mad, he becomes green.",
            author: "Mr. Simoneau",
            cite: 'RCI ICS3U1'
        },
        {
            text: "There's no crying in math.",
            author: "Mr. Whiddon",
            cite: 'RCI MCV4U1'
        },
        {
            text: "Go sleep in English, not in my class!",
            author: "Mr. Whiddon",
            cite: 'RCI MCV4U1'
        },
        {
            text: "Computers are stupid.",
            author: "Brian Harrington",
            cite: 'UTSC CSCA08'
        },
        {
            text: "Are you okay?",
            author: "Xiamei Jiang",
            cite: 'UTSC MATB24'
        },
        {
            text: "Brush up on your algebraic manipulation.",
            author: "Nick Cheng",
            cite: 'UTSC CSCB36'
        },
        {
            text: "I don't want to see you again.",
            author: "Nick Cheng",
            cite: 'UTSC CSCB36'
        },
        {
            text: "I\'d like to call them \"Power-Richard Slides\".",
            author: "Richard Pancer",
            cite: 'UTSC CSCC37'
        },
        {
            text: "You could also bring your brain to the exam.",
            author: "Thierry Sans",
            cite: 'UTSC CSCD27'
        },
        {
            text: "Amidst the blue skies, a link from past to future.",
            author: "\"Shattered Skies\""
        },
        {
            text: "Without beginning or end, the ring stretches into the infinite.",
            author: "\"Zero\""
        },
        {
            text: "Today's my birthday! A victory sure would be nice.",
            author: "SkyEye"
        },
        {
            text: "Sorry, but I'm gonna eat while I work. My judgement goes fuzzy when I'm too hungry.",
            author: "Long Caster"
        },
        {
            text: "Imagine it. Picture it. SALVATION!",
            author: "Matias Torres"
        }
    ];

    let gliderStates = [
        [0, 0, 1, 1, 0, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 1, 1, 1],
        [1, 0, 1, 0, 1, 1, 0, 1, 0]
    ];
    let currentState = 0;

    const refreshQuote = function () {
        let quoteElmt = document.getElementById("rndquote");
        let quote = quotes[Math.floor(Math.random() * quotes.length)];
        let blockquote = document.createElement('blockquote');
        blockquote.innerHTML = `
            <p class="mb-0">${quote.text}</p>
            <footer class="blockquote-footer">
                ${quote.author}${(quote.cite) ? ', <cite>' + quote.cite + '</cite>' : ''}
            </footer>
        `;
        blockquote.addEventListener("click", function(evt) {
            refreshQuote();
        });
        quoteElmt.innerHTML = "";
        quoteElmt.appendChild(blockquote);
    };
    refreshQuote();

    const gliderAnimation = function () {
        window.setInterval(() => {
            let state = gliderStates[currentState];
            for (let i = 0; i < 9; i++) {
                let gridBoxId = "glider-grid-" + i;
                let elmt = document.getElementById(gridBoxId);
                if (state[i] === 1) {
                    elmt.style.background = "#FFF";
                } else {
                    elmt.style.background = "";
                }
            } 
            currentState = (currentState + 1) % 4;
        }, 256);
    };
    gliderAnimation();

    // rare name easter egg :P
    if (Math.floor((Math.random() * 23) + 1) == 1) {
        document.getElementById("portfolio-title").innerText = "李赟杰";
        document.getElementById("my-name").innerText = "Yun Jie Li";
    }

}());
