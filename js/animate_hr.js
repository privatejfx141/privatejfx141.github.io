function growLine() {
  var elem = document.getElementById("animate_hr");
  var percent = 0;
  var id = setInterval(frame, 15);
  function frame() {
    if (percent == 70) {
      clearInterval(id);
    } else {
      percent++;
      elem.style.width = percent + '%';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  growLine();
}, false);
