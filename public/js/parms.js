/* VERSION 19.09.2019 */
/*
 * DEFAULT INPUT ATTRBIUES
[0]['type']['text']('type','text'),
[1]['class'],['form-control mb-1']
[2]['name'],['inputProject']
[3]['id'],['inputProject']
[4]['value'],['']
[5]['placeholder'],['']
[6]['no-readOnly'],['true']
[7]['no-disabled'],['']
[8]['maxlength',['30']
 */

var parmData= new Array();
var currentParmData=new Object();
var scrollY = $(window).innerHeight() - 540;
window.tableHandle = $('#dataTable').DataTable(
{		
  ajax: {
        url: '/getParms',
        method: 'GET',
        deferRender: true,
        dataSrc: "",
        beforeSend: function()
	{ 
            document.getElementById('progressBar').style.display='block';			
	},
	complete: function(answer)
	{
            document.getElementById('progressBar').style.display='none'; 
            //parmData=window.tableHandle.ajax.json();
            parmData=answer.responseJSON;
            console.log(parmData);
	}
  },
  dom: '<"fixedcontrols"Bfr><"row row-overflow"<"col"tip>>',
  "paging": true,
  "pageLength": 100,
  scrollX: true,
  scrollY: scrollY + 'px',
  //scrollY: true,
  buttons: [
    {
        text: '<i class="fa fa-remove"></i> Usuń filtry',
        className: 'btn btn-secondary pl-0',
        action: function (e, dt, node, config)
        {
            dt.search('').draw();
            dt.columns().every(function (id,value)
            {
                $('input', this.footer()).each(function ()
                {
                    //console.log(this.value);
                    this.value='';
                });
            });
            dt.search( '' ).columns().search( '' ).draw();
            window.tableHandle.state.clear();
            dt.ajax.reload();
            alert( 'Filtry usunięte' );  
        }
    }
  ],
  language: {
    search : "Szukaj",
    processing: "Trwa przetwarzanie...",
    lengthMenu: "Pokaż _MENU_ wpisów",
    info: "Wyświetlono użytkowników od _START_ do _END_ z _TOTAL_",
    infoEmpty: "Brak wpisów spełniających kryteria",
    infoFiltered: "(przefiltrowane z _MAX_)",
    loadingRecords: "Trwa wczytywanie...",
    zeroRecords: "Brak wpisów spełniających kryteria",
    emptyTable: "Pusta tabela",
    paginate: {
      previous: "Poprzednia",
      next: "Następna"
    }
  },
  "columnDefs": [
    { "searchable": false, "targets": 4 }, // DISABLE SEARCH IN OPTION COLUMN
    { orderable: false, targets: [4] } // DISABLE ORED IN OPTION COLUMN
    ],
  "columns": [
    {
      data: 'ID'
    },
    {
    data: 'Skrot'
    },
    {
      data: 'Nazwa'
    },
    {
      data: 'Opis'
    },
    {
      "data": null,
      "ordering": false,
      render: function (data)
      {
            return createEditField(data);
      }
      
    }
  ] 
 });

window.tableHandle.columns().every(function (id,value)
{
    var that = this;
    $('input', this.footer()).on('keyup change', function ()
    {
       //console.log(this.value);
        if (that.search() !== this.value)
        {
            that.search(this.value).draw();
        }
    });
});

