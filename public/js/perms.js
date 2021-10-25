/* VERSION 19.09.2019 */
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
    SHOW_USER_PERM : 'disabled',
    EDIT_USER_PERM : 'disabled'
};
setPermission();
var permActUsedUsers=new Array();
var currentIdData=0;
var searchCondition=new Array();
var permUsers=new Array();
var allUsers=new Array();
var allUsersCount=new Array();
var allUsersActUsedCount=new Array();
var scrollY = $(window).innerHeight() - 540;
// ADD BUTTON
var addButtonAttribute=new Array(
            Array('class','btn btn-success btn-add disabled'),
            );
// REMOVE BUTTON
var removeButtonDivButtonAttribute=new Array(
	Array('class','btn btn-danger gt-no-rounded-left disabled')
	);
var removeButtonDivButtonStyle=new Array(
	Array('borderTopLeftRadius','0px'),
        Array('borderBottomLeftRadius','0px')
    );
// GLOBAL SELECT
var selectTagAtr=new Array(
            Array('class','form-control mb-0 gt-border-light-blue gt-no-rounded-right disabled'),
            Array('id',''),
            Array('name',''),
            Array('readOnly','true'),
            Array('disabled','true')
            );
var selectTagStyle=new Array(
        Array('borderColor','#80bfff'),
        Array('borderTopRightRadius','0px'),
        Array('borderBottomRightRadius','0px')
        );
// remove Button i PARAMETERS
var removeButtonIattribute=new Array(
	Array('class','fa fa-minus disabled'),
        Array('readOnly',''),
        Array('disabled','true'),
	Array('aria-hidden','true')
	);
var removeButtonIstyle=new Array(
	Array('color','#ffffff')
    );
