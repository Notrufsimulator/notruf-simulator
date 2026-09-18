const WORKER_URL =
"https://notruf-api.keymasterjonas.workers.dev";

let currentNumber = "";
let conversation = [];

let recognition = null;

let seconds = 0;
let timerInterval;

// Uhr

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

// Navigation

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

// Nummernblock

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

// Nachrichten

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

// Timer

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
Math.floor(seconds/60)
).padStart(2,"0");

const sec =
String(
seconds%60
).padStart(2,"0");

document.getElementById(
"timer"
).innerText =
min + ":" + sec;

},1000);

}

// Sprachausgabe

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

// Mikrofon

function startVoice(){

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

document.getElementById(
"status"
).innerText =
"Spracherkennung nicht unterstützt";

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

sendMessage(
text
);

};

}

// KI

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

const answer =
data.answer ||
"Keine Antwort erhalten.";

addMessage(
"112",
answer
);

conversation.push({

role:"assistant",

content:answer

});

document.getElementById(
"status"
).innerText =
"🔊 Spricht...";

speak(
answer
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

// Gespräch starten

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

document.getElementById(
"chat"
).innerHTML = "";

startTimer();

const greeting =
"Notruf 112. Wo befindet sich der Notfall?";

addMessage(
"112",
greeting
);

speak(
greeting
);

setTimeout(() => {

startVoice();

},3500);

}

// Auflegen

function hangup(){

if(recognition){

try{

recognition.stop();

}catch(e){}

}

speechSynthesis.cancel();

clearInterval(
timerInterval
);

conversation = [];

currentNumber = "";

document.getElementById(
"chat"
).innerHTML = "";

document.getElementById(
"number"
).innerText = "";

document.getElementById(
"timer"
).innerText =
"00:00";

document.getElementById(
"status"
).innerText =
"Anruf beendet";

document.getElementById(
"callScreen"
).classList.add(
"hidden"
);

document.getElementById(
"homeScreen"
).classList.remove(
"hidden"
);

}
