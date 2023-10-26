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
  setTimeout(() => {
    splashscreen.classList.add('hide');
  }, 1000);
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