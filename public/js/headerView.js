function setMenuActive()
{
    removeClass();
    addClass(parseUrl());
}
function parseUrl()
{
    //console.log('---parseUrl()---');
    var currentLocation = window.location;
    var res = currentLocation.pathname.split("/");
    var last = res.pop();
    
    //console.log(currentLocation);
    //console.log(currentLocation.pathname);
    //console.log(last);
    return last;
}
function addClass(id)
{
    console.log('---addClass()---');
    console.log(id);
    if(id!=='' && id!==null && id!==undefined && id!=='main')
    {
        document.getElementById("showAdmin").setAttribute("class", "menu-active");
        document.getElementById(id).setAttribute("class", "menu-active");
    }
    else
    {
        
        document.getElementById("main").setAttribute("class", "menu-active"); 
    }
}
function removeClass()
{
    var head=document.getElementById("nav-header-menu");
    
    //console.log(head);
    //console.log(head.children);
    for (var i = 0; i < head.children.length; i++)
    {
      //console.log(head.children[i]);
      head.children[i].removeAttribute("class"); 
      
    }
    
    
}
setMenuActive();