function createEditField(data)
{
    var inputType='text';
    var maxLength=30;
    var extra='';
    var parseType='';    
    var acl=new Array('readOnly','disabled');
    if(checkPermission('EDIT_PARM')!==-1)
    {
        //console.log('PERM EXIST');
        acl[0]='no-readOnly';
        acl[1]='no-disabled';
    }
    var divErr="<div class=\" mt-1 mb-0 col-sm-auto alert alert-danger\" style=\"display:none;\" id=\"errDiv-parm-"+data.ID+"\"></div>";
    switch(data.Typ)
    {
        case 'p':
                inputType='password'; 
                break;
        case 'a':
                parseType='multiplyEmailAccount';
                maxLength=1024;
                break;
        case 'd':
                break;
        case 't':  
                break;
        case 'n':
                parseType='unsignedinteger';
                inputType='number'; 
                extra="onmouseup=\"parseUnsInt2('"+data.ID+"')\" onkeyup=\"parseUnsInt2('"+data.ID+"')\"";
                break;
        case 'c':
                inputType='checkbox';
                if(data.Wartosc==='1')
                {
                    extra='checked';
                };                
                return "<input "+acl[0]+" "+acl[1]+" id=\"parm-"+data.ID+"\" name=\"parm\" type=\""+inputType+"\" maxlength=\""+maxLength+"\" "+extra+" class=\"form-control\" value=\""+data.Wartosc+"\" onclick=\"changeValue('"+data.ID+"')\")\">";
                break;
        case 'ta':
                //inputType='hidden';
                
                return "<div class=\"w-100\" style=\"width: 1000px\"><button onclick=\"setupAdaptedModalProperties('eParm','"+data.ID+"')\" class=\"btn btn-info\">Edytuj</button></div>";
                break;
        default:
                console.log('---createRowContent() wrong Typ ---\n'+data.Typ);
                break;
    };
    
    return "<input "+acl[0]+" "+acl[1]+" id=\"parm-"+data.ID+"\" name=\"parm\" type=\""+inputType+"\" maxlength=\""+maxLength+"\" "+extra+" class=\"form-control\" value=\""+data.Wartosc+"\"   onblur=\"checkParm('"+data.ID+"','"+parseType+"','"+data.Wartosc+"')\">"+divErr;
        //return "<div class=\"btn-group\"><button class=\"btn btn-secondary\" onclick=\"ajaxGet('sParm','getParm/"+row.ID+"','"+row.ID+"')\">Podgląd</button></div>";
}

function checkPermission(aclCode)
{
    //console.log('---checkPermission()---\n'+aclCode);
    //console.log(acl.indexOf(aclCode));
    return (acl.indexOf(aclCode));
}

function checkParm(id,type,oldvalue)
{
    console.log('---checkParm()---');
    console.log(type);
    var ele=document.getElementById('parm-'+id);
    console.log(ele.value);
    if(oldvalue.trim()!==ele.value.trim())
    {     
        parseFieldValue(ele.value,type,'errDiv-parm-'+id);  
        if(!checkIsErr())
        {
            console.log("NO err -> SEND DATA");
            sendDataDirect('eParm','wartosc='+ele.value+'&id='+id,'');
        }; 
    }
}

