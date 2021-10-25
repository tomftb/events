/* VERSION 10.09.2019 */
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
/*
 * 
 * PERMISSION
 */
const perm = {
    ADD_USER : 'disabled',
    SHOW_USER : 'disabled',
    EDIT_USER : 'disabled',
    SHOW_PERM_USER : 'disabled',
    EDIT_PERM_USER : 'disabled',
    DEL_USER : 'disabled'
};
setPermission();
console.log(perm);
var scrollY = $(window).innerHeight() - 540;
var currentUserData=new Array();
var userPermSlo=new Array();
var userRoleSlo= new Array();
var currentIdUser=0;
// ACCOUNT TYPE
var typKonta=new Array(
        new Array('a','Active Directory'),
        new Array('l','Local')
        );
// USER FIELDS
var userFields=new Array(
        new Array('hidden','','id'),
        new Array('t','Imię:','imie'),
        new Array('t','Nazwisko:','nazwisko'),
        new Array('t','Login:','login'),
        new Array('p','Hasło:','haslo'),
        new Array('t','Email:','email'),
        new Array('s-typkonta','Typ konta:','typkonta'),
        new Array('s-rola','Rola:','rola'),
        new Array('c-uprawnienia','Uprawnienia:','uprawnienia')
    );
// GLOBAL SELECT
var selectAttribute=new Array(
            Array('class','form-control mb-1'),
            Array('id',''),
            Array('name',''),
            Array('no-readOnly','true'),
            Array('no-disabled','true')
            );
var selectStyle=new Array();

