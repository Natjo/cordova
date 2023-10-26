

(function () {

    function nav_anchor(el) {
        const btns = el.querySelectorAll('button');

        btns.forEach(btn => {
            btn.onclick = () => {
                document.querySelector(`#${btn.value}`).scrollIntoView({ behavior: "smooth"});
            }
        });

        this.start = () => {
        }
    }

    window.nav_anchor = nav_anchor;
})();