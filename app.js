const WORKER_URL =
"https://notruf-api.keymasterjonas.workers.dev";

let currentNumber = "";
let conversation = [];
let fullConversation = [];
let recognition = null;

let seconds = 0;
let timerInterval;

// Uhrzeit oben

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
).classList.add("hidden");

document.getElementById(
"phoneScreen"
).classList.remove("hidden");

}

function goHome(){

document.getElementById(
"phoneScreen"
).classList.add("hidden");

document.getElementById(
"homeScreen"
).classList.remove("hidden");

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

// Chat

function addMessage(sender,text){

const chat =
document.getElementById("chat");

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

clearInterval(timerInterval);

seconds = 0;

timerInterval = setInterval(() => {

seconds++;

const min =
String(
Math.floor(seconds / 60)
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

// Sprache

function speak(text){

speechSynthesis.cancel();

const utterance =
new SpeechSynthesisUtterance(text);

utterance.lang = "de-DE";
utterance.rate = 0.95;
utterance.pitch = 1;

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
"Browser unterstützt Sprache nicht";

return;

}

document.getElementById(
"status"
).innerText =
"🎤 Hört zu...";

recognition =
new SpeechRecognition();

recognition.lang = "de-DE";

recognition.interimResults =
false;

recognition.continuous =
false;

recognition.start();

recognition.onresult =
function(event){

const text =
event.results[0][0].transcript;

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
"Content-Type":"application/json"
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
"112: " + data.answer
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

// Anruf

function call112(){

if(currentNumber !== "112"){

document.getElementById(
"number"
).innerText =
"Unbekannt";

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

generatePDF();

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
async function generatePDF(){

// PDF Code hier

}
