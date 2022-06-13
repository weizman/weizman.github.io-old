var converter = new showdown.Converter();

var URL_BASE = 'https://weizman.github.io/';
var URL_PATH = location.search.replace('?', '');

if (location.origin.split(':')[1] === '//localhost') {
  // for localhost debugging
  URL_BASE = location.origin + location.pathname;
}

let sidenavOpen = true;

var container;


function hasClass(el, className)
{
  if (el.classList)
    return el.classList.contains(className);
  return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className)
{
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className))
    el.className += " " + className;
}

function removeClass(el, className)
{
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className))
  {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className = el.className.replace(reg, ' ');
  }
}

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
    present('resume');
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

function handleSideNav(hide, sidenav, sidecontent, main) {
  if (sidenavOpen) {
    sidenav.setAttribute('style', 'width: 50px;');
    sidecontent.setAttribute('style', 'display: none;');
    main.setAttribute('style', 'margin-left: 50px;');
    addClass(hide, 'closed');
    sidenavOpen = false;
  } else {
    sidenav.removeAttribute('style');
    sidecontent.removeAttribute('style');
    main.removeAttribute('style');
    removeClass(hide, 'closed');
    sidenavOpen = true;
  }
}
