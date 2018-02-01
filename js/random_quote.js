var quotes = [
    {text: "Hello pretty bird!", author: "Mr. Simoneau", cite: 'RCI ICS2U1'},
    {text: "When the Hulk gets mad, he becomes green.", author: "Mr. Simoneau", cite: 'RCI ICS3U1'},
    {text: "There's no crying in math.", author: "Mr. Whiddon", cite: 'RCI MCV4U1'},
    {text: "Go sleep in English, not in my class!", author: "Mr. Whiddon", cite: 'RCI MCV4U1'},
    {text: "Computers are stupid.", author: "Brian Harrington", cite: 'UTSC CSCA08'},
    {text: "Are you okay?", author: "Xiamei Jiang", cite: 'UTSC MATB24'},
    {text: "Brush up on your algebraic manipulation.", author: "Nick Cheng", cite: 'UTSC CSCB36'},
    {text: "I don't want to see you again.", author: "Nick Cheng", cite: 'UTSC CSCB36'}
];

var quote = quotes[Math.floor(Math.random() * quotes.length)];
var htmlquotetext = '<p class="mb-0">' + quote.text + '</p>';
var htmlquotecite = '<cite>' + quote.cite + '</cite>';
var htmlauthor = '<footer class="blockquote-footer">' + quote.author + ', ' + htmlquotecite + '</footer>';
var html = '<blockquote style="padding:0; border-left:0;">' + htmlquotetext + htmlauthor + '</blockquote>';
document.getElementById("random_quote").innerHTML = html;