window.tableHandle = $('#dataTable').DataTable(
{		
  ajax: {
        url: '/getUsers',
        method: 'GET',
        deferRender: true,
        "dataSrc": ""
  },
  dom: '<"fixedcontrols"Bfr><"row row-overflow"<"col"tip>>',
  "paging": true,
  "pageLength": 20,
  scrollX: true,
  scrollY: scrollY + 'px',
  buttons: [
      {
            text: '<i class="fa fa-plus"></i> Dodaj użytkownika',
            className: 'btn btn-info ml-0 '+perm['ADD_USER'],
            action: function (e, dt, node, config)
            {
                 ajaxGet('cUser',setUrl('cUser',null),null);
            }
        },
    {
            text: '<i class="fa fa-remove"></i> Usuń filtry',
            className: 'btn btn-secondary ml-0',
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
    { "searchable": false, "targets": 7 }, // DISABLE SEARCH IN OPTION COLUMN
    { orderable: false, targets: [7] } // DISABLE ORED IN OPTION COLUMN
    ],
  "columns": [
    {
      data: 'ID',
      "width": "30px"
    },
    {
      data: 'Imie'
    },
    {
      data: 'Nazwisko'
    },
    {
      data: 'Login'
    },
    {
      data: 'Email'
    },
    {
      data: 'TypKonta'
    },
    {
      data: 'Rola'
    },
    {
      "data": null,
      "ordering": false,
      render: function (data, type, row)
      {
        return createButton(data, type,row);
      }
    }
  ] 
 });
window.tableHandle.columns().every(function (id,value)
{
    //console.log('---tableHandle.columns---');
    //console.log('ID - '+id);
    //console.log('VALUE - '+value);
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
$( window.tableHandle.table().footer() ).addClass( 'bg-light' );
$(document).keyup(function(e) {
     if (e.key === "Escape") { // escape key maps to keycode `27`
        // <DO YOUR WORK HERE>
    }
});
function createButton(data, type, row)
{
    //console.log('---createButton()---');
    //console.log(row.ID);
    //console.log(row.Imie);
    //console.log(row.Nazwisko);
    //console.log(row);
    if (type === 'display')
    {
        return "<div class=\"btn-group\"><button class=\"btn btn-info "+perm['SHOW_USER']+" \" "+perm['SHOW_USER']+" onclick=\"createAdaptedModal('sUser',"+row.ID+")\">Dane</button><button class=\"btn btn-warning "+perm['SHOW_PERM_USER']+" \" "+perm['SHOW_PERM_USER']+" onclick=\"ajaxGet('pUser',setUrl('pUser',"+row.ID+"),"+row.ID+")\">Uprawnienia</button><button class=\"btn btn-danger "+perm['DEL_USER']+" \" "+perm['DEL_USER']+" onclick=\"setupAdaptedModalProperties('dUser',"+row.ID+",'"+row.Imie+" "+row.Nazwisko+"')\">Usuń</button></div>";
    }
    else
    {
        return ''; // NO UPR
    };
}
function setUrl(task,id)
{
    var url='';
    switch(task)
    {
        case 'sUser':
            url='getUserDetails';
            break;
        case 'pUser':
            //url='getUserPerm';
            url='getUserDetails';
            break;
        case 'cUser':
            url='getNewUserSlo';
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
function createAdaptedModal(task,id)
{
    console.log('---createAdaptedModal()---');
    console.log(id);
    ajaxGet(task,setUrl(task,id),id);
}
function setupAdaptedModalProperties(task,id,data)
{
    console.log('---setupAdaptedModalProperties()---\nTASK: '+task);
    console.log(data);
    clearAdaptedComponent();
    $("#adaptedModalBgTitle").addClass("modal-header");
    switch(task)
    {
        case 'pUser':
                $("#adaptedModalBgTitle").addClass("bg-warning");
                $("#adaptedModalTitle").html("UPRAWNIENIA UŻYTKOWNIKA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">User ID: "+id+"</small>");
                currentIdUser=id;
                //currentUserData=data[0];
                currentUserData=data.USER;
                //userPermSlo=data[1];    
                userPermSlo=data.PERM;    
                setUserPermBodyContent(task,0,data);
            break;
        case 'cUser':
                $("#adaptedModalBgTitle").addClass("bg-info");
                $("#adaptedModalTitle").html("NOWY UŻYTKOWNIK");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">User ID: NEW</small>");
                //userPermSlo=data[0];
                userPermSlo=data.UPR;
                //userRoleSlo=data[1];
                userRoleSlo=data.ROLE;
                setUserBodyContent(task,1);
            break;
        case 'dUser':
                $("#adaptedModalBgTitle").addClass("bg-danger");
                $("#adaptedModalTitle").html("USUWANIE UŻYTKOWNIKA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">User ID: "+id+"</small>");
                setUserDeleteBodyContent(id,data);
            break;
        case 'sUser':
                $("#adaptedModalBgTitle").addClass("bg-info");
                $("#adaptedModalTitle").html("DANE UŻYTKOWNIKA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">User ID: "+id+"</small>");
                //currentUserData=data[0];
                currentUserData=data.USER;
                //userPermSlo=data[1];
                userPermSlo=data.PERM;
                //userRoleSlo=data[2];
                userRoleSlo=data.ROLE;
                setUserBodyContent(task,0);
                break;
        default:
                console.log('---setupAdaptedModalProperties() wrong task---');
            break;
    }
    $('#adaptedModal').modal('show');
    console.log($('#adaptedModal')[0]);
}
/*
 * 
 */
function setUserBodyContent(task,status)
{
    console.log('---setUserBodyContent()---\nstatus'+status);
    
    var dataDiv=getForm();
    var form=dataDiv.childNodes[1];
    switch(status)
    {
        case 0:
                //BLOCKED WITH DATA
                createEditedUserRowContent(form.childNodes[1],status);
                document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
            break;
        case 1:
                //NEW 
                createNewUserRowContent(form.childNodes[1]);
                document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
                addLegendDiv();
            break;
        case 2:
                //EDIT 
                createEditedUserRowContent(form.childNodes[1],1);
                document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
                addLegendDiv();
            break;
        default:
            break;
    }
    console.log(dataDiv);
    document.getElementById('adaptedDynamicData').appendChild(dataDiv);
}
/*
 * 
 */
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
            Array('id','confirmData'),
            Array('no-disabled',''),
            );
    var confirmButton='';

    switch(task)
    {
        case 'cUser':
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = "Dodaj";
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'dUser':
            confirmButtonAtr[0][1]='btn btn-danger';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Usuń';
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'pUser':
            confirmButtonAtr[0][1]='btn btn-warning '+perm["EDIT_PERM_USER"];
            confirmButtonAtr[2][0]=perm["EDIT_PERM_USER"];
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function()
            {
                removeHtmlChilds('adaptedDynamicData');
                removeHtmlChilds('adaptedButtonsBottom');
                setUserPermBodyContent('userPerm',1); 
            };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'sUser':
            confirmButtonAtr[0][1]='btn btn-info '+perm["EDIT_USER"];
            confirmButtonAtr[2][0]=perm["EDIT_USER"];
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function()
            {
                removeHtmlChilds('adaptedDynamicData');
                removeHtmlChilds('adaptedButtonsBottom');
                setUserBodyContent('eUser',2); 
            };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'eUser':
        case 'userPerm':
            confirmButtonAtr[0][1]='btn btn-primary';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Zatwierdź';
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        default:
            console.log('createBodyButtonContent() - wrong task');
            break;
    };
    
    return(divButtonElement);
}
function removeHtmlChilds(htmlElement)
{
    //console.log('---removeHtmlChilds()---');
    //console.log(htmlElement);
    var ele=document.getElementById(htmlElement);
    while (ele.firstChild)
    {
        //console.log(ele.firstChild);
        ele.firstChild.remove(); 
    };
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
    document.getElementById('loadGif').style.display='none'; 
}
function createEditedUserRowContent(whereAppend,status)
{
    console.log('---createEditedUserRowContent()---');
    //console.log(whereAppend);
    console.log(currentUserData);
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
    for(var i=0;i<userFields.length;i++)
    {
        setInputMode(status);
        inputAttribute[0][1]='text';
        inputAttribute[2][1]=userFields[i][2];
        inputAttribute[3][1]=userFields[i][2];
        inputAttribute[4][1]='';
        labelAttribute[0][1]='input'+i;
        labelElement=createHtmlElement('label',labelAttribute,null);
        div1Element=createHtmlElement('div',div1,null);
        labelElement.innerText=userFields[i][1];
        switch(userFields[i][0])
        {
            case 'hidden':
                console.log('HIDDEN');
                inputAttribute[0][1]='hidden'; 
                inputAttribute[4][1]=currentUserData[0].ID;
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                div1Element.appendChild(inputElement);
                break;
            case 'p':
                inputAttribute[0][1]='password';  
                setInputMode(0);
            case 't':
                inputAttribute[4][1]=assignProjectDataToField(userFields[i][2]);
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+userFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $(inputElement).keyup(function()
                {
                    parseFieldValue(this,null,null);
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            
            case 's-typkonta':
                setSelectMode(0);
                newSelect=createSelect(typKonta,userFields[i][2],userFields[i][2]);
                newSelect.onchange=function()
                {
                    setPassFieldState(this.value);
                };
                div1Element.appendChild(newSelect);
                setSelectMode(status);
                break;
            case 's-rola':
                var fields=new Array ('ID','Nazwa');
                var newUserRoleSlo=getDataFromJson(userRoleSlo,fields);
                newSelect=createSelect(newUserRoleSlo,userFields[i][2],userFields[i][2]);
                div1Element.appendChild(newSelect);
                break;
            case 'c-uprawnienia':
                div1Element.appendChild(createCheckBoxList(userPermSlo,status));
                break;
            default:
                break;
        };
        whereAppend.appendChild(labelElement);
        whereAppend.appendChild(div1Element);
    };
}
function assignProjectDataToField(fieldId)
{
    console.log('---assignProjectDataToField---');
    var valueToReturn='';
    switch(fieldId)
    {
        case 'imie':
            valueToReturn=currentUserData[0].Imie;
            break;
        case 'nazwisko':
            valueToReturn=currentUserData[0].Nazwisko;
            break;
        case 'login':
            valueToReturn=currentUserData[0].Login;
            break;
        case 'email':
            valueToReturn=currentUserData[0].Email;
            break;
        default:
            break;
    };
                
    return (valueToReturn);            
}
function setSelectMode(mode)
{
    console.log('---setSelectMode()---\n'+mode);
    if(mode)
    {
        selectAttribute[3][0]='no-readonly';
        selectAttribute[4][0]='no-disabled'; 
    }
    else
    {
        selectAttribute[3][0]='readonly';
        selectAttribute[4][0]='disabled';
    }
}
function setInputMode(mode)
{
    console.log('---setInputMode()---\n'+mode);
    if(mode)
    {
        inputAttribute[6][0]='no-readonly';
        inputAttribute[7][0]='no-disabled';
    }
    else
    {
        inputAttribute[6][0]='readonly';
        inputAttribute[7][0]='disabled';
    }
}
function createSelect(dataArray,fieldId,fieldName)
{
    console.log('---createSelect---\n'+fieldId);
    console.log(dataArray);
    selectAttribute[1][1]=fieldId; // id 
    selectAttribute[2][1]=fieldName; // name

    var option=document.createElement("OPTION");
    var optionText = document.createTextNode("");
    
    var select=createHtmlElement('select',selectAttribute,selectStyle);    
    for(var i=0;i<dataArray.length;i++)
    {
        option=document.createElement("OPTION");
        option.setAttribute("value",dataArray[i][0]);
        optionText = document.createTextNode(dataArray[i][1]);
        option.appendChild(optionText);
        select.appendChild(option);
    };
    return select;
}
function getDataFromJson(dataJson,fieldsToSetup)
{
    //console.log(fieldsToSetup.length);
    var dataArray=new Array();
    var tmpArray= new Array();
    for(var i=0;i<dataJson.length;i++)
    {
        for(j=0;j<fieldsToSetup.length;j++)
        {
            tmpArray.push(dataJson[i][fieldsToSetup[j]]);
        }
        dataArray[i]=tmpArray;
        tmpArray=[];
    };
    return dataArray;
}
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
    if(perm['SHOW_PERM_USER']==='disabled')
        {
            var divErrAtr=new Array(
                Array('class','alert alert-danger ml-3 col-sm-auto')    
                );
                var divErr=createHtmlElement('div',divErrAtr,null);
                divErr.innerText="[SHOW_PERM_USER]Brak uprawnienia";
                divOverAll.appendChild(divErr);
        }
    for(var i = 0; i < data.length; i++)
    {    
        if(perm['SHOW_PERM_USER']==='disabled')
        {
            divOverAll.appendChild(addHiddenInput(data[i].NAZWA,data[i].ID));
	}
        else
        {
           //console.log(data[i].ID+' '+data[i].NAZWA+' '+data[i].DEFAULT);
            divR=createHtmlElement('div',divRAtr,null);
            labelAtr[1][1]='cbox-'+data[i].ID;
            label=createHtmlElement('label',labelAtr,null);
            label.innerText=data[i].NAZWA;
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
                //cboxAtr[6][0]='no-disabled'; 
                cboxAtr[6][0]=perm['EDIT_PERM_USER'];
            };
            
            
            cbox=createHtmlElement('input',cboxAtr,null);
            cbox.onclick=function(){ changeBoxValue(this); };
            divR.appendChild(cbox);
            divR.appendChild(label);
            divOverAll.appendChild(divR); 
        }  
    };
    console.log(divOverAll);
    return(divOverAll);
}
function setUserPermBodyContent(task,status)
{
    console.log('---setUserPermBodyContent()---');
    console.log('ID USER: '+currentIdUser);
    
    var dataDiv=getForm();
    var form=dataDiv.childNodes[1];
    form.childNodes[1].append(addHiddenInput('id',currentIdUser));
    setUserPermContent(form.childNodes[1],status);
    document.getElementById("adaptedModalBodyTitle").innerText='';
    document.getElementById('adaptedModalBodyTitle').appendChild(createTitle(currentUserData[0].Imie+" "+currentUserData[0].Nazwisko));
    document.getElementById('adaptedDynamicData').appendChild(dataDiv);
    console.log(dataDiv);    
    document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
}
function setUserPermContent(whereAppend,status)
{
    console.log('---setUserPermContent()---');
    //userSloPerm,
    //currentIdUser
    var divSm2Atr=new Array(
	Array('class','col-sm-2')
	);
    var div1Sm2=createHtmlElement('div',divSm2Atr,null);
    var divSm8Atr=new Array(
	Array('class','col-sm-8')
	);
    var div1Sm8=createHtmlElement('div',divSm8Atr,null);
    div1Sm8.appendChild(createCheckBoxList(userPermSlo,status));
    whereAppend.appendChild(div1Sm2);
    whereAppend.appendChild(div1Sm8);
}
function setUserDeleteBodyContent(id,data)
{
    console.log('---setUserDeleteBodyContent()---\nID - '+id);
    console.log(data);
    var dataDiv=getForm();
    var form=dataDiv.childNodes[1];
    form.childNodes[1].append(addHiddenInput('id',id));
    document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent('dUser'));
    document.getElementById('adaptedModalBodyTitle').appendChild(createTitle(data));
    document.getElementById('adaptedDynamicData').appendChild(dataDiv);
    console.log(dataDiv);
}
function createTitle(text)
{
    console.log('---createDivTitle()---');
    console.log(text);
    var hAtr=new Array(
            Array('class','text-center')
            );
    var h= createHtmlElement('h4',hAtr,null);
    var t = document.createTextNode(text);
    h.appendChild(t);

    console.log(t);
    return h;
}
function postDataToUrl(task)
{
    console.log('---postDataToUrl()---');
    console.log(task);
    var confirmTask=false;
    switch(task)
    {
        
        case 'eUser':
        case 'cUser':
            parseFieldValue( document.getElementById('imie').value,"imie","errDiv-imie");
            parseFieldValue( document.getElementById('nazwisko').value,"nazwisko","errDiv-nazwisko");
            parseFieldValue( document.getElementById('login').value,"login","errDiv-login");
            parseFieldValue( document.getElementById('haslo').value,"haslo","errDiv-haslo");
            parseFieldValue( document.getElementById('email').value,"email","errDiv-email");
            if(checkIsErr())
            {
                console.log("err is true");
                return(0);
            };
        case 'userPerm':
        case 'dUser':
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
function createNewUserRowContent(whereAppend)
{
    console.log('---createNewUserRowContent()---');
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
    
    for(var i=0;i<userFields.length;i++)
    {
        setInputMode(1);
        inputAttribute[0][1]='text';
        inputAttribute[2][1]=userFields[i][2];
        inputAttribute[3][1]=userFields[i][2];
        inputAttribute[4][1]='';
        labelAttribute[0][1]='inputProject'+i;
        labelElement=createHtmlElement('label',labelAttribute,null);
        div1Element=createHtmlElement('div',div1,null);
        labelElement.innerText=userFields[i][1];
        switch(userFields[i][0])
        {
            case 'hidden':
                console.log('HIDDEN');
                inputAttribute[0][1]='hidden'; 
                break;
            case 'p':
                inputAttribute[0][1]='password';  
                setInputMode(0);
            case 't':
                inputAttribute[8][1]='40';
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+userFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $(inputElement).keyup(function()
                {
                    parseFieldValue(this,null,null);
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                inputAttribute[8][1]='30';
                break;
            case 's-typkonta':
                setSelectMode(0);
                newSelect=createSelect(typKonta,userFields[i][2],userFields[i][2]);
                newSelect.onchange=function()
                {
                    setPassFieldState(this.value);
                };
                div1Element.appendChild(newSelect);
                setSelectMode(1);
                break;
            case 's-rola':
                var fields=new Array ('ID','Nazwa');
                var newUserRoleSlo=getDataFromJson(userRoleSlo,fields);
                newSelect=createSelect(newUserRoleSlo,userFields[i][2],userFields[i][2]);
                div1Element.appendChild(newSelect);
                break;
            case 'c-uprawnienia':
                div1Element.appendChild(createCheckBoxList(userPermSlo,1));
                break;
            default:
                break;
        };
        whereAppend.appendChild(labelElement);
        whereAppend.appendChild(div1Element);
    };
}
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