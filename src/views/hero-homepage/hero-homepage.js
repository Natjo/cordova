

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

    function hero_homepage(el) {
        mp3();

        this.start = () => {

        }
    }

    window.hero_homepage = hero_homepage;

})();