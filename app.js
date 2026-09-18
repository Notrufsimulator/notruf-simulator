const WORKER_URL =
"https://notruf-api.keymasterjonas.workers.dev";

let currentNumber = "";
let conversation = [];
let fullConversation = [];

let recognition = null;

let seconds = 0;
let timerInterval;

// --------------------
// UHR
// --------------------

function updateClock(){

const now = new Date();

const hours =
String(now.getHours())
.padStart(2,"0");

const minutes =
String(now.getMinutes())
.padStart(2,"0");

document.getElementById("clock")
.innerText =
hours + ":" + minutes;

}

setInterval(updateClock,1000);

updateClock();

// --------------------
// NAVIGATION
// --------------------

function openPhone(){

document.getElementById(
"homeScreen"
).classList.add(
"hidden"
);

document.getElementById(
"phoneScreen"
).classList.remove(
"hidden"
);

}

function goHome(){

document.getElementById(
"phoneScreen"
).classList.add(
"hidden"
);

document.getElementById(
"homeScreen"
).classList.remove(
"hidden"
);

}

// --------------------
// TASTATUR
// --------------------

function add(number){

currentNumber += number;

document.getElementById(
"number"
).innerText =
currentNumber;

}

function removeDigit(){

currentNumber =
currentNumber.slice(0,-1);

document.getElementById(
"number"
).innerText =
currentNumber;

}

// --------------------
// CHAT
// --------------------

function addMessage(sender,text){

const chat =
document.getElementById(
"chat"
);

const cssClass =
sender === "Du"
? "user"
: "operator";

chat.innerHTML +=
`
<div class="message ${cssClass}">
<b>${sender}:</b><br>
${text}
</div>
`;

chat.scrollTop =
chat.scrollHeight;

}

// --------------------
// TIMER
// --------------------

function startTimer(){

clearInterval(
timerInterval
);

seconds = 0;

timerInterval =
setInterval(() => {

seconds++;

const min =
String(
Math.floor(
seconds / 60
)
).padStart(2,"0");

const sec =
String(
seconds % 60
).padStart(2,"0");

document.getElementById(
"timer"
).innerText =
min + ":" + sec;

},1000);

}

// --------------------
// SPRACHE
// --------------------

function speak(text){

speechSynthesis.cancel();

const utterance =
new SpeechSynthesisUtterance(
text
);

utterance.lang =
"de-DE";

utterance.rate =
0.95;

utterance.pitch =
1;

const voices =
speechSynthesis.getVoices();

const germanVoice =
voices.find(v =>
v.lang.startsWith("de")
);

if(germanVoice){

utterance.voice =
germanVoice;

}

speechSynthesis.speak(
utterance
);

}

// --------------------
// MIKROFON
// --------------------

function startVoice(){

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

document.getElementById(
"status"
).innerText =
"Spracherkennung wird nicht unterstützt";

return;

}

recognition =
new SpeechRecognition();

recognition.lang =
"de-DE";

recognition.continuous =
false;

recognition.interimResults =
false;

document.getElementById(
"status"
).innerText =
"🎤 Hört zu...";

recognition.start();

recognition.onresult =
function(event){

const text =
event.results[0][0]
.transcript;

addMessage(
"Du",
text
);

fullConversation.push(
"DU: " + text
);

sendMessage(
text
);

};

}

// --------------------
// KI
// --------------------

async function sendMessage(text){

conversation.push({

role:"user",

content:text

});

document.getElementById(
"status"
).innerText =
"🤖 Antwortet...";

try{

const response =
await fetch(
WORKER_URL,
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
messages:conversation
})
}
);

const data =
await response.json();

addMessage(
"112",
data.answer
);

fullConversation.push(
"112: " +
data.answer
);

conversation.push({

role:"assistant",

content:data.answer

});

document.getElementById(
"status"
).innerText =
"🔊 Spricht...";

speak(
data.answer
);

setTimeout(() => {

startVoice();

},4000);

}catch(error){

addMessage(
"112",
"Verbindung zur Leitstelle nicht möglich."
);

}

}

// --------------------
// ANRUF
// --------------------

function call112(){

if(
currentNumber !== "112"
){

document.getElementById(
"number"
).innerText =
"Nummer unbekannt";

return;

}

document.getElementById(
"phoneScreen"
).classList.add(
"hidden"
);

document.getElementById(
"callScreen"
).classList.remove(
"hidden"
);

conversation = [];

fullConversation = [];

startTimer();

const greeting =
"Notruf 112. Wo befindet sich der Notfall?";

addMessage(
"112",
greeting
);

fullConversation
