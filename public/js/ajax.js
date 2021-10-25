/* VERSION 18.09.2019 */
/* AJAX EVENTS */
var stopEmailDownload=0;
var ajaxIdCategory=0;
var ajaxIdEmail=0;
function ajaxGet(task,url,id)
{
    console.log('---ajaxGet()---');
    console.log(url);
    $.ajax(
    {
	url: "/Json/"+url,
	async: true,
	beforeSend: function()
	{
            //load progress bar		
            document.getElementById('progressBar').style.display='block'; 		
	},
	complete: function()
	{
            document.getElementById('progressBar').style.display='none';
	},
        data: {},
        method: 'GET',
        success: function (answer)
        {
            console.log('---AJAX SUCCESS---');
            parseAjaxAnswer(task,id,answer); 
        },
        error: function (request, status, error)
        {
            console.log('---AJAX ERROR---');
            console.log(error+' '+status);
            alert('Something get wrong, contact with administrator');
        }
    }); 
}
function parseAjaxAnswer(task,id,answer)
{
    console.log(answer);
    if(answer.success)
    {
        setupAdaptedModalProperties(task,id,answer);   
    }
    else
    {
        console.log(answer.message);
        alert(answer.message);
    }
}
function ajaxGetDirect(task,url,id)
{
    console.log('---ajaxGetDirect()---');
    console.log(url);
    // check task and stop email download
    if(task==='nEmails' || task==='nEmailsIntVal')
    {
        console.log('---ajaxGetDirect()-'+task+'---\nSTATUS : '+stopEmailDownload);
        if(stopEmailDownload)
        {
            console.log('script already working, exit with 0');
            return 0;
        }
    }
    $.ajax(
    {
	url: "/Json/"+url,
	async: true,
	beforeSend: function()
	{ 
            if(task==='nEmails')
            {
                document.getElementById('progressBar').style.display='block';
            }
            if(task==='nEmails' || task==='nEmailsIntVal')
            {
                stopEmailDownload=1;
                console.log('---ajaxGetDirect()-'+task+'---\nSTART : '+stopEmailDownload);
            }
            //alert('ajax start');
            //Upload progress				
	},
	complete: function()
	{
            if(task==='nEmails')
            {
                document.getElementById('progressBar').style.display='none';
            }
            if(task==='nEmails' || task==='nEmailsIntVal')
            {
                stopEmailDownload=0;
                console.log('---ajaxGetDirect()-'+task+'---\nEND : '+stopEmailDownload);
            }
            //console.log('Synchro complete.');
	},
        data: {},
        method: 'GET',
        success: function (answer)
        {
            console.log('---AJAX SUCCESS---');
            //console.log(answer);  
            reloadData();
            if(task==='getEmlCat')
            {
                reloadEmailCategory(answer.DATA);
            };
        },
        error: function (request, status, error)
        {
            console.log('---AJAX ERROR---');
            console.log(error+' '+status);
            if(task==='nEmails' || task==='nEmailsIntVal')
            {
                stopEmailDownload=1;
                console.log('---ajaxGetDirect()-'+task+'---\nEND WITH ERROR: '+stopEmailDownload);
            }
            showAlert(task);
        }
    }); 
}
function showAlert(task)
{
    if(task==='nEmailsIntVal')
    {
        console.log('Something get wrong, contact with administrator');
    }
    else
    {
        alert('Something get wrong, contact with administrator'); 
    }
}
/*
 * SEND DATA
 */
function sendData(task)
{
    console.log('---sendData()---\n'+task);
    $.ajax({
      url: '/Ajax/'+task,
      data: {

        data: createDataToSend()
      },
        method: 'POST',
        beforeSend: function()
	{ 
            document.getElementById('loadGif').style.display='block';			
	},
	complete: function()
	{
            document.getElementById('loadGif').style.display='none'; 
	},
        success: function (answer)
        {
            // ADD MESSAGE TO USER
            console.log('---AJAX OK---');
            checkAjaxAnswer(answer,task);
            
        },
        error: function (request, status, error)
        {
            console.log('---AJAX ERROR---');
            console.log(error+' '+status);
            setupDivError('[ERROR] Failed! Something has gone wrong. Please contact a system administrator.');
            document.getElementById('loadGif').style.display='none'; 
        }
    });
};
/*
 * SEND DATA DIRECT
 */