$(document).keyup(function(e) {
     if (e.key === "Escape") { // escape key maps to keycode `27`
        // <DO YOUR WORK HERE>
    }
});
$(function () {
  $('.modal-content').keypress(function (e) {
    if (e.which == 13) {
      $(this).find('.btn-enter').trigger('click');
    }
  })
})
function setupAdaptedModalProperties(task,id)
{
    console.log('---setupAdaptedModalProperties()---\n'+task);
    console.log(id);
    // GET DATA FROM JSON RESPONSE
    currentParmData=getDataFromJson('ID',id);
    console.log(currentParmData);
    clearAdaptedComponent();
    $("#adaptedModalBgTitle").addClass("modal-header");
    $("#adaptedModalBgTitle").addClass("bg-info");
    $("#adaptedModalTitle").html("PARAMETR");
    document.getElementById('loadGif').style.display='none'; 
    document.getElementById('adaptedModalBodyTitle').appendChild(createTitle("["+currentParmData.Skrot+"] "+currentParmData.Nazwa));
    $("#adaptedModalInfo").html("<small class=\"text-secondary\">Parameter ID: "+id+"</small>");
    setBodyContent(task,1);           
    $('#adaptedModal').modal('show');
    //console.log($('#adaptedModal')[0]);
}
function getDataFromJson(col,value)
{
    console.log('===getDataFromJson(col,value)===');
    for(var i=0; i<parmData.length; i++)
    {
        //console.log(parmData[i][col]);
        if(parmData[i][col]===value)
        {
            return parmData[i];
           
            
        }
    }
    return 0;
}
function setBodyContent(task,status)
{
    console.log('---setBodyContent()---\nstatus'+status);
    console.log(currentParmData.ID);
    var dataDiv=getForm();
    var form=dataDiv.childNodes[1];
    form.childNodes[1].append(addHiddenInput('id',currentParmData.ID));
    switch(status)
    {
        case 0:
                //BLOCKED WITH DATA
                createRowContent(form.childNodes[1],status);
                document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
            break;
        case 1:
                //EDIT 
                createRowContent(form.childNodes[1],1);
                document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
                //addLegendDiv();
            break;
        default:
            break;
    }
    console.log(dataDiv);
    document.getElementById('adaptedDynamicData').appendChild(dataDiv);
}
function clearAdaptedComponent()
{
    console.log('---clearAdaptedComponent()---');

    removeHtmlChilds('adaptedDynamicData');
    removeHtmlChilds("adaptedButtonsBottom");
    removeHtmlChilds("adaptedModalBodyExtra");
    removeHtmlChilds("adaptedModalInfo");
    
    document.getElementById('errDiv-Adapted-overall').innerText='';
    $('#errDiv-Adapted-overall').hide();
    $("#errDiv-Adapted-overall").css("display", "none");
    document.getElementById('errDiv-Adapted-overall').style.display='none';
    document.getElementById("adaptedModalBodyTitle").innerText='';
    
    $('#adaptedModalBgTitle').removeClass();
}
function createRowContent(whereAppend,status)
{
    console.log('===createRowContent(whereAppend,status)===');
    //console.log(whereAppend);
    //console.log(parmData);
    // HTML TAGS
    console.log('STATUS -> '+status);
    setInputMode(status);
    var div1=new Array(
	Array('class','col-sm-11')
	);
    var divErrAtr=new Array(
            Array('class','col-sm-auto alert alert-danger'),
            Array('id','')
            );
    var divErrStyle=new Array(
            Array('display','none')
            );
        setInputMode(status);
        inputAttribute[0][1]='text';
        inputAttribute[2][1]='parm';
        inputAttribute[3][1]='parm';
        
        inputAttribute[4][1]='';
        inputAttribute[8][1]=30;
        div1Element=createHtmlElement('div',div1,null);
        switch(currentParmData.Typ)
        {
            case 'p':
                inputAttribute[0][1]='password'; 
            case 'a':
            case 't':
                if(currentParmData.Typ==='a')
                {
                    inputAttribute[8][1]=1024;
                }
                inputAttribute[4][1]=currentParmData.Wartosc;
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-parm';
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $(inputElement).keyup(function()
                {
                    if(currentParmData.Typ==='a')
                    {
                        inputAttribute[8][1]=1024;
                        parseFieldValue(this.value,'multiplyEmailAccount','errDiv-parm');
                    }
                    else
                    {
                        parseFieldValue(this,null,null);
                    }
                    
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'n':
                inputAttribute[0][1]='number'; 
                inputAttribute[4][1]=parmData.Wartosc;
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-parm';
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $(inputElement).bind('keyup mouseup', function ()
                {
                    parseFieldValue(this.value,'unsignedinteger','errDiv-parm');
                    parseUnsInt(this);   
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'c':
                div1Element.appendChild(createCheckBox(parmData,status));
                break;
            case 'ta':
                inputAttribute[8][1]=8096;
                inputStyle.push(Array('cols',102));
                inputStyle.push(Array('rows',30));
                console.log(inputStyle);
                inputElement=createHtmlElement('textarea',inputAttribute,inputStyle);
                console.log(inputElement);
                inputElement.innerHTML=currentParmData.Wartosc;
                div1Element.appendChild(inputElement);
                inputStyle.pop();
                inputStyle.pop();
                break;
            default:
                console.log('---createRowContent() wrong Typ ---'+currentParmData.Typ);
                break;
        };
    whereAppend.appendChild(div1Element);
    console.log(div1Element);
}
function parseUnsInt(input)
{
    console.log('---parseUnsInt()---');
    //console.log(input.value);
    if(input.value<1)
    {
        input.value='';
    }
}
function parseUnsInt2(id)
{
    console.log('---parseUnsInt2()---');
    var ele=document.getElementById('parm-'+id);
    //console.log(input.value);
    if(ele.value<1)
    {
        ele.value='';
    }
}
function createBodyButtonContent(task)
{
    console.log('---createBodyButtonContent(task)---\n'+task);
    // GROUP DIV BUTTON
    var divButtonAttribute=new Array(
                Array('class','btn-group pull-right')
                );
    var divButtonElement=createHtmlElement('div',divButtonAttribute,null);
    // END GROUP DIV BUTTON
    // CANCEL BUTTON
    var cancelButtonAtr=new Array(
                Array('class','btn btn-dark pull-right')
                );
    var cancelButton=createHtmlElement('button',cancelButtonAtr,null);
    cancelButton.innerText = "Anuluj";
    cancelButton.onclick = function() { closeModal('adaptedModal'); };
    // ADD BUTTON
    var confirmButtonAtr = new Array(
             Array('class','btn btn-info btn-add'),
             Array('id','confirmData')
            );
    var confirmButton='';

    switch(task)
    {
        case 'eParm':
            divButtonElement.appendChild(cancelButton);
            confirmButtonAtr[0][1]='btn btn-info';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Podgląd';
            //this.parentNode.parentNode.parentNode.parentNode.childNodes[3].childNodes[0].childNodes[0]
            confirmButton.onclick = function() { openNewWindow(document.getElementById('parm').value); };
            divButtonElement.appendChild(confirmButton);
            confirmButtonAtr[0][1]='btn btn-warning';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(confirmButton);
            break;
        default:
            console.log('createBodyButtonContent() - wrong task \n'+task);
            break;
    };
    
    return(divButtonElement);
}
function openNewWindow(el)
{
    //console.log(el.value);
    window.open('', 'Podglad', "height=600,width=800").document.write('<html><head>'+el+'</head></html>');
}
function closeModal(modalId)
{
    $('#'+modalId).modal('hide');
}
function reloadData()
{
    window.tableHandle.ajax.reload(null, false);
}
function postDataToUrl(task)
{
    console.log('---postDataToUrl()---');
    console.log(task);
    var confirmTask=false;
    switch(task)
    {
        case 'eParm':
            parseFieldValue( document.getElementById('parm').value,"parm","errDiv-parm");
            if(checkIsErr())
            {
                console.log("err is true");
                return(0);
            };
            confirmTask=true;
            break;
        default:
            console.log('---postDataToUrl()--- wrong task: '+task);
            break;
    }; 
    if (confirmTask)
    {
        sendData(task);
    };
}
function setupDivError(err)
{
    $('#errDiv-Adapted-overall').html(err);
    $("#errDiv-Adapted-overall").show();
}
function createCheckBox(data,status)
{
    console.log('---createCheckBox()---');
    console.log(data);
    var divAtr=new Array(
            Array('class','col-sm-12 custom-control custom-checkbox mr-sm-2 mt-0 pt-0')
            );
    var div=createHtmlElement('div',divAtr,null);
    var cboxAtr= new Array(
            Array('class','custom-control-input'),
            Array('type','checkbox'),
            Array('name','cbox-'+data.ID),
            Array('id','cbox-'+data.ID),
            Array('value','0'),
            Array('no-checked',''),
            Array('no-disabled',''),
            Array('autocomplete','off')
        );
    var labelAtr=new Array(
            Array('class','custom-control-label'),
            Array('for','cbox-'+data.ID),
            );
    var label=createHtmlElement('label',labelAtr,null);
    label.innerText='NIE';
    if(data.Wartosc==='1')
    {
        label.innerText='TAK';
        cboxAtr[4][1]=1;
        cboxAtr[5][0]='checked';
        
    }
    if(status)
    {
        cboxAtr[6][0]='no-disabled'; 
    };
    var cbox=createHtmlElement('input',cboxAtr,null);
    cbox.onclick=function(){ changeBoxValue(this); };
    
    div.appendChild(cbox);
    div.appendChild(label);
            
    console.log(div);        
    return(div);
}
function changeBoxValue(input)
{
    console.log('---changeBoxValue()---');
    console.log(input.parentNode.childNodes[1]);
    if(input.value==='0')
    {
        console.log('CHANGE TO 1');
        input.value='1';
        input.parentNode.childNodes[1].innerText='TAK';
    }
    else
    {
        console.log('CHANGE TO 0');
        input.value='0';
        input.parentNode.childNodes[1].innerText='NIE';
    };
}
function changeValue(id)
{
    console.log('---changeValue()---');
    var input=document.getElementById('parm-'+id);
    console.log(input.value);
    if(input.value==='0')
    {
        console.log('CHANGE TO 1');
        input.value='1';
        sendDataDirect('eParm','wartosc=1&id='+id,'');
    }
    else
    {
        console.log('CHANGE TO 0');
        input.value='0';
        sendDataDirect('eParm','wartosc=0&id='+id,'');
    };
}
function createTitle(text)
{
    console.log('---createTitle()---');
    //console.log(text);
    var hAtr=new Array(
            Array('class','text-center')
            );
    var h= createHtmlElement('h4',hAtr,null);
    var t = document.createTextNode(text);
    h.appendChild(t);

    //console.log(t);
    return h;
}
/*
console.log('PERMISSION:');
console.log(acl[0]);
console.log(acl); 
 */
