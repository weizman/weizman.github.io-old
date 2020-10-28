var converter = new showdown.Converter();

var URL_BASE = 'https://weizman.github.io/website/';
var URL_PATH = location.search.replace('?', '');

if (location.origin === 'http://localhost') {
  // for localhost debugging
  var URL_BASE = location.origin + location.pathname;
}

var container;

function get(url, onload, onerror) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function() {
    if (xhr.readyState === 4 && xhr.status == 200) {
      onload(xhr.responseText);
    }

    if (xhr.status == 404) {
      onerror();
    }
  }
  xhr.send();
}

function loadMarkDown(file, cb) {
  var url = URL_BASE + 'content/md/' + file + '.md';
  get(url, function(text){
    var html = converter.makeHtml(text);
    cb(html);
  }, function() {
    present('about');
  });
}

function present(file) {
  loadMarkDown(file, function(html) {
    container.innerHTML = html;
    hljs.initHighlighting();
  });
}

function setContainer(element) {
  container = element;
}
