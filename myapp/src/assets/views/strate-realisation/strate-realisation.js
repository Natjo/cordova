

(function () {

    function mp3() {

        const URL = 'assets/mp3/applause.wav';

        const context = new AudioContext();
        const playButton = document.querySelector('#play');

        let yodelBuffer;

        window.fetch(URL)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
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

    function getTemplate(selector, args) {
        const template = selector;
        const clone = template.content.cloneNode(true);
        const div = document.createElement("div");
        // div.innerHTML = eval("`" + clone.firstElementChild.innerHTML + "`");
        // return div;
    }

    function getTemplate1(selector, args) {
        const template = selector;
        const clone = template.content.cloneNode(true);
        return eval("`" + clone.firstElementChild.innerHTML + "`");
    }

    function strate_realisation(el) {
        mp3();
        window.sampler();
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
                    image: item.image,
                }
                const card = `<li>${getTemplate1(el.querySelector(".card-realisation"), args)}</li>`;
                result.insertAdjacentHTML('beforeend', card);
            }

            result.querySelectorAll("li").forEach((element, num) => {
                element.onclick = () => {


                    // const num = Number(element.dataset.index);
                    const item = data.news[num];

                    panel.querySelector('.btn-back').onclick = () => {
                        panel.classList.remove("display");
                        main_wrapper.classList.add("show");
                        main_wrapper.addEventListener('transitionend', () => {
                            main_wrapper.classList.remove("show");
                            main_wrapper.classList.remove("hide");
                        }, { once: true })
                    }

                    // template page to panel
                    const args = {
                        title: item.title,
                        date: item.date,
                        chapo: item.chapo,
                        image: item.image,
                        text: item.text
                    }
                    const page = getTemplate1(el.querySelector(".page-realisation"), args);
                    panel.querySelector('.panel-content').innerHTML = page;

                    panel.classList.add("display");
                    main_wrapper.classList.add("hide");
                }
            });;
        };

        this.start = () => {

        }
    }

    window.strate_realisation = strate_realisation;

})();