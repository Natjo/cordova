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
    playButton.onclick = () => play(yodelBuffer);
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
  function strate_dashboard(el) {
    this.start = () => {};
    this.onleave = () => {};
  }
  window.strate_dashboard = strate_dashboard;
})();
(function () {
  function strate_news(el) {
    const result = el.querySelector('ul');
    const main_wrapper = document.querySelector(".main-wrapper");
    const panel = document.querySelector('.panel');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "https://livrable.lonsdale.fr/cordova/test.json");
    xhr.send();
    xhr.onload = () => {
      const data = JSON.parse(xhr.response);
      let html = "";
      for (let i = 0; i < data.news.length; i++) {
        const item = data.news[i];
        html += `
                <li data-index="${i}">
                    <div class="card-news">
                        <h3 class="tl3">${item.title}</h3> 
                        <time>${item.date}<time>
                        <img src="${item.image}">
                    </div>
                </li>`;
      }
      result.innerHTML = html;
      result.querySelectorAll("li").forEach(element => {
        element.onclick = () => {
          const num = Number(element.dataset.index);
          const item = data.news[num];
          const html = `
                        <h1 class="tl2">${item.title}</h1> 
                        <time>${item.date}<time>
                        <div class="chapo">${item.chapo}<div>
                        <img src="${item.image}">
                        <div class="rte">${item.image}</div> 
                    </div>`;
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
          panel.querySelector('.page-content').innerHTML = html;
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
    const template = selector;
    const clone = template.content.cloneNode(true);
    const div = document.createElement("div");
  }
  function getTemplate1(selector, args) {
    const template = selector;
    const clone = template.content.cloneNode(true);
    return eval("`" + clone.firstElementChild.innerHTML + "`");
  }
  function strate_realisation(el) {
    const result = el.querySelector('ul');
    const main_wrapper = document.querySelector(".main-wrapper");
    const panel = document.querySelector('.panel');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', "https://livrable.lonsdale.fr/cordova/test.json");
    xhr.send();
    xhr.onload = () => {
      const data = JSON.parse(xhr.response);
      for (let i = 0; i < data.news.length; i++) {
        const item = data.news[i];
        const args = {
          title: item.title,
          date: item.date,
          image: item.image
        };
        const card = `<li>${getTemplate1(el.querySelector(".tpl-card-realisation"), args)}</li>`;
        result.insertAdjacentHTML('beforeend', card);
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
            chapo: item.chapo,
            image: item.image,
            text: item.text
          };
          const page = getTemplate1(el.querySelector(".tpl-content-realisation"), args);
          panel.querySelector('.panel-content').innerHTML = page;
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
const nav = document.querySelector('nav');
const links = document.querySelectorAll("a");
const mains = document.querySelectorAll('main');
const main_wrapper = document.querySelector('.main-wrapper');
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
    }
  };
});
document.querySelectorAll('[data-module]').forEach(section => {
  const name = section.dataset.module.replace("-", "_");
  modules[name] = new window[name](section);
});
page();