window.tableHandle = $('#dataTable').DataTable(
{		
  ajax: {
        url: '/getPerms',
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
    { "searchable": false, "targets": 4 }, // DISABLE SEARCH IN OPTION COLUMN
    { orderable: false, targets: [4] } // DISABLE ORED IN OPTION COLUMN
    ],
  "columns": [
    {
      data: 'ID',
      "width": "30px"
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
      render: function (data, type, row)
      {
        return createButton(data, type,row);
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
$(document).keyup(function(e)
{
    if (e.key === "Escape") // escape key maps to keycode `27`
    { 
        // <DO YOUR WORK HERE>
    }
});
function createButton(data, type, row)
{
    //console.log('---createButton()---');
    //console.log(row.ID);
    if (type === 'display')
    {
        return "<div class=\"btn-group\"><button class=\"btn btn-info "+perm['SHOW_USER_PERM']+" \" "+perm['SHOW_USER_PERM']+" onclick=\"createAdaptedModal('sUsers',"+row.ID+")\">Użytkownicy</button></div>";
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
        case 'sUsers':
            url='getUsersWithPerm';
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
function setupAdaptedModalProperties(task,id,data)
{
    console.log('===setupAdaptedModalProperties()===\nTASK: '+task);
    clearAdaptedComponent();
    $("#adaptedModalBgTitle").addClass("modal-header");
    switch(task)
    {
        case 'sUsers':
                $("#adaptedModalBgTitle").addClass("bg-info");
                $("#adaptedModalTitle").html("UŻYTKOWNICY UPRAWNIENIA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Role ID: "+id+"</small>");
                currentIdData=id;
                //permUsers=data[0];
                permUsers=data.PERM;
                //allUsers=data[1];
                allUsers=data.USERS;
                console.log(permUsers);
                console.log(allUsers);
                allUsersCount=allUsers.length;
                allUsersActUsedCount=0;
                createPermView(document.getElementById('adaptedDynamicData'),task,0);
                 //$('#adaptedModal').modal('show');
                break;
        default:
                console.log('---wrong task()---');
            break;
    }
    console.log(document.getElementById('adaptedModalBgTitle'));
    $('#adaptedModal').modal('show');
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
function createPermView(elementWhereAdd,taskToRun,state)
{
    console.log('---createPermView()---\n'+taskToRun);
    console.log(elementWhereAdd);
    setFieldsAtr(taskToRun);
    var mainTemplate=getForm();
    htmlForm=mainTemplate.childNodes[1].childNodes[1];
    // ADD HIDDEN IDPERM
    htmlForm.append(addHiddenInput('id',currentIdData));
    
    var divAdd=document.createElement("div");
        divAdd.setAttribute("class","entry");
        divAdd.classList.add("input-group");
    buttonAdd=createAddButton();
    if(state)
    {   
        buttonAdd.onclick=function(){createPermUserRow(mainTemplate.childNodes[1].childNodes[1].childNodes[1],state,null,null);}; 
    }
    for(var tt=0;tt<permUsers.length;tt++)
    {
        createPermUserRow(mainTemplate.childNodes[1].childNodes[1].childNodes[1],state,permUsers[tt].id,permUsers[tt].ImieNazwisko);
    }
    
    divAdd.appendChild(buttonAdd);
    mainTemplate.childNodes[1].childNodes[1].appendChild(divAdd);
    elementWhereAdd.appendChild(mainTemplate);
    document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(taskToRun));
    controlAddUserPermButton();
}
function setFieldsAtr(task)
{
    console.log('---setFieldsAtr---\n'+task);
    switch (task)
    {
        case 'sUsers':
            addButtonAttribute[0][1]='btn btn-success btn-add disabled';
            removeButtonDivButtonAttribute[0][1]='btn btn-danger gt-no-rounded-left disabled';
            selectTagAtr[3][0]='readOnly';
            selectTagAtr[4][0]='disabled';
            selectTagStyle[0][1]='#f2f2f2';
            break;
        case 'ePermUsers':
            addButtonAttribute[0][1]='btn btn-success btn-add';
            removeButtonDivButtonAttribute[0][1]='btn btn-danger gt-no-rounded-left';
            selectTagAtr[3][0]='no-readOnly';
            selectTagAtr[4][0]='no-disabled';
            selectTagStyle[0][1]='#80bfff';
            break;
        default:
            break;
    };  
}
function getForm()
{
    console.log('---getForm()---');
    var mainTemplate=document.getElementById('formModalDetail').cloneNode(true);
    mainTemplate.classList.remove("modal");
    mainTemplate.classList.remove("fade");
    return(mainTemplate);
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
function createAddButton()
{   
    //var addBtn=createHtmlElement('button',);
    var iIco=document.createElement("i");
        iIco.setAttribute('class','fa');
        iIco.classList.add("fa-plus");
        iIco.setAttribute("aria-hidden","true");
    var addBtn=createHtmlElement('button',addButtonAttribute,null);
    addBtn.appendChild(iIco);
    return (addBtn);
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
            Array('no-disabled','')
            );
    var confirmButton='';

    switch(task)
    {
        case 'sUsers':
            confirmButtonAtr[0][1]='btn btn-info '+perm['EDIT_USER_PERM'];
            confirmButtonAtr[1][0]=perm['EDIT_USER_PERM'];
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function()
            {
                allUsersActUsedCount=0;
                permActUsedUsers=[];
                removeHtmlChilds('adaptedDynamicData');
                removeHtmlChilds('adaptedButtonsBottom');
                //setUserBodyContent('editUser',2); 
                createPermView(document.getElementById('adaptedDynamicData'),'ePermUsers',1);
            };
            
            break;
        case 'ePermUsers':
            confirmButtonAtr[0][1]='btn btn-info';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Zapisz';
            confirmButton.onclick = function()
            {
                //SENDA DATA
                sendData(task);
            };
            break;
        default:
            alert('[createBodyButtonContent()]ERROR - wrong task');
            break;
    };
    divButtonElement.appendChild(cancelButton);
    divButtonElement.appendChild(confirmButton);
    return(divButtonElement);
}
function controlAddUserPermButton()
{
    console.log('---controlAddUserPermButton()---');
    console.log('allUsersCount : '+allUsersCount);
    //console.log(allUsers);
    console.log('allUsersActUsedCount : '+allUsersActUsedCount);
    //console.log(permActUsedUsers);
    // WARUNEK ABY NIE DODWAC W NIESKONCZONOSC
    if(allUsersCount===allUsersActUsedCount)
    {
        console.log('FINISH');
        setButtonAdd(1);
    }
}
/*
 * 
 * @returns {undefined}
 */
function reloadData()
{
    window.tableHandle.ajax.reload(null, false);
}
/*
 * close modal
 */
function closeModal(modalId)
{
    $('#'+modalId).modal('hide');
}
function createPermUserRow(whereAppend,state,id,ImieNazwisko)
{
    console.log('---createPermUserRow()---\nSTATE: '+state);
    console.log(whereAppend);
    //console.log(rowName);
    var i=0;
    var z;
    var divRowAttribute=new Array(
	Array('class','row pl-0 pr-0')
	);
    var divRowElement=createHtmlElement('div',divRowAttribute,null);
    // div-col-md-4 PARAMETERS
    var divColMd4Attribute=new Array(
	Array('class','col-11 pr-0')
	);
    var divColMd4Element=createHtmlElement('div',divColMd4Attribute,null);

    // div-col-md-auto PARAMETERS
    var divColMdAutoAttribute=new Array(
	Array('class','col-auto pl-0 mr-0 pr-0')
	);
    var divColMdAutoElement=createHtmlElement('div',divColMdAutoAttribute,null);
    // select-team-worker PARAMETERS
    selectTagAtr[1][1]='pers_'+allUsersActUsedCount;
    selectTagAtr[2][1]='pers_'+allUsersActUsedCount;

    var selectTeamWorkerElement=createHtmlElement('select',selectTagAtr,selectTagStyle);
    selectTeamWorkerElement.onfocus=function(){ manageActUsedPermUsers(this.value,this);}; //onclick onfocus
    selectTeamWorkerElement.onchange=function(){ updateActUsedPermUser(this.value,this);};
    var optionTeamWorkerAttribute=new Array(
            Array('value','dynamicChange')
            );
    var optionTeamWorkerElement;

    var tmpPers=new Array();

    if(id!==null)
    {
        tmpPers.push(id,ImieNazwisko);
        permActUsedUsers.push(id);
    }
    else
    {
        for(z=i;z<allUsers.length;z++)
        {
            console.log(allUsers[z]);
            /*
             * [].id
             * [].ImieNazwisko
             */
            if(permActUsedUsers.indexOf(allUsers[z].id)===-1)
            {
                console.log('FOUND');
                permActUsedUsers.push(allUsers[z].id);
                tmpPers.push(allUsers[z].id,allUsers[z].ImieNazwisko);
                break;
            }
        };
    }
  
    optionTeamWorkerAttribute[0][1]=tmpPers[0];
    optionTeamWorkerElement=createHtmlElement('option',optionTeamWorkerAttribute,null,null);
    optionTeamWorkerElement.textContent= tmpPers[1];
    selectTeamWorkerElement.appendChild(optionTeamWorkerElement);
    
    var removeButtonElement=createRemoveButton();
    if(state)
    {
        removeButtonElement.onclick=function(){retrivePermUser(this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode),this.parentNode.parentNode);};
    }
    divColMdAutoElement.append(removeButtonElement);
    divColMd4Element.appendChild(selectTeamWorkerElement);

    divRowElement.appendChild(divColMd4Element);
    divRowElement.appendChild(divColMdAutoElement);
    
    allUsersActUsedCount++;
    controlAddUserPermButton();
    console.log(divRowElement);
    whereAppend.append(divRowElement);
}
function createRemoveButton()
{

    var iElement=createHtmlElement('i',removeButtonIattribute,removeButtonIstyle,null);
    // div-button PARAMETERS
 
    var divRemoveButtonElement=createHtmlElement('div',removeButtonDivButtonAttribute,removeButtonDivButtonStyle);
    
    divRemoveButtonElement.appendChild(iElement);
    return(divRemoveButtonElement); 
}
function manageActUsedPermUsers(idToSetup,elementWhereAppend)
{
    console.log('---manageActUsedPermUsers()---\nValue: '+idToSetup);
    console.log(elementWhereAppend.firstElementChild.innerHTML);
    console.log(elementWhereAppend.value);
    while (elementWhereAppend.firstChild) 
    {
        //console.log('option to remove: '+elementWhereAppend.firstChild);
        elementWhereAppend.removeChild(elementWhereAppend.firstChild);
    };
    // option-team-worker PARAMETERS
    var optionTeamWorkerAttribute=new Array(
            Array('value',idToSetup)
            );
    var optionTeamWorkerElement;    
    optionTeamWorkerElement=createHtmlElement('option',optionTeamWorkerAttribute,null,null);

    var idNameToSetup=returnRowIdInArray(allUsers,'id',idToSetup);

    nameToSetup=allUsers[idNameToSetup].ImieNazwisko;
    console.log('true name to setup - '+nameToSetup);
    optionTeamWorkerElement.textContent=nameToSetup;
    elementWhereAppend.appendChild(optionTeamWorkerElement);
    for(var z=0;z<allUsers.length;z++)
    {
        
        if(permActUsedUsers.indexOf(allUsers[z].id)===-1 && allUsers[z].id!==idToSetup)
        {
            optionTeamWorkerAttribute[0][1]=allUsers[z].id;
            optionTeamWorkerElement=createHtmlElement('option',optionTeamWorkerAttribute,null,null);
            optionTeamWorkerElement.textContent=allUsers[z].ImieNazwisko;
            elementWhereAppend.appendChild(optionTeamWorkerElement);
        }
    }
     setLastPermUserId(idToSetup);
}
function returnRowIdInArray(array,colToCheck,searchId)
{
    // default if not found
    var returnedId=-1;
    for(var z=0;z<array.length;z++)
    {
        //console.log(array[z]);
        if(array[z][colToCheck]===searchId)
        {
            returnedId=z;
            break;
        }
    }
    return (returnedId);
}
function setLastPermUserId(idToSetup)
{
    console.log('---setLastPermUserId()---\n'+idToSetup);
    lastPermUserId=idToSetup;
    
}
function updateActUsedPermUser(idToAdd,elementToUpdate)
{
    console.log('---updateActUsedPermUser()---\n');
    console.log('act value of element - '+elementToUpdate.value);
    // RETRIVE LAST ID
    // ADD NEW ID
    console.log('removed id - '+permActUsedUsers.indexOf(lastPermUserId));
    console.log('value to to add - '+idToAdd);
    // update value of current element
    elementToUpdate.value=idToAdd;
    permActUsedUsers.splice( permActUsedUsers.indexOf(lastPermUserId),1,idToAdd);
    //actUsedMemberProjTab.push(idToAdd);
    setLastPermUserId(idToAdd);
}
function setButtonAdd(disabled)
{
    if(disabled)
    {
        buttonAdd.setAttribute("disabled", "true"); 
    }
    else
    {
        buttonAdd.removeAttribute("disabled"); 
    }
}
function retrivePermUser(nodeToClose)
{
    //changeNumberOfMembers(-1);
    console.log("---retrivePermUser()---\n");
    var idToRemove=nodeToClose.childNodes[0].childNodes[0].firstChild.value;

    console.log("Retrive id - "+idToRemove);
    console.log("Retrive id indexOf to remove - "+permActUsedUsers.indexOf(idToRemove));
    permActUsedUsers.splice( permActUsedUsers.indexOf(idToRemove),1);
    allUsersActUsedCount--; 
    setButtonAdd(0);
}
/*
 * setup div error
 */
function setupDivError(err)
{
    $('#errDiv-Adapted-overall').html(err);
    $("#errDiv-Adapted-overall").show();
}