document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() {
  const script = document.createElement('script');
  script.src = `assets/app.js`;
  document.body.appendChild(script);
}