

(function () {


    function geoloc(el) {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        function success(pos) {
            const crd = pos.coords;
            el.querySelector('.geoloc-lat').innerHTML = `Latitude : ${crd.latitude}`;
            el.querySelector('.geoloc-lng').innerHTML = `Longitude : ${crd.longitude}`;
            el.querySelector('.geoloc-altitude').innerHTML = `Altitude : ${crd.altitude}`;
            /* console.log("Your current position is:");
             console.log(`Latitude : ${crd.latitude}`);
             console.log(`Longitude: ${crd.longitude}`);
             console.log(`More or less ${crd.accuracy} meters.`);
           console.log(`altitude ${crd.altitude} meters.`);*/
        }

        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }


        el.querySelector('.btn-location').onclick = () => {
            navigator.geolocation.getCurrentPosition(success, error, options);

        }
    }

    function recognition(el) {
        /*  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
          }*/


        var settings = {
            language: "fr-FR",
            showPopup: true
        };

        window.plugins.speechRecognition.requestPermission(function () {
            // Requested
        }, function (err) {
            // Opps, nope
        });
        function toNormalForm(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        }

        const btn_speak = el.querySelector('.btn-speak');
        btn_speak.onclick = () => {
            if (btn_speak.classList.contains('active')) {
                // recognition.stop();
                window.plugins.speechRecognition.stopListening();
                btn_speak.classList.remove('active');
            } else {
                // recognition.start();
                window.plugins.speechRecognition.startListening(function (result) {
                    console.log(result);
                    text = result[0].toLowerCase();
                    el.querySelector('.result').innerHTML = text;

                    const arr = ['julien', 'johan', 'aurélien', 'sophie', 'anthony', 'léo', 'philippe', 'bryan', 'mathieu', 'édouard'];
                    let aze = null;

                    for (let i = 0; i < arr.length; i++) {
                        if (text.includes(arr[i])) {
                           // aze = arr[i].replace("é","è","à","û","e","ù","î","ç");
                            aze = arr[i].replace(/[é]/,"e");
                        }
                    }
                    if (aze) {
                        el.querySelector('img').src = `assets/img/people/${aze}.png`;
                    }
                }, function (err) {
                    console.log(err);
                }, settings);

                btn_speak.classList.add('active');
            }
        }


    }

    function synthesis(el) {
        const synth = window.speechSynthesis;

        const btn_play = el.querySelector(".btn-play");
        const inputTxt = el.querySelector(".result");
        const voiceSelect = el.querySelector(".select-voices");
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

            const selectedIndex = voiceSelect.selectedIndex < 0 ? 8 : voiceSelect.selectedIndex;

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

            if (inputTxt.value !== "") {
                const utterThis = new SpeechSynthesisUtterance(inputTxt.value);
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
        recognition(el);
        synthesis(el);
        geoloc(el);
        this.start = () => {
        }
    }


    window.strate_speech = strate_speech;
})();