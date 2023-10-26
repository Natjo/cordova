

(function () {

    let main;

    function recognition(el) {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition = new SpeechRecognition();
        var text = "";

        recognition.continuous = false;
        recognition.lang = "fr-FR";

        recognition.onresult = function (event) {
            var current = event.resultIndex;
            var transcript = event.results[current][0].transcript;
            var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
            text = transcript.toLowerCase();

            el.querySelector('.result').innerHTML = text;
            if (!mobileRepeatBug) {

                const arr = ['julien', 'johan', 'aurélien', 'sophie', 'anthony', 'léo', 'philippe', 'brian', 'mathieu'];

                let result = null;

                for (let i = 0; i < arr.length; i++) {
                    if (text.includes(arr[i])) {
                        result = arr[i];
                    }
                }
                if (result) {
                    el.querySelector('img').src = `assets/img/people/${result}.png`;


                }
            };

            recognition.onstart = function () { }

            recognition.onspeechend = function () {
                //el.querySelector('.result').innerHTML = "erer" + text
            }

            recognition.onerror = function (event) {
                if (event.error == 'no-speech') {
                };
            }
        }

        const btn_speak = el.querySelector('.btn-speak');
        btn_speak.onclick = () => {
            if (btn_speak.classList.contains('active')) {
                recognition.stop();
                btn_speak.classList.remove('active');
            } else {
                recognition.start();
                btn_speak.classList.add('active');
            }
        }
    }

    function synthesis(el) {
        const synth = window.speechSynthesis;

        const btn_play = el.querySelector("button");
        const inputTxt = main.querySelector(".result");
        const voiceSelect = el.querySelector(".select-voices");
        const langSelect = el.querySelector(".select-lang");
let lang = "en-US";
   

        let voices = [];

        function populateVoiceList() {
            voices = synth.getVoices().sort(function (a, b) {
                const aname = a.name.toUpperCase();
                const bname = b.name.toUpperCase();

                if (aname < bname) {
                    return -1;
                } else if (aname == bname) {
                    return 0;
                } else {
                    return +1;
                }
            });
            
            const selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
            
            voiceSelect.innerHTML = "";

            for (let i = 0; i < voices.length; i++) {
                const option = document.createElement("option");
                option.textContent = `${voices[i].name} (${voices[i].lang})`;
                option.setAttribute("data-lang", voices[i].lang);
                option.setAttribute("data-name", voices[i].name);
                voiceSelect.appendChild(option);
            }
            voiceSelect.selectedIndex = selectedIndex;
        }

        populateVoiceList();

        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }

        function speak() {
            if (synth.speaking) {
                console.error("speechSynthesis.speaking");
                return;
            }

            if (inputTxt.innerText !== "") {
                const utterThis = new SpeechSynthesisUtterance(inputTxt.innerText);
                utterThis.lang = lang;

                utterThis.onend = function (event) {
                    console.log("SpeechSynthesisUtterance.onend");
                };

                utterThis.onerror = function (event) {
                    console.error("SpeechSynthesisUtterance.onerror");
                };

                const selectedOption =
                    voiceSelect.selectedOptions[0].getAttribute("data-name");

                for (let i = 0; i < voices.length; i++) {
                    if (voices[i].name === selectedOption) {
                        utterThis.voice = voices[i];
                        break;
                    }
                }
            
                synth.speak(utterThis);
            }
        }

        btn_play.onclick = function (event) {
            speak();
            inputTxt.blur();
        };

        voiceSelect.onchange = function () {
            speak();
        };
    }

    function strate_speech(el) {
        main = el;
        recognition(el.querySelector('.recognition'));
        synthesis(el.querySelector('.synthesis'));

        this.start = () => {
        }
    }


    window.strate_speech = strate_speech;
})();