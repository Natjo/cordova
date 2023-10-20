

(function () {
    function headernav(el) {
        const nav = document.querySelector('nav');
        const btn_nav = document.querySelector('.btn-nav');
        const btn_close = document.querySelector('.btn-close');

        const main_wrapper = document.querySelector(".main-wrapper");

        btn_nav.onclick = () => {
            nav.classList.toggle('active');
            main_wrapper.classList.add("hide-right");
        }
        btn_close.onclick = () => {
            nav.classList.remove('active');
            main_wrapper.classList.add("show");
            main_wrapper.addEventListener('transitionend', () => {
                main_wrapper.classList.remove("show");
                main_wrapper.classList.remove("hide-right");
            }, { once: true })
        }
        this.start = () => {

        }
    }

    window.headernav = headernav;
})();