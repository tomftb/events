/* VERSION 19.09.2019 */
console.log(acl);

if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign (target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

var scrollY = $(window).innerHeight() - 540;
const perm = {
    ADD_ROLE : 'disabled',
    SHOW_ROLE : 'disabled',
    SHOW_USER_ROLE : 'disabled',
    EDIT_ROLE : 'disabled',
    DEL_ROLE : 'disabled'
};
setPermission();
var roleTab=new Array();
var roleData=0;
// FIELDS
var inputFields=new Array(
        new Array('hidden','','id'),
        new Array('t','Nazwa:','nazwa'),
        new Array('c-uprawnienia','Uprawnienia:','uprawnienia')
    );
    
window.tableHandle = $('#dataTable').DataTable(
{
  ajax: {
        url: '/getRole',
        method: 'GET',
        deferRender: true,
        "dataSrc": ""
  },
  dom: '<"fixedcontrols"Bfr><"row row-overflow"<"col"tip>>',
  "paging": true,
  "pageLength": 100,
  scrollX: true,
  scrollY: scrollY + 'px',
  buttons: [
        {
            
            collectionLayout: 'fixed two-column',
            text: '<i class="fa fa-plus"></i> Dodaj role',
            className: 'btn btn-info '+perm['ADD_ROLE'],
            action:function ()
            {
                createAdaptedModal('cRole',null);
            }
        },
        {
            text: '<i class="fa fa-remove"></i> Usuń filtry',
            className: 'btn btn-secondary ml-0',
            action: function (e, dt, node, config)
            {
                dt.search('').draw();
                $("input[id^='th-search-input']").each(function () {
                    $(this)[0].value='';

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
    info: "Wyświetlono dane od _START_ do _END_ z _TOTAL_",
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
    { "searchable": false, "targets": 2 }, // DISABLE SEARCH IN OPTION COLUMN
    { orderable: false, targets: [2] } // DISABLE ORED IN OPTION COLUMN
    ],
  "columns": [
    {
      data: 'ID',
      "width": "30px"
    },
    {
      data: 'Nazwa'
    },
    {
      "data": null,
      "width": "300px",
      "ordering": false,
      render: function (data, type, row)
      {
        //console.log(row);
        return createButton(data, type,row);
      }
    }
  ] 
 });
 
window.tableHandle.columns().every(function (id,value)
{
    //console.log('---columns().every---');
    var that = this;
    $('input', this.footer()).on('keyup change', function ()
    {
        console.log(this.value);
        if (that.search() !== this.value)
        {
            that.search(this.value).draw();
        }
    });
});

function createButton(data, type, row)
{
    //console.log('---createButton()---');
    //console.log(row.ID);
    if (type === 'display')
    {
        return "<div class=\"btn-group\"><button class=\"btn btn-warning "+perm['SHOW_ROLE']+" \" "+perm['SHOW_ROLE']+" onclick=\"createAdaptedModal('eRole',"+row.ID+")\">Podgląd</button><button "+perm['SHOW_USER_ROLE']+" class=\"btn btn-info "+perm['SHOW_USER_ROLE']+" \"  onclick=\"createAdaptedModal('uRole',"+row.ID+")\">Użytkownicy</button><button  "+perm['DEL_ROLE']+" class=\"btn btn-danger "+perm['DEL_ROLE']+" \"  onclick=\"createAdaptedModal('dRole',"+row.ID+")\">Usuń</button></div>";
    }
    else
    {
        return ''; // NO UPR
    };
}
function createAdaptedModal(task,id)
{
    console.log('---createAdaptedModal()---');
    console.log(id);
    ajaxGet(task,setUrl(task,id),id);
}
function setUrl(task,id)
{
    var url='';
    switch(task)
    {
        case 'cRole':
            url='getPermsForRole';
            break;
        case 'eRole':
            url='getPermsRole';
            break;
        case 'uRole':
        case 'dRole':
            url='getRoleUsers';
            break;
    default:
      break;
    }
    if(id!==null)
    {
        url=url+"/"+id;
    }      
    return url;
}
$(document).keyup(function(e) {
    //console.log("---keyup()---");
    var key=e.key;
    //console.log(key);
    if ( key === "Escape")
    { // escape key maps to keycode `27`
        // <DO YOUR WORK HERE>
    }
});
console.log('---end script()---');

function setupAdaptedModalProperties(task,id,data)
{
    console.log('---setupAdaptedModalProperties()---\nTASK: '+task);
    clearAdaptedComponent();
    $("#adaptedModalBgTitle").addClass("modal-header");
    switch(task)
    {
        case 'eRole':
                $("#adaptedModalBgTitle").addClass("bg-warning");
                $("#adaptedModalTitle").html("UPRAWNIENIA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Role ID: "+id+"</small>");
                roleData=data.ROLE;
                roleTab=data.PERMROLE;               
                setBodyContent('details',0);
            break;
        case 'cRole':
                $("#adaptedModalBgTitle").addClass("bg-info");
                $("#adaptedModalTitle").html("NOWA ROLA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Role ID: NEW</small>");
                roleTab=data.PERM; 
                setBodyContent(task,1);
            break;
        case 'dRole':
                $("#adaptedModalBgTitle").addClass("bg-danger");
                $("#adaptedModalTitle").html("USUWANIE ROLI");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Role ID: "+id+"</small>");
                setBodyContent2(task,data.USERS,data.ROLE[0]);
            break;
        case 'uRole':
                $("#adaptedModalBgTitle").addClass("bg-info");
                $("#adaptedModalTitle").html("UŻYTKOWNICY ROLI");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Role ID: "+id+"</small>");
                setBodyContent2(task,data.USERS,data.ROLE[0]);
                 //$('#adaptedModal').modal('show');
                break;
        default:
                console.log('---wrong task()---');
            break;
    }
    console.log(document.getElementById('adaptedModalBgTitle'));
    $('#adaptedModal').modal('show');
}
//---------------------------------
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
    document.getElementById('loadGif').style.display='none'; 
}
function createBodyButtonContent(task)
{
    console.log('---createBodyButtonContent()---\n'+task);
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
            Array('no-disabled',''),
            Array('id','confirmData'),        
            );
    var confirmButton='';
    divButtonElement.appendChild(cancelButton);
    switch(task)
    {
        case 'cRole':
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = "Dodaj";
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(confirmButton);
            break;
        case 'details':
            
            confirmButtonAtr[0][1]='btn btn-info '+perm['EDIT_ROLE'];
            confirmButtonAtr[1][0]=perm['EDIT_ROLE'];
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function()
            {
                removeHtmlChilds('adaptedDynamicData');
                removeHtmlChilds('adaptedButtonsBottom');
                setBodyContent('eRole',2); 
            };
            divButtonElement.appendChild(confirmButton);
            break;
        case 'eRole':  
            confirmButtonAtr[0][1]='btn btn-info';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Zapisz';
            confirmButton.onclick = function()
            {
                //SENDA DATA
                postDataToUrl(task);
            };
            divButtonElement.appendChild(confirmButton);
            break;
        case 'dRole':
            confirmButtonAtr[0][1]='btn btn-danger';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Usuń';
            confirmButton.onclick = function()
            {
                //SENDA DATA
                postDataToUrl(task);
            };
            divButtonElement.appendChild(confirmButton);
            break;
        case 'uRole':
            break;
        default:
            alert('[createBodyButtonContent()]ERROR - wrong task');
            break;
    };
    console.log(divButtonElement);
    return(divButtonElement);
}
function removeHtmlChilds(htmlElement)
{
    console.log('---removeHtmlChilds()---');
    console.log(htmlElement);
    var ele=document.getElementById(htmlElement);
    while (ele.firstChild)
    {
        console.log(ele.firstChild);
        ele.firstChild.remove(); 
    };
}
function showDivErr(div,value)
{
    console.log('---showDivErr()---');
    div.innerHTML=value;
    div.style.display = "block";
}
function hideDivErr(div)
{
    console.log('---hideDivErr()---');
    div.innerText='';
    div.style.display = "none";
}
/*
 *  CREATE CHECKBOX LIST
 */
function createCheckBoxList(data,status)
{
    console.log('---createCheckBoxList()---');
    console.log(data);
    console.log("LENGTH: "+data.length);
    /*
     * data - array of objects
     *///hiddend checkbox
    var cboxAtr= new Array(
            Array('class','custom-control-input'),
            Array('type','checkbox'),
            Array('name',''),
            Array('id',''),
            Array('value',''),
            Array('checked',''),
            Array('disabled',''),
            Array('autocomplete','off')
        );
    var cbox='';
    var labelAtr=new Array(
            Array('class','custom-control-label'),
            Array('for',''),
            );
    var label='';
    var divOverAllAtr=new Array(
            Array('class','row')
            );
    var divRAtr=new Array(
            Array('class','ml-3 col-sm-12 custom-control custom-checkbox')
            );
    var divR='';;
    var divOverAll=createHtmlElement('div',divOverAllAtr,null);
    // divOverAll.appendChild(addHiddenInput(data[i].NAZWA,data[i].ID));
    for(var i = 0; i < data.length; i++)
    {    
        //console.log(data[i].ID+' '+data[i].NAZWA+' '+data[i].DEFAULT);
        divR=createHtmlElement('div',divRAtr,null);
        labelAtr[1][1]='cbox-'+data[i].ID;
        label=createHtmlElement('label',labelAtr,null);
        label.innerText=data[i].Nazwa;
        //cboxAtr[2][1]='cbox-ID:'+data[i].ID+'-NAME:'+data[i].Nazwa;
        cboxAtr[2][1]='cbox-'+data[i].ID;
        cboxAtr[3][1]='cbox-'+data[i].ID;
        // VALUE = 0 not send
        // VALUE = 1 ok
        if(data[i].DEFAULT==='t')
        {
            cboxAtr[4][1]=1;
            cboxAtr[5][0]='checked';
        }
        else
        {
            cboxAtr[4][1]=0;
            cboxAtr[5][0]='no-checked';
        };
        if(status)
        {
            cboxAtr[6][0]='no-disabled'; 
        };
        cbox=createHtmlElement('input',cboxAtr,null);
        cbox.onclick=function(){ changeBoxValue(this); };
        divR.appendChild(cbox);
        divR.appendChild(label);
        divOverAll.appendChild(divR); 
    }
    console.log(divOverAll);
    return(divOverAll);
}
/*
 * ASSIGN Project Data to field
 */
function assignProjectDataToField(fieldId)
{
    console.log('---assignProjectDataToField---');
    var valueToReturn='';
    switch(fieldId)
    {
        case 'nazwa':
            valueToReturn=roleData[0].Nazwa;
            break;
   
        default:
            break;
    };
                
    return (valueToReturn);            
}
/*
 * set user body content
 */
function setBodyContent(task,status)
{
    console.log('---setBodyContent()---');
    
    var dataDiv=getForm();
    htmlForm=dataDiv.childNodes[1].childNodes[1];

    switch(status)
    {
        case 0:
                //BLOCKED WITH DATA
                createEditRoleContent(htmlForm.childNodes[1],status);
            break;
        case 1:
                //NEW
                createNewRoleContent(htmlForm.childNodes[1]);
                addLegendDiv();
            break;
        case 2:
                //EDIT
                createEditRoleContent(htmlForm.childNodes[1],1);
                addLegendDiv();
            break;
        default:
            break;
    }
   
    console.log(dataDiv);
    document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
    document.getElementById('adaptedDynamicData').appendChild(dataDiv);
}
/*
 * get emple def modal
 */
function getForm()
{
    console.log('---getForm()---');
    var mainTemplate=document.getElementById('formModalDetail').cloneNode(true);
    mainTemplate.classList.remove("modal");
    mainTemplate.classList.remove("fade");
    return(mainTemplate);
}
/*
 * create edited User Row Content
 */
function createEditRoleContent(whereAppend,status)
{
    console.log('---createEditRoleContent()---');
    //console.log(whereAppend);
    console.log(roleTab);
    // currentUserData -> USER DATA
    // userPermSlo -> USER SLO
    
    // HTML TAGS
    console.log('STATUS -> '+status);
    setInputMode(status);
    var labelAttribute=new Array(
	Array('for','inputEmployee'),
	Array('class','col-sm-4 control-label text-right font-weight-bold')
	);
    var div1=new Array(
	Array('class','col-sm-8')
	);
    var divErrAtr=new Array(
            Array('class','col-sm-auto alert alert-danger'),
            Array('id','')
            );
    var divErrStyle=new Array(
            Array('display','none')
            );

    for(var i=0;i<inputFields.length;i++)
    {
        inputAttribute[0][1]='text';
        inputAttribute[2][1]=inputFields[i][2];
        inputAttribute[3][1]=inputFields[i][2];
        inputAttribute[4][1]='';
        labelAttribute[0][1]='input'+i;
        labelElement=createHtmlElement('label',labelAttribute,null);
        div1Element=createHtmlElement('div',div1,null);
        labelElement.innerText=inputFields[i][1];
        switch(inputFields[i][0])
        {
            case 'hidden':
                console.log('HIDDEN');
                inputAttribute[0][1]='hidden'; 
                inputAttribute[4][1]=roleData[0].ID;
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                div1Element.appendChild(inputElement);
                break;
            case 't':
                inputAttribute[4][1]=assignProjectDataToField(inputFields[i][2]);
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-nazwa';
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $( inputElement).keyup(function()
                {
                    parseFieldValue(this,null,null);
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'c-uprawnienia':
                div1Element.appendChild(createCheckBoxList(roleTab,status));
                break;
            default:
                break;
        };
        whereAppend.appendChild(labelElement);
        whereAppend.appendChild(div1Element);
    };
}
function createNewRoleContent(whereAppend)
{
    console.log('---createNewRoleContent()---');
    console.log(whereAppend);
    
     // HTML TAGS
    var labelAttribute=new Array(
	Array('for','inputEmployee'),
	Array('class','col-sm-4 control-label text-right font-weight-bold')
	);
    var div1=new Array(
	Array('class','col-sm-8')
	);
    var divErrAtr=new Array(
            Array('class','col-sm-auto alert alert-danger'),
            Array('id','')
            );
    var divErrStyle=new Array(
            Array('display','none')
            );
    setInputMode(1);
    
    for(var i=0;i<inputFields.length;i++)
    {
        inputAttribute[0][1]='text';
        inputAttribute[2][1]=inputFields[i][2];
        inputAttribute[3][1]=inputFields[i][2];
        inputAttribute[4][1]='';
        labelAttribute[0][1]='inputProject'+i;
        labelElement=createHtmlElement('label',labelAttribute,null);
        div1Element=createHtmlElement('div',div1,null);
        labelElement.innerText=inputFields[i][1];
        switch(inputFields[i][0])
        {
            case 'hidden':
                console.log('HIDDEN');
                inputAttribute[0][1]='hidden'; 
                break;
            case 't':
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+inputFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $( inputElement).keyup(function()
                {
                    parseFieldValue(this,null,null);
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'c-uprawnienia':
                div1Element.appendChild(createCheckBoxList(roleTab,1));
                break;
            default:
                break;
        };
        whereAppend.appendChild(labelElement);
        whereAppend.appendChild(div1Element);
    };
}
/*
 * add hidden input
 */
function addHiddenInput(name,value)
{
    console.log('---addHiddenInput---');
    var input=document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("value",value);
        input.setAttribute("name",name);
    return (input);
}
/*
 * close modal
 */
function closeModal(modalId)
{
    $('#'+modalId).modal('hide');
}
/*
 * add legend div
 */
function addLegendDiv()
{
    var legendDiv=document.getElementById('legendDiv').cloneNode(true);
    legendDiv.classList.remove("modal");
    legendDiv.classList.remove("fade");
    document.getElementById('adaptedModalBodyExtra').appendChild(legendDiv);
}
/*
 * change box value
 */
function changeBoxValue(input)
{
    console.log('---changeBoxValue()---');
    if(input.value==='0')
    {
        console.log('CHANGE TO 1');
        input.value='1';
    }
    else
    {
        console.log('CHANGE TO 0');
        input.value='0';
    };
}
/*
 * 
 * @param {type} formName
 * @returns {undefined}
 */
function postDataToUrl(task)
{
    console.log('---postDataToUrl()---');
    console.log(task);
    var confirmTask=false;
    switch(task)
    {
        
        case 'eRole':
        case 'cRole':
            parseFieldValue( document.getElementById('nazwa').value,"nazwa","errDiv-nazwa");
            if(checkIsErr())
            {
                console.log("err is true");
                return(0);
            };
         case 'dRole':
            confirmTask=true;
            break;
        default:
            break;
    }; 
    if (confirmTask)
    {
        sendData(task);
    };
}


/*
 * setup div error
 */
function setupDivError(err)
{
    $('#errDiv-Adapted-overall').html(err);
    $("#errDiv-Adapted-overall").show();
}

function reloadData()
{
    window.tableHandle.ajax.reload(null, false);
}
/*
 * 
 */
function setBodyContent2(task,data,idRecord)
{
    console.log('---setBodyContent2()---');
    console.log(idRecord);
    var dataDiv=getForm();
    var htmlForm=dataDiv.childNodes[1].childNodes[1];
    console.log(htmlForm.childNodes[1]);
    console.log(data);
    console.log('DATA COUNT: '+data.length);
    htmlForm.childNodes[1].append(genTextNode(task,idRecord.Nazwa));
    if(data.length>0)
    {
        createUsersRowContent(htmlForm.childNodes[1],data,genTextNode(task,'Rola nie może zostać usunięta ponieważ jest powiązana z poniżej wymienionymi użytkownikami:'));
        document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
    }
    else
    {
        htmlForm.append(addHiddenInput('id',idRecord.ID));
        document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
    }
    document.getElementById('adaptedDynamicData').appendChild(dataDiv);
    console.log(dataDiv);
}
function createUsersRowContent(whereAppend,data,titleElement)
{
    console.log('---createUsersRowContent()---');
    console.log(whereAppend);
    var dataL=data.length;
    var rowL=Object.keys(data[0]).length;
    console.log('DATA LENGTH: '+dataL);
    console.log('ROW LENGTH: '+rowL);
    // SET WARNING
    var divAlertAtr=new Array(
            Array('class','w-100')
            );
    var divAlert=createHtmlElement('div',divAlertAtr,null);
    
        divAlert.appendChild(titleElement);
        //divAlert.appendChild(p);
        whereAppend.appendChild(divAlert);
        
    var tableAtr=new Array(
            Array('class','table table-striped table-condensed')
            );
    var table=createHtmlElement('table',tableAtr,null);
    var tr=createHtmlElement('tr',null,null);

    // GET HEADER 
    for(var prop in data[0])
        {
            if(data[0].hasOwnProperty(prop))
            {
                td=createHtmlElement('td',null,null);
                prop=prop.replace("_", " ");
                td.innerText=prop;
                tr.appendChild(td);
            }
        }
    table.appendChild(tr);   
    // GET DATA
    for(var i=0;i<data.length;i++)
    {
        tr=createHtmlElement('tr',null,null);
        for(var prop in data[i])
        {
            if(data[i].hasOwnProperty(prop))
            {
                td=createHtmlElement('td',null,null);
                td.innerText=data[i][prop];
                tr.appendChild(td);
            }
        }
        table.appendChild(tr);
    };
    whereAppend.appendChild(table);
}
function genTextNode(task,value)
{
    console.log('---genTextNode()---\ntask\n'+task+'\nvalue'+value);
    var divAtr=new Array(
                Array('class','w-100')
                );
    var div=createHtmlElement('div',divAtr,null);
    var hAtr=new Array(
                Array('class','text-danger mb-3 text-center font-weight-bold')
                );
    switch(task)
    {
        case 'dRole':
            break;
        case 'uRole':
                hAtr[0][1]='text-info mb-3 text-center font-weight-bold';
            break;
        default:
            break;
    };
    var h=createHtmlElement('h4',hAtr,null);
    h.innerText=value;
    div.append(h);
    return(div);
}
/*
$(document).ajaxSuccess(function(event, request, settings)
{
    console.log('Triggered ajaxSuccess handler.');
    console.log(event);
    console.log(request);
    console.log(settings);  
});
*/