function sendDataDirect(task,data,reload)
{
    console.log('---sendDataDirect()---');
    console.log(task);
    $.ajax({
      url: '/Ajax/'+task,
      data: {

        data: data
      },
        method: 'POST',
        beforeSend: function()
	{ 
            document.getElementById('progressBar').style.display='block';			
	},
	complete: function()
	{
            document.getElementById('progressBar').style.display='none'; 
	},
        success: function (answer)
        {
            if(task==='rmEmlCat')
            {
                console.log('REMOVE EMAIL CATEGORY');
                checkAjaxDirectAnswerWithData(answer,reload,task,data);
            }
            else
            {
                checkAjaxDirectAnswer(answer,reload,task);
            }
            
        },
        error: function (request, status, error)
        {
            console.log('---AJAX ERROR---');
            console.log(error+' '+status);
            alert('[ERROR] Failed! Something has gone wrong. Please contact a system administrator.');
        }
    });
};
function createDataToSend()
{
    console.log('---createDataToSend---');
    
    /*
     * DEFAULT FORM NAME = postData
     */
    var htmlForm=document.getElementsByName('postData');
    console.log(htmlForm);
    var fieldName;
    var fieldValue;
    var params = '';
    var amp='';
    for( var i=0; i<htmlForm[0].elements.length; i++ )
    {
        fieldName =htmlForm[0].elements[i].name;
        fieldValue =htmlForm[0].elements[i].value;
        //console.log(i+'| form name: '+fieldName+" form value: "+fieldValue);
        if(i>0) { amp='&';};
        if(fieldName!=='')
        {
            //console.log(fieldName+" - "+fieldValue);
            params += amp+fieldName + '=' + fieldValue; 
        } 
    }
    console.log(params);
    // CREATE Base64
    //params=btoa(params);
    //console.log(params);
    return params;
}
function checkAjaxAnswer(answer,task)
{
    if (answer.success)
    {
        parseMessageToUser(task);
        window.tableHandle.ajax.reload(null, false);
        $('#adaptedModal').modal('hide');
    }
    else
    {
        setupDivError('[ERROR] '+answer.message);
        console.log(answer);
    }
}
function parseMessageToUser(task,answer)
{
    console.log('---parseMessageToUser()---\n'+task);
    switch(task)
    {
    case 'cEmail':
        alert('Wiadomość została wysłana');
        break;
    case 'eEmlCat':
        console.log('Uaktualniono kategorie');
        // RELOAD EMAIL CATEGORY
        
        ajaxGetDirect('getEmlCat','getEmlCat',null); //getEmlCat
        break;
    case 'saveUserToEvent':
            alert(answer.message);
        break;
    default:
        alert('[OK] Zmiany zostały zapisane');
        break;
        //return ('Zapisano zmiany');
    };
}
function checkAjaxDirectAnswer(answer,reload,task)
{
    console.log('---checkAjaxDirectAnswer---\n'+task);
    console.log('reload - '+reload);
    if (answer.success)
    {
        if(reload)
        {
            parseMessageToUser(task,answer);
            
        }
    }
    else
    {
        alert(answer.message);
    }
    if(reload)
    {
        reloadData();
    }
    else
    {
        //
    }
    
}
function checkAjaxDirectAnswerWithData(answer,reload,task,data)
{
    console.log('---checkAjaxDirectAnswerWithData---\n'+task);
    console.log('answer : ');
    console.log(answer);
    console.log(answer.success);
    console.log(answer.message);
    console.log('reload - '+reload);
    console.log('data - '+data);
    var value=data.split("&");
    var dataArray=new Array();
    var tmp='';
    var ele='';
    for (var index = 0; index < value.length; index++)
    {
        tmp=value[index].split("=");
        dataArray.push(tmp[1]);
    }
    console.log('dataArray[0] - '+dataArray[0]);
    console.log('dataArray[1] - '+dataArray[1]);
    if(task==='rmEmlCat')
    {
        ele=document.getElementById(dataArray[1]);
        if(answer.success===false)
        {
            
            ele.innerText=answer.message;
            ele.style.display='block'; 
        }
        else
        {
            // remove row from form
            console.log(ele.parentNode);
            removeHtmlElement(ele.parentNode);
            ajaxGetDirect('getEmlCat','getEmlCat',null); //getEmlCat
        }
        
    }
}
function setupDivError(err)
{
    $('#errDiv-Adapted-overall').html(err);
    $("#errDiv-Adapted-overall").show();
}
function reloadEmailCategory(cat)
{
    console.log('---reloadEmailCategory()---');
    console.log(cat);
    var catEml=document.getElementById('EMAIL_CATEGORY');
    console.log(catEml);
    
    removeHtmlChilds("EMAIL_CATEGORY");
   
    // ajax (json) get all email category
    // run for loop
    var href='';
    var icoAtr=new Array(
            Array('class',''),
            Array('aria-hidden','true')
            );
    var hrefAtr=new Array(
            Array('href','#'),
            Array('class','list-group-item list-group-item-action'),
            Array('ID','')
            );
    var active='';
    //echo "<a href=\"#\" class=\"list-group-item list-group-item-action ${active} \" ID=\"".$value['ID']."\" onclick=\"setEmailActiveCategory(this)\"><i class=\"".$value['ICO']."\" aria-hidden=\"true\"></i>&nbsp".$value['NAME']."</a>";
    $.each(cat, function (index, value)
    {
        //console.log(value.SHORTCUT);
        if(value.SHORTCUT==='EML_ANSWER')
        {
            active='active';
        }
        else
        {
            active='';
        }
        href+="<a href=\"#\" class=\"pl-1 list-group-item list-group-item-action "+active+" \" title=\""+value.NAME+"\" ID=\""+value['ID']+"\" onclick=\"setEmailActiveCategory(this)\"><i class=\""+value['ICO']+"\" aria-hidden=\"true\"></i>&nbsp"+value['NAME']+"</a>";
    });
    catEml.innerHTML=href;
}