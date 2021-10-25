function getDataFromUrl()
{
   console.log('getDataFromUrl');
   var xmlhttp = new XMLHttpRequest();
   
    var url = "modul/getJsonData.php?id=1";

    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        myFunction(myArr);
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    function myFunction(arr) {
      var out = "";
      var i;
      for(i = 0; i < arr.length; i++) {
        out += '<a href="' + arr[i].url + '">' + 
        arr[i].display + '</a><br>';
      }
      document.getElementById("id01").innerHTML = out;
    }
   
}
function parseUrlId()
{
    var currentLocation = window.location;
    var res = currentLocation.search.split("=");
    return res[1];
}
function addClass(id)
{
    //console.log("addClass - "+id);
    //$('#li-'+id).addClass("menu-active");
    document.getElementById("li-"+id).setAttribute("class", "menu-active"); 
}
function removeClass()
{
    //console.log("removeClass - ");
    //$( '#li-1' ).removeClass( "menu-active" );
    //$( '#li-2' ).removeClass( "menu-active" );
    //$( '#li-3' ).removeClass( "menu-active" );
    for (i = 1; i < 4; i++)
    { 
       document.getElementById("li-"+i).removeAttribute("class");
    };
    
}
//console.log("headerView");
setMenuActive();


