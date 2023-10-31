(function () {
  function sampler() {
    function init() {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      const filenames = {
        'kick': 'assets/mp3/kick.wav',
        'snare': 'assets/mp3/snare.wav',
        'closed-hat': 'assets/mp3/closed_hat.wav',
        'ride': 'assets/mp3/ride.wav',
        'crash': 'assets/mp3/crash.wav',
        'open-hat': 'assets/mp3/open_hat.wav',
        'high-tom': 'assets/mp3/high_tom.wav',
        'mid-tom': 'assets/mp3/mid_tom.wav',
        'low-tom': 'assets/mp3/low_tom.wav'
      };
      const muteGroups = {
        'hihat': ['closed-hat', 'open-hat']
      };
      Sampler.init(audioContext, filenames, muteGroups);
    }
    var Sampler = {
      init: function (context, filenames, muteGroups) {
        this.output = context.createGain();
        this.output.connect(audioContext.destination);
        this.pads = {};
        this.screenPads = document.querySelectorAll('.padGrid-pad');
        let i = 0;
        for (let name in filenames) {
          let pad = Object.create(SamplePad);
          pad.setup(context, name, filenames[name]);
          pad.connect(this.output);
          pad.addTarget(this.screenPads[i]);
          this.screenPads[i].samplerPad = pad;
          this.pads[name] = pad;
          i++;
        }
        this.muteGroups = {};
        for (let groupName in muteGroups) {
          this.createMuteGroup(groupName, muteGroups[groupName]);
        }
        var masterSlider = Object.create(GainSlider);
        masterSlider.connect(document.querySelector('#master'), this.output.gain);
      },
      createMuteGroup: function (name, padNames) {
        let pads = {};
        for (let padName of padNames) {
          pads[padName] = this.pads[padName];
        }
        let muteGroup = Object.create(MuteGroup);
        muteGroup.create(pads, name);
        if (name in this.muteGroups) {
          this.muteGroups[name].destroy();
        }
        this.muteGroups[name] = muteGroup;
      },
      deleteMuteGroup: function (name) {
        this.muteGroups[name].destroy();
        delete this.muteGroups[name];
      },
      disableMuteGroup: function (name) {
        this.muteGroups[name].disable();
      },
      enableMuteGroup: function (name) {
        this.muteGroups[name].enable();
      },
      triggerPads: function (clickEvent) {
        clickEvent.target.classList.add("click");
        for (let pad of Object.values(clickEvent.target.samplerPads)) {
          pad.playSample();
        }
      }
    };
    var SamplePad = {
      setup: function (audioContext, name, filename) {
        this.context = audioContext;
        this.name = name;
        this.muteGroups = {};
        this.targets = {};
        this.createSignalPath();
        this.loadSample(filename);
      },
      createSignalPath: function () {
        this.muteGain = this.context.createGain();
        this.gain = this.context.createGain();
        this.send = this.context.createGain();
        this.muteGain.connect(this.gain);
        this.gain.connect(this.send);
      },
      loadSample: function (filename) {
        var receiveAudio = function (request) {
          if (request.readyState === 4 && request.status === 200) {
            const audioData = request.response;
            var successFunction = function (buffer) {
              this.buffer = buffer;
            };
            var errorFunction = function (e) {
              "Error decoding audio file." + e.err;
            };
            request.removeEventListener('readystatechange', receiveAudio, false);
            this.context.decodeAudioData(audioData, successFunction.bind(this), errorFunction);
          }
        };
        const request = new XMLHttpRequest();
        request.open('GET', filename, true);
        request.responseType = 'arraybuffer';
        request.addEventListener('readystatechange', receiveAudio.bind(this, request), false);
        request.send();
      },
      playSample: function () {
        if (this.buffer) {
          const source = this.context.createBufferSource();
          source.buffer = this.buffer;
          source.connect(this.muteGain);
          this.unMute();
          this.triggerMuteGroups();
          source.start();
        }
      },
      mute: function () {
        this.muteGain.gain.value = 0;
      },
      unMute: function () {
        this.muteGain.gain.value = 1;
      },
      connect: function (destination) {
        this.gain.connect(destination);
      },
      connectSend: function (destination) {
        this.send.connect(destination);
      },
      addMuteGroup: function (group) {
        this.muteGroups[group.name] = group;
      },
      removeMuteGroup: function (group) {
        delete this.muteGroups[group.name];
      },
      triggerMuteGroups: function () {
        for (let groupName in this.muteGroups) {
          this.muteGroups[groupName].trigger(this);
        }
      },
      addTarget: function (target) {
        this.targets[target.name] = target;
        if (!('samplerPads' in target)) {
          target.samplerPads = {};
          target.addEventListener('click', Sampler.triggerPads, false);
          target.classList.add("click");
          target.addEventListener('animationend', () => {
            target.classList.remove("click");
          });
        }
        target.samplerPads[this.name] = this;
      },
      removeTarget: function (target) {
        delete this.targets[target.name];
        delete target.samplerPads[this.name];
        if (Object.keys(target.samplerPads).length === 0) {
          delete target.samplerPads;
          target.removeEventListener('click', Sampler.triggerPads, false);
        }
      },
      clearTargets: function () {
        for (let target in this.targets) {
          this.removeTarget(target);
        }
      },
      setTarget: function (target) {
        this.clearTargets();
        this.addTarget(target);
      }
    };
    var MuteGroup = {
      create: function (pads, name) {
        this.pads = pads;
        this.name = name;
        for (let padName in pads) {
          pads[padName].addMuteGroup(this);
        }
        this.active = true;
      },
      destroy: function () {
        for (let name in this.pads) {
          this.pads[name].removeMuteGroup(this);
        }
        this.active = false;
      },
      disable: function () {
        this.active = false;
      },
      enable: function () {
        this.active = true;
      },
      trigger: function (playing) {
        if (this.active) {
          for (let name in this.pads) {
            if (this.pads[name] !== playing) {
              this.pads[name].mute();
            }
          }
        }
      }
    };
    var GainSlider = {
      input: null,
      connect: function (input, target) {
        this.setTarget(target);
        this.setInput(input);
      },
      setTarget: function (gain) {
        this.target = gain;
      },
      setInput: function (input) {
        if (this.input) {
          this.input.removeEventListener('input', this.handleInput.bind(this), false);
        }
        this.input = input;
        this.input.addEventListener('input', this.handleInput.bind(this), false);
      },
      handleInput: function (inputEvent) {
        if (inputEvent.target.value > 1) {
          this.target.value = 1;
        } else if (inputEvent.target.value < -1) {
          this.target.value = -1;
        } else {
          this.target.value = inputEvent.target.value;
        }
      }
    };
    init();
  }
  window.sampler = sampler;
})();
(function () {
  function headernav(el) {
    const nav = document.querySelector('nav');
    const btn_nav = document.querySelector('.btn-nav');
    const btn_close = document.querySelector('.btn-close');
    const main_wrapper = document.querySelector(".main-wrapper");
    btn_nav.onclick = () => {
      nav.classList.toggle('active');
      main_wrapper.classList.add("hide-right");
    };
    btn_close.onclick = () => {
      nav.classList.remove('active');
      main_wrapper.classList.add("show");
      main_wrapper.addEventListener('transitionend', () => {
        main_wrapper.classList.remove("show");
        main_wrapper.classList.remove("hide-right");
      }, {
        once: true
      });
    };
    this.start = () => {};
  }
  window.headernav = headernav;
})();
(function () {
  function mp3() {
    const URL = 'assets/mp3/applause.wav';
    const context = new AudioContext();
    const playButton = document.querySelector('#play');
    let yodelBuffer;
    window.fetch(URL).then(response => response.arrayBuffer()).then(arrayBuffer => context.decodeAudioData(arrayBuffer)).then(audioBuffer => {
      playButton.disabled = false;
      yodelBuffer = audioBuffer;
    });
    playButton.onclick = () => {
      playButton.classList.add('click');
      playButton.addEventListener('transitionend', () => {
        playButton.classList.remove('click');
      });
      play(yodelBuffer);
    };
    function play(audioBuffer) {
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.start();
    }
  }
  function hero_homepage(el) {
    mp3();
    this.start = () => {};
  }
  window.hero_homepage = hero_homepage;
})();
(function () {
  function nav_anchor(el) {
    const btns = el.querySelectorAll('button');
    btns.forEach(btn => {
      btn.onclick = () => {
        document.querySelector(`#${btn.value}`).scrollIntoView({
          behavior: "smooth"
        });
      };
    });
    this.start = () => {};
  }
  window.nav_anchor = nav_anchor;
})();
(function () {
  function strate_camera(el) {
    const btn_camera = document.getElementById('btn-camera');
    const btn_photolib = document.getElementById('btn-photolib');
    const btn_videolib = document.getElementById('btn-videolib');
    btn_camera.ontouchstart = () => btn_camera.classList.add("touchStart");
    btn_photolib.ontouchstart = () => btn_photolib.classList.add("touchStart");
    btn_videolib.ontouchstart = () => btn_videolib.classList.add("touchStart");
    btn_camera.ontouchend = () => btn_camera.classList.remove("touchStart");
    btn_photolib.ontouchend = () => btn_photolib.classList.remove("touchStart");
    btn_videolib.ontouchend = () => btn_videolib.classList.remove("touchStart");
    btn_camera.onclick = () => exampleOneClicked(btn_camera.nextElementSibling);
    btn_photolib.onclick = () => exampleTwoClicked(btn_photolib.nextElementSibling);
    btn_videolib.onclick = () => exampleFourClicked(btn_videolib.nextElementSibling);
    function exampleOneClicked(img) {
      let pictureOptions = {
        cameraDirection: Camera.Direction.FRONT,
        saveToPhotoAlbum: false,
        destinationType: Camera.DestinationType.DATA_URL,
        quality: 60
      };
      function fctSuccess(image) {
        img.src = `data:image/jpeg;base64,${image}`;
      }
      function fctFailure(errorMsg) {
        console.log(errorMsg);
      }
      navigator.camera.getPicture(fctSuccess, fctFailure, pictureOptions);
    }
    function exampleTwoClicked(img) {
      let pictureOptions = {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true
      };
      function fctSuccess(image) {
        img.src = image;
      }
      function fctFailure(errorMsg) {
        console.log(errorMsg);
      }
      navigator.camera.getPicture(fctSuccess, fctFailure, pictureOptions);
    }
    function exampleThreeClicked(img) {
      let pictureOptions = {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        popoverOptions: new CameraPopoverOptions(0, 200, 300, 400, Camera.PopoverArrowDirection.ARROW_UP, 0, 0)
      };
      function fctSuccess(image) {
        img.src = image;
      }
      function fctFailure(errorMsg) {
        console.log(errorMsg);
      }
      navigator.camera.getPicture(fctSuccess, fctFailure, pictureOptions);
      function updatePopOverLocation() {
        let cameraPopoverHandle = new CameraPopoverHandle();
        let cameraPopoverOptions = new CameraPopoverOptions(100, 300, 300, 600, Camera.PopoverArrowDirection.ARROW_DOWN, 0, 0);
        cameraPopoverHandle.setPosition(cameraPopoverOptions);
      }
      window.setTimeout(updatePopOverLocation, 4000);
    }
    function exampleFourClicked(vdo) {
      let pictureOptions = {
        mediaType: Camera.MediaType.VIDEO,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
      };
      function fctSuccess(video) {
        vdo.src = video;
      }
      function fctFailure(errorMsg) {
        console.log(errorMsg);
      }
      navigator.camera.getPicture(fctSuccess, fctFailure, pictureOptions);
    }
    this.start = () => {};
  }
  window.strate_camera = strate_camera;
})();
(function () {
  function strate_dashboard(el) {
    this.start = () => {};
    this.onleave = () => {};
  }
  window.strate_dashboard = strate_dashboard;
})();
(function () {
  function getTemplate(selector, args) {
    const template = document.getElementById(selector);
    const clone = template.content.cloneNode(true);
    return eval("`" + clone.firstElementChild.innerHTML + "`");
  }
  function strate_news(el) {
    const result = el.querySelector('ul');
    const main_wrapper = document.querySelector(".main-wrapper");
    const panel = document.querySelector('.panel');
    const panel_content = panel.querySelector('.panel-content');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "https://livrable.lonsdale.fr/cordova/test.json");
    xhr.send();
    xhr.onload = () => {
      const data = JSON.parse(xhr.response);
      for (let i = 0; i < data.news.length; i++) {
        const item = data.news[i];
        const args = {
          title: item.title,
          data: item.date,
          desc: item.desc,
          image: item.image
        };
        result.insertAdjacentHTML('beforeend', `<li>${getTemplate("tpl-card-news", args)}</li>`);
      }
      result.querySelectorAll("li").forEach((element, num) => {
        element.onclick = () => {
          const item = data.news[num];
          panel.querySelector('.btn-back').onclick = () => {
            panel.classList.remove("display");
            main_wrapper.classList.add("show");
            main_wrapper.addEventListener('transitionend', () => {
              main_wrapper.classList.remove("show");
              main_wrapper.classList.remove("hide");
            }, {
              once: true
            });
          };
          const args = {
            title: item.title,
            date: item.date,
            image: item.image,
            text: item.text
          };
          panel_content.innerHTML = getTemplate("tpl-content-news", args);
          panel.classList.add("display");
          main_wrapper.classList.add("hide");
        };
      });
      ;
    };
    this.start = () => {};
  }
  window.strate_news = strate_news;
})();
(function () {
  function getTemplate(selector, args) {
    const template = document.getElementById(selector);
    const clone = template.content.cloneNode(true);
    return eval("`" + clone.firstElementChild.innerHTML + "`");
  }
  function strate_realisation(el) {
    const result = el.querySelector('.strate-content ul');
    const main_wrapper = document.querySelector(".main-wrapper");
    const panel = document.querySelector('.panel');
    const panel_content = panel.querySelector('.panel-content');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "https://livrable.lonsdale.fr/cordova/test.json");
    xhr.send();
    xhr.onload = () => {
      const data = JSON.parse(xhr.response);
      for (let i = 0; i < data.realisations.length; i++) {
        const item = data.realisations[i];
        const args = {
          title: item.title,
          label: item.label,
          image: item.image
        };
        result.insertAdjacentHTML('beforeend', `<li>${getTemplate("tpl-card-realisation", args)}</li>`);
      }
      result.querySelectorAll("li").forEach((element, num) => {
        element.onclick = () => {
          const item = data.realisations[num];
          panel.querySelector('.btn-back').onclick = () => {
            panel.classList.remove("display");
            main_wrapper.classList.add("show");
            main_wrapper.addEventListener('transitionend', () => {
              main_wrapper.classList.remove("show");
              main_wrapper.classList.remove("hide");
            }, {
              once: true
            });
          };
          const args = {
            title: item.title,
            label: item.label,
            video: item.video,
            poster: item.poster,
            image: item.image
          };
          panel_content.innerHTML = getTemplate("tpl-content-realisation", args);
          panel.classList.add("display");
          main_wrapper.classList.add("hide");
        };
      });
      ;
    };
    this.start = () => {};
  }
  window.strate_realisation = strate_realisation;
})();
(function () {
  function strate_sampler(el) {
    window.sampler();
    this.start = () => {};
  }
  window.strate_sampler = strate_sampler;
})();
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
      var mobileRepeatBug = current == 1 && transcript == event.results[0][0].transcript;
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
        const selectedOption = voiceSelect.selectedOptions[0].getAttribute("data-name");
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
    this.start = () => {};
  }
  window.strate_speech = strate_speech;
})();
const nav = document.querySelector('nav');
const links = document.querySelectorAll("a");
const mains = document.querySelectorAll('main');
const main_wrapper = document.querySelector('.main-wrapper');
const splashscreen = document.getElementById('splashscreen');
let slug = '/homepage';
let main_active = mains[0];
let modules = {};
function page() {
  main_active.querySelectorAll('[data-module]').forEach(section => {
    const name = section.dataset.module.replace("-", "_");
    if (typeof modules[name].onleave === 'function') modules[name].onleave();
  });
  mains.forEach(main => {
    if (`/${main.id}` === slug) {
      main.style.display = "block";
      slug = `/${main.id}`;
      main_active = main;
    } else {
      main.style.display = "none";
    }
  });
  main_active.querySelectorAll('[data-module]').forEach(section => {
    const name = section.dataset.module.replace("-", "_");
    if (typeof modules[name].start === 'function') modules[name].start();
  });

}
links.forEach(link => {
  link.onclick = e => {
    e.preventDefault();
    nav.classList.remove('active');
    const isNav = nav.contains(link);
    if (slug !== link.getAttribute('href')) {
      slug = link.getAttribute('href');
      if (isNav) {
        main_wrapper.classList.add("show");
        main_wrapper.addEventListener('transitionend', () => {
          window.scrollTo(0, 0);
          main_wrapper.classList.remove("show");
          main_wrapper.classList.remove("hide");
          main_wrapper.classList.remove("hide-right");
        }, {
          once: true
        });
        page();
      } else {
        main_wrapper.classList.add('fadeout');
        main_wrapper.classList.remove('fadein');
        main_wrapper.addEventListener('transitionend', () => {
          window.scrollTo(0, 0);
          main_wrapper.classList.add('fadein');
          main_wrapper.classList.remove('fadeout');
          page();
        }, {
          once: true
        });
      }
    } else {
      main_wrapper.classList.remove("show");
      main_wrapper.classList.remove("hide");
      main_wrapper.classList.remove("hide-right");
    }
  };
});
document.querySelectorAll('[data-module]').forEach(section => {
  const name = section.dataset.module.replace("-", "_");
  modules[name] = new window[name](section);
});
page();