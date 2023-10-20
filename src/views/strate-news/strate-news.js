

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
                        }, { once: true })
                    }
                    panel.querySelector('.page-content').innerHTML = html;

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