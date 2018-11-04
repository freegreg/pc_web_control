var slider = document.getElementById("mySlider");
var output = document.getElementById("sliderValue");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
  onClickButton("id_volume.AF")
}

function onClickButton(clicked_id){
var xhttp;
if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest();
    } else {
    // code for IE6, IE5
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
}
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     
    }
  };
  xhttp.open("GET", clicked_id, true);
  xhttp.send();
}


function onClickButtonShutdown(clicked_id){
	var r = confirm("Are you sure?");
	 if (r == true) {
        onClickButton(clicked_id);
    } else {

    }
}