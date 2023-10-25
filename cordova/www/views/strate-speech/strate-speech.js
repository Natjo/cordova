(function () {
  function strate_speech(el) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    var text = "";
    recognition.continuous = false;
    recognition.lang = "fr-FR";
    recognition.onresult = function (event) {
      var current = event.resultIndex;
      var transcript = event.results[current][0].transcript;
      var mobileRepeatBug = current == 1 && transcript == event.results[0][0].transcript;
      if (!mobileRepeatBug) {
        text = transcript.toLowerCase();
        el.querySelector('.result').innerHTML = text;
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
      }
      ;
      recognition.onstart = function () {};
      recognition.onspeechend = function () {};
      recognition.onerror = function (event) {
        if (event.error == 'no-speech') {}
        ;
      };
    };
    const btn_speak = el.querySelector('.btn-speak');
    btn_speak.onclick = () => {
      if (btn_speak.classList.contains('active')) {
        recognition.stop();
        btn_speak.classList.remove('active');
      } else {
        recognition.start();
        btn_speak.classList.add('active');
      }
    };
    this.start = () => {};
  }
  window.strate_speech = strate_speech;
})();