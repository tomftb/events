function getResolution()
{
	var span = document.getElementById("rozdzielczosc");
	var marginTopFormAuth=0;

	document.getElementById("rozdzielczosc").innerHTML = "Rozdzielczość: " + screen.width + " x " + screen.height;
	if(screen.height>380)
	{
		marginTopFormAuth=Math.round((screen.availHeight-380)/3,0);
		//document.getElementById("mainFormDiv").style.marginTop = marginTopFormAuth+"px";
	}
	else
	{
		marginTopFormAuth=0;
	};
}