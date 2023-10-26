

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
                    image: item.image,
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
                        }, { once: true })
                    }

                    // template page to panel
                    const args = {
                        title: item.title,
                        date: item.date,
                        image: item.image,
                        text: item.text
                    }
                    panel_content.innerHTML = getTemplate("tpl-content-news", args);

                    panel.classList.add("display");
                    main_wrapper.classList.add("hide");
                }
            });;
        };

        this.start = () => {

        }
    }

    window.strate_news = strate_news;
})();