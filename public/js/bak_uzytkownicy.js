var loggedUserPerm=new Array();
var currentIdUser=0;
var currentUserData=new Array();
var errInputValue= new Array();
var usersTab=new Array();
var userPermSlo=new Array();
var userRoleSlo= new Array();
var typKonta=new Array(
        new Array('a','Active Directory'),
        new Array('l','Local')
        );
var userFields=new Array(
        new Array('hidden','','idUser'),
        new Array('t','Imię:','imie'),
        new Array('t','Nazwisko:','nazwisko'),
        new Array('t','Login:','login'),
        new Array('p','Haslo:','haslo'),
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
// GLOBAL INPUT PROPERTIES
var inputAttribute= new Array(
        Array('type','text'),
        Array('class','form-control mb-1'),
        Array('name','inputProject'),
        Array('id','inputProject'),
        Array('value',''),
        Array('placeholder',''),
        Array('no-readOnly','true'),
        Array('no-disabled','')
        );
var inputStyle=new Array();
function getAjaxData(task,taskAddon,functionStart,idRecord)
{
    console.log('---getAjaxData()---');
    console.log("TASK : "+task+"\nTASK ADDON : "+taskAddon);

    var url =  getUrl()+'modul/manageUser.php?task='+task+taskAddon;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function()
    {
      if (this.readyState === 4 && this.status === 200)
      {
          parseAjaxResponse(this.responseText,task,functionStart,idRecord);
      }
      else
      {
          //console.log("error ajax"+this.status+" state - "+this.readyState);
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send(); 
}
function getUrl()
{
    console.log('---getUrl()---');
    var currentLocation = window.location;
    return currentLocation.protocol+"//"+currentLocation.host+"/";
}
function parseAjaxResponse(response,task,functionStart,idRecord)
{
    console.log('---parseAjaxResponse()---');
    var ajaxData = new Array();
    try
    {
        ajaxData = JSON.parse(response);
        if(ajaxData[0][0]==='0')
        {
            console.log(ajaxData[1]);
            manageTaskAfterAjaxGet(task,ajaxData[1],functionStart,idRecord);
        }
        else
        {
            alert("[getAJaxData()]ERROR: "+ajaxData[1]);
        };
    }
    catch(err)
    {
        //document.getElementById("demo").innerHTML = err.message;
        console.log('NOT A JSON FILE:\nERROR: '+err);
        console.log(response);
    }
}
function manageTaskAfterAjaxGet(taskToRun,data,functionStart,idRecord)
{
    console.log('---manageTaskAfterAjaxGet()---');
    //console.log('TASK TO RUN - '+taskToRun+'\nDATA - '+data+'\nID - '+fieldId+'\nNAME - '+name+');
    //SET DATA TO TABLE
    switch(taskToRun)
    {
        case 'getuserslike':  
        case 'getusers':
            /* 
             * [].id
             * [].imie
             * [].nazwisko
             * [].login
             * [].haslo
             * [].email
             * [].typ
             * [].rola
             * [].wsk_u
             * [].dat_dod
             * [].dat_usn
             * [].mod_dat
             * [].mod_user
             * [].mod_user_id
             */
          
            loggedUserPerm=data[1];
            usersTab=data[0];
            break;
        case 'getNewUserSlo':
            userPermSlo=data[0];
            userRoleSlo=data[1];
            break;
        case 'getPermSlo':
        case 'getUserPerm':
            /* 
             * [].ID
             * [].NAZWA
             * [].DEFAULT
             */
            userPermSlo=data;
            break;
        case 'getUserDetails':
            currentUserData=data[0];
            console.log(currentUserData);
            userPermSlo=data[1];
            console.log(userPermSlo);
            userRoleSlo=data[2];
            console.log(userRoleSlo);
            break;
        default:
            alert('[manageTaskAfterAjaxGet()]ERROR - wrong task '+taskToRun);
            break;
    }
    // RUN FUNCTION
    switch(functionStart)
    {
        case 'sUsers':
                setButtonDisplay(document.getElementById('addNewUserButton'),'ADD_USER',loggedUserPerm);
                setAllUsers();
            break;
        case 'cUser':
                setUserBodyContent(functionStart,1);
            break;
        case 'details':
                setUserBodyContent(functionStart,0);
            break;
        case 'dUser':
                setDeleteEmployeeBodyContent(functionStart,employeeProj,idRecord);
                break;
        case 'permissions':
                // ALL SLO SPEC
                setUserPermBodyContent(functionStart,0);
                // ALL EMPLOYEE SLO SPEC
                break;
        default:
            break;
    }
}
function setButtonDisplay(element,perm,userPerm)
{
    //console.log('---setButtonDisplay()---');
    if(userPerm.indexOf(perm)===-1)
    {
        element.classList.add('disabled');
        element.setAttribute("disabled", "");
    }
    else
    {
        element.classList.remove("disabled");
        element.removeAttribute("disabled");
    }
}
function setAllUsers()
{
    console.log('---setAllUsers()---');
    // USER TABLE
    // usersTab
    var dataL=usersTab.length;
    var rowL=Object.keys(usersTab).length;
    var allUsersData=document.getElementById("allUsersData");
    removeHtmlChilds(allUsersData);
    console.log('DATA LENGTH: '+dataL);
    console.log('DATA ROW LENGTH: '+rowL);
    var divBtnGroupAtr=new Array(
                Array('class','btn-group pull-left')
                );
    var divBtnGroup='';
    var btnAtr=new Array(
                Array('class',''),
                Array('name',''),
                Array('id',''),
                Array('data-toggle',"modal"),
                Array('data-target','#AdaptedModal'),
                Array('no-disabled','') 
                );
    var btnConfig=new Array(
            new Array('btn-info','details','Dane','SHOW_USER'),
            new Array('btn-warning','permissions','Uprawnienia','SHOW_PERM_USER'),
            new Array('btn-danger','dUser','Usuń','DEL_USER')
         );
    var btn='';
    var tr='';
    var td='';
    var tdOption='';
    var disabled='no-disabled';
    for(var i = 0; i < dataL; i++)
    {    
        tr=createHtmlElement('tr',null,null);
        for(var prop in usersTab[i])
        {
            if(usersTab[i].hasOwnProperty(prop))
            {
                td=createHtmlElement('td',null,null);
                td.innerText=usersTab[i][prop];
                tr.appendChild(td);
            }
        }      
        divBtnGroup=createHtmlElement('div',divBtnGroupAtr,null);
        for(var z=0;z<btnConfig.length;z++)
        {
            if(loggedUserPerm.indexOf(btnConfig[z][3])===-1)
            {
                disabled='disabled';
            }
            btnAtr[0][1]='btn position-relative '+btnConfig[z][0]+' '+disabled;
            btnAtr[1][1]=btnConfig[z][1];
            btnAtr[2][1]='idUser:'+usersTab[i].ID;
            btnAtr[5][0]=disabled;
            btn=createHtmlElement('button',btnAtr,null);
            btn.innerText=btnConfig[z][2];
            btn.onclick=function(){ createAdaptedModal(this.name,this.id);};
            
            divBtnGroup.appendChild(btn);
            disabled='no-disabled';
        }
        tdOption=createHtmlElement('td',null,null);
        
        tdOption.appendChild(divBtnGroup);
        tr.appendChild(tdOption);
        allUsersData.appendChild(tr);
    };
    console.log(allUsersData);
}
function createHtmlElement(htmlTag,elementAttribute,elementStyle)
{
    //console.log('---createElement()---');
    var htmlElement=document.createElement(htmlTag);
    var i=0;
    // ASSIGN Attribute
    if(elementAttribute!==null && elementAttribute!==undefined)
    {
        for(j=i;j<elementAttribute.length;j++)
        {
            htmlElement.setAttribute(elementAttribute[j][0],elementAttribute[j][1]);
        };
    }
    // ASSIGN STYLES
    if(elementStyle!==null && elementStyle!==undefined)
    {
         for(j=i;j<elementStyle.length;j++)
        {
            htmlElement=addStyleToHtmlTag(htmlElement,elementStyle[j][0],elementStyle[j][1]);
        };
    }
    //console.log(htmlElement);
    return (htmlElement);
}
function addStyleToHtmlTag(htmlElement,styleName,styleValue)
{
    //console.log('---addStyleToHtmlTag()---');
    switch(styleName)
    {
        case 'border':
            htmlElement.style.border=styleValue;
            break;
        case 'backgroundColor':
            htmlElement.style.backgroundColor=styleValue;
            break;
        case 'borderColor':
            htmlElement.style.borderColor=styleValue;
            break;
        case 'color':
            htmlElement.style.color=styleValue;
            break;
        case 'borderTopRightRadius':
            htmlElement.style.borderTopRightRadius=styleValue;
            break;
        case 'borderBottomRightRadius':
            htmlElement.style.borderBottomRightRadius=styleValue;
            break;
        case 'borderTopLeftRadius':
            htmlElement.style.borderTopLeftRadius=styleValue;
            break;
        case 'borderBottomLeftRadius':
            htmlElement.style.borderBottomLeftRadius=styleValue;
            break;
        case 'display':
            htmlElement.style.display=styleValue;
            break;
        default:
            break;
    };
    return(htmlElement);
}
function clearAdaptedComponent()
{
    removeHtmlChilds(document.getElementById('AdaptedDynamicData'));
    removeHtmlChilds(document.getElementById('AdaptedButtonsBottom'));
    removeHtmlChilds(document.getElementById('AdaptedBodyExtra'));
    removeHtmlChilds(document.getElementById('AdaptedModalInfo'));
    document.getElementById('errDiv-Adapted-overall').innerText='';
    document.getElementById('errDiv-Adapted-overall').style.display='none';
}
function createAdaptedModal(modalType,idUser)
{
    console.log('---createAdaptedModal()---');
    console.log("TASK - "+modalType+"\nID USER - "+idUser);
    console.log(idUser);
    clearAdaptedComponent();
    var title=document.getElementById('AdaptedTextTitle');
    var bgTitle=document.getElementById("AdaptedBgTitle");
    bgTitle.classList.value="";
    bgTitle.classList.add("modal-header");
    var userData=splitValue(idUser,':');
    console.log(userData);
    switch(modalType)
    {
        case 'cUser':
            title.innerText='DODAJ UŻYTKOWNIKA:';
            bgTitle.classList.add("bg-info");
            getAjaxData('getNewUserSlo','',modalType,null);
            break;
        case 'details':
            title.innerText='DANE UŻYTKOWNIKA:';
            bgTitle.classList.add("bg-info");
            getAjaxData('getUserDetails','&id='+userData[1],modalType,null);
            document.getElementById('AdaptedModalInfo').innerText='User Id : '+userData[1];
            break;
        case 'permissions':
            title.innerText='UPRAWNIENIA UŻYTKOWNIKA:';
            bgTitle.classList.add("bg-warning");
            document.getElementById('AdaptedModalInfo').innerText='User Id : '+userData[1];
            currentIdUser=userData[1];
            document.getElementById('div-inputPdf7a').innerText='Current User Id : '+currentIdUser;
            getAjaxData('getUserPerm','&id='+userData[1],modalType,null);
            break;
        case 'dUser':
            title.innerText='USUŃ UŻYTKOWNIKA:';
            bgTitle.classList.add("bg-danger");
            console.log(userData[1]);
            document.getElementById('AdaptedModalInfo').innerText='User Id : '+userData[1];
            currentIdUser=userData[1];
            document.getElementById('div-inputPdf7a').innerText='Current User Id : '+currentIdUser;
            setUserDeleteBodyContent(currentIdUser);
            break;
        default:
            break;
    }
}
function splitValue(value,delimiter)
{
    console.log('---splitValue()---');
    if(value!==null && value!==undefined)
    {
        if(value.trim()!=='')
        {
            return value.split(delimiter);
        }
        else
        {
            return 0;
        }
    }  
}
function setUserDeleteBodyContent(idRecord)
{
    console.log('---setUserDeleteBodyContent()---');
    var dataDiv=getEmplDefModal();
    var form=dataDiv.childNodes[1].childNodes[1];
    console.log(form.childNodes[1]);
    form.name='deleteUser';
    console.log(form.childNodes[1]);

    createHiddenInpRowEmployeeRowContent(form.childNodes[1],idRecord);
    document.getElementById('AdaptedButtonsBottom').appendChild(createBodyButtonContent('deleteUser'));
    
    document.getElementById('AdaptedDynamicData').appendChild(dataDiv);
    console.log(dataDiv);
}
function genTextNode(task)
{
    console.log('---genTextNode()---\n'+task);
    //var textAlert = document.createTextNode('Pracownik nie może zostać usunięty ponieważ bierze udział w poniższych projektach:');
    var info='';
    var tag='h4';
    var hAtr=new Array(
                Array('class','text-danger mb-3 text-center font-weight-bold')
                );
    //p.appendChild(textAlert);
    switch(task)
    {
        case 'projects':
            tag='h4';
            hAtr[0][1]='text-dark mb-3 text-center font-weight-bold';
            info='Aktualny wykaz projektów powiązanych z pracownikiem:';
            break;
        case 'noprojects':
            tag='h4';
            hAtr[0][1]='text-dark mb-3 text-center font-weight-bold';
            info='Aktualnie pracownik nie bierze udziału w żadnym projekcie.';
            break;
        case 'dEmployee':
            info='Pracownik nie może zostać usunięty ponieważ bierze udział w poniższych projektach:';
            break;
        default:
            break;
    }
    
    var h=createHtmlElement(tag,hAtr,null);
    h.innerText=info;
    return(h);
}
function createHiddenInpRowEmployeeRowContent(whereAppend,userId)
{
    // ADD HIDDEN INPUT WITH ID
    var inpAtr=new Array(
                Array('type','hidden'),
                Array('name','idUser'),
                Array('value',userId)
                );
    var inp=createHtmlElement('input',inpAtr,null);
    whereAppend.appendChild(inp); 
}
function createEmployeeProjectsRowContent(whereAppend,employeeProj,titleElement)
{
    console.log('---createDeleteEmployeeRowContent()---');
    console.log(whereAppend);
    var dataL=employeeProj.length;
    var rowL=Object.keys(employeeProj[0]).length;
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
    for(var prop in employeeProj[0])
        {
            if(employeeProj[0].hasOwnProperty(prop))
            {
                td=createHtmlElement('td',null,null);
                td.innerText=prop;
                tr.appendChild(td);
            }
        }
    table.appendChild(tr);   
    // GET DATA
    for(var i=0;i<employeeProj.length;i++)
    {
        tr=createHtmlElement('tr',null,null);
        for(var prop in employeeProj[i])
        {
            if(employeeProj[i].hasOwnProperty(prop))
            {
                td=createHtmlElement('td',null,null);
                td.innerText=employeeProj[i][prop];
                tr.appendChild(td);
            }
        }
        table.appendChild(tr);
    };
    whereAppend.appendChild(table);
}
function setUserPermBodyContent(task,status)
{
    console.log('---setUserPermBodyContent()---');
    console.log('ID USER: '+currentIdUser);
    
    var dataDiv=getEmplDefModal();
    var form=dataDiv.childNodes[1].childNodes[1];
    form.name='userPermissions';
    createHiddenInpRowEmployeeRowContent(form.childNodes[1],currentIdUser)
    setUserPermContent(form.childNodes[1],status);
    document.getElementById('AdaptedDynamicData').appendChild(dataDiv);
    console.log(dataDiv);
    
    document.getElementById('AdaptedButtonsBottom').appendChild(createBodyButtonContent(task));

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
function setUserBodyContent(task,status)
{
    console.log('---setUserBodyContent()---');
    
    var dataDiv=getEmplDefModal();
    var form=dataDiv.childNodes[1].childNodes[1];
    //console.log(form.childNodes[1]);
    form.name=task;
   
    //console.log(form.childNodes[1]);
    switch(status)
    {
        case 0:
                //BLOCKED WITH DATA
                createEditedUserRowContent(form.childNodes[1],status);
                document.getElementById('AdaptedButtonsBottom').appendChild(createBodyButtonContent(task));
            break;
        case 1:
                //NEW EMPLOYEE
                createNewUserRowContent(form.childNodes[1]);
                document.getElementById('AdaptedButtonsBottom').appendChild(createBodyButtonContent(task));
                addLegendDiv();
            break;
        case 2:
                //EDIT EMPLOYEE
                createEditedUserRowContent(form.childNodes[1],1);
                document.getElementById('AdaptedButtonsBottom').appendChild(createBodyButtonContent(task));
                addLegendDiv();
                
            break;
        default:
            break;
    }
    console.log(dataDiv);
    
    document.getElementById('AdaptedDynamicData').appendChild(dataDiv);
}
function addLegendDiv()
{
    var legendDiv=document.getElementById('legendDiv').cloneNode(true);
    legendDiv.classList.remove("modal");
    legendDiv.classList.remove("fade");
    document.getElementById('AdaptedBodyExtra').appendChild(legendDiv);
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
            case 't':
                inputAttribute[4][1]=assignProjectDataToField(userFields[i][2]);
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+userFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                inputElement.onblur=function()
                {
                    parseFieldValue(this,null,null);
                };
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'p':
                inputAttribute[0][1]='password';
                setInputMode(0);
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+userFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                inputElement.onblur=function()
                {
                    parseFieldValue(this,null,null);
                };
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                setInputMode(status);
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
                var fields=new Array ('ID','NAZWA');
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
            case 't':
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+userFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                inputElement.onblur=function()
                {
                    parseFieldValue(this,null,null);
                };
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'p':
                inputAttribute[0][1]='password';
                setInputMode(0);
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+userFields[i][2];
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                inputElement.onblur=function()
                {
                    parseFieldValue(this,null,null);
                };
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                setInputMode(1);
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
                //newUserRole(); NOT NEED
                var fields=new Array ('ID','NAZWA');
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
function setPassFieldState(fieldValue)
{
    console.log('---setPassFieldState()---');
    var passField=document.getElementById('haslo');
    console.log(fieldValue);
    console.log(passField.attributes);
    console.log(passField.hasAttribute('no-readonly'));
    console.log(passField.hasAttribute('disabled'));
    if(fieldValue==='l')
    //if(passField.hasAttribute('readonly') && passField.hasAttribute('disabled'))
    {
        passField.removeAttribute("readonly");
        passField.removeAttribute("disabled");
    }
    else
    {
        passField.setAttribute("readonly", "TRUE");
        passField.setAttribute("disabled", "");
    }
}
function newUserRole()
{
    console.log('---newUserRole()---');
    var tmp=new Array();
    tmp.push({ID:'0',NAZWA:""});
    for(var z=0;z<userRoleSlo.length;z++)
    {
        //console.log('ROLA:');
        //console.log(userRoleSlo[z]);
        tmp.push(userRoleSlo[z]);
    }
    userRoleSlo=tmp;
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
function getEmplDefModal()
{
    console.log('---getEmplDefModal()---');
    var mainTemplate=document.getElementById('formModalDetail').cloneNode(true);
    mainTemplate.classList.remove("modal");
    mainTemplate.classList.remove("fade");
    return(mainTemplate);
}
function parseFieldValue(data,fieldType,errDivAlt)
{
    console.log('---parseFieldValue()---');
    console.log('FIELD TYPE: '+fieldType+'\nERR DIV ALT: '+errDivAlt);
    console.log("DATA TYPE: "+typeof(data));
    var errDiv='';
    var plChars='ąĄćĆęĘłŁńŃóÓśŚżŻźŹ';
    var valueToParse='';
    var typeOfValueToParse='';
    if(typeof(data)==='object')
    {
        valueToParse=data.value;
        typeOfValueToParse=data.name;
        errDiv=data.parentNode.childNodes[1];   
        console.log(data.parentNode.childNodes[1]);
        console.log(data.name);
        typeOfValueToParse=data.name;
    }
    else
    {
        valueToParse=data;
        typeOfValueToParse=fieldType;
        errDiv=document.getElementById(errDivAlt);
    };
    valueToParse=valueToParse.trim();
    switch(typeOfValueToParse)
    {
        case 'imie':
                if(valueToParse.length>2)
                {
                    regExp(valueToParse,typeOfValueToParse,"^[a-zA-Z"+plChars+"][\\sa-zA-Z"+plChars+"]*[a-zA-Z"+plChars+"]{1}$",errDiv);
                }
                else
                {
                    console.log('ERROR LENGTH');
                    setErrTab(typeOfValueToParse);
                    showDivErr(errDiv,'Błąd składni');
                }
                break;
        case 'login': // MIN 3 MAX 30 CHARACTERS
                regExp(valueToParse,typeOfValueToParse,"^[a-zA-Z][a-zA-Z\\d]{2,29}$",errDiv);
                break;
        case 'nazwisko':
                if(valueToParse.length>2)
                {
                    regExp(valueToParse,typeOfValueToParse,"^[a-zA-Z"+plChars+"][\\-\\sa-zA-Z"+plChars+"]*[a-zA-Z"+plChars+"]{1}$",errDiv);
                }
                else
                {
                    console.log('ERROR LENGTH');
                    setErrTab(typeOfValueToParse);
                    showDivErr(errDiv,'Błąd składni');
                }
            break;
        case 'email':
                if(valueToParse.length>0)
                {
                    regExp(valueToParse,typeOfValueToParse,"^[a-zA-Z][\\d\\-\\_\\.\\s\\da-zA-Z]*@[\\da-zA-Z]{2,}.[a-zA-Z]{2,}$",errDiv);
                }
                else
                {
                    removeErrTab(typeOfValueToParse);
                    hideDivErr(errDiv);
                }
            break;
        default:
            break;
    }
  
}
function regExp(value,valueType,testCondition,errDiv)
{
    console.log('---regExp()---');
    var thisRegex = new RegExp(testCondition);
    if(!thisRegex.test(value))
    {
        console.log('ERROR');
        console.log('[err]['+valueType+'] '+value);
        setErrTab(valueType);
        showDivErr(errDiv,'Błąd składni');
    }
    else
    {
        console.log('[ok]['+valueType+'] '+value);
        removeErrTab(valueType);
        hideDivErr(errDiv);
    }
}
function setErrTab(fName)
{
    console.log('---setErrTab()---');
    console.log('FNAME: '+fName);
    if(errInputValue.indexOf(fName)===-1)
    {
        errInputValue.push(fName); 
    };
}
function removeErrTab(fName)
{
    console.log('---removeErrTab()---');
    console.log('FNAME: '+fName);
    if(errInputValue.indexOf(fName)!==-1)
    {
        errInputValue.splice(errInputValue.indexOf(fName), 1 );
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
function checkIsErr()
{
    console.log('---checkIsErr()---');
    var errExists=false;
    for(i=0;i<errInputValue.length;i++)
    {
        errExists=true;
        console.log(i+" - "+errInputValue[i]);
    }
    return (errExists);
}
function removeHtmlChilds(htmlElement)
{
    console.log('---removeHtmlChilds()---');
    while (htmlElement.firstChild)
    {
        //console.log(htmlElement.firstChild);
        htmlElement.firstChild.remove(); 
    };
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
    if(loggedUserPerm.indexOf('SHOW_PERM_USER')===-1)
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
        if(loggedUserPerm.indexOf('SHOW_PERM_USER')===-1)
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
            cboxAtr[2][1]='cbox-ID:'+data[i].ID+'-NAME:'+data[i].NAZWA;
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
        
    };
    console.log(divOverAll);
    return(divOverAll);
}
function addHiddenInput(name,value)
{
    console.log('---addHiddenInput()---');
    var input=document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("value",value);
        input.setAttribute("name",name);
    return (input);
}
function changeBoxValue(input)
{
    console.log('---changeBoxValue()---');
    //console.log(input);
    //console.log(input.value);
    //console.log(typeof(input.value));
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
function createBodyButtonContent(task)
{
    console.log('---createBodyButtonContent()---');
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
    cancelButton.onclick = function() { closeModal('AdaptedModal'); };
    // ADD BUTTON
    var confirmButtonAtr = new Array(
             Array('class','btn btn-info btn-add')
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
        case 'deleteUser':
            confirmButtonAtr[0][1]='btn btn-danger';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Usuń';
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'permissions':
            confirmButtonAtr[0][1]='btn btn-warning';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function()
            {
                removeHtmlChilds(document.getElementById('AdaptedDynamicData'));
                removeHtmlChilds(document.getElementById('AdaptedButtonsBottom'));
                setUserPermBodyContent('userPermissions',1); 
            };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'details':
            confirmButtonAtr[0][1]='btn btn-info';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Edytuj';
            confirmButton.onclick = function()
            {
                removeHtmlChilds(document.getElementById('AdaptedDynamicData'));
                removeHtmlChilds(document.getElementById('AdaptedButtonsBottom'));
                setUserBodyContent('editUser',2); 
            };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        case 'editUser':
        case 'userPermissions':
            confirmButtonAtr[0][1]='btn btn-primary';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = 'Zatwierdź';
            confirmButton.onclick = function() { postDataToUrl(task); };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;
        default:
            alert('[createBodyButtonContent()]ERROR - wrong task');
            break;
    };
    
    return(divButtonElement);
}
function closeModal(modalId)
{
    $('#'+modalId).modal('hide');
}
function postDataToUrl(nameOfForm)
{
    console.log('---postDataToUrl()---');
    console.log(nameOfForm);
    var taskUrl='modul/manageUser.php?task='+nameOfForm;
    var confirmTask=false;

    switch(nameOfForm)
    {
        case 'cUser':
        case 'editUser':    
            parseFieldValue( document.getElementById('imie').value,"imie","errDiv-imie");
            parseFieldValue( document.getElementById('nazwisko').value,"nazwisko","errDiv-nazwisko");
            parseFieldValue( document.getElementById('login').value,"login","errDiv-login");
            parseFieldValue( document.getElementById('email').value,"email","errDiv-email");
            if(checkIsErr())
            {
                console.log("err is true");
                return(0);
            };
            confirmTask=true;
            break;
        case 'deleteUser':
            confirmTask = confirm("Potwierdź usunięcie użytkownika");
            break;
        case 'userPermissions':
            confirmTask=true;
            break;
        default:
            break;
    }; 
    if (confirmTask)
    {
        sendData(nameOfForm,taskUrl);
    };
}
function sendData(nameOfForm,taskUrl)
{
    console.log('---sendData()---');
    var xmlhttp = new XMLHttpRequest();
    var host =  getUrl();
    var url =  host+taskUrl;
    xmlhttp.onreadystatechange = function()
        {
          if (this.readyState === 4 && this.status === 200)
          {
                runTaskAfterAjax(nameOfForm,this.responseText);
          }
          else
          {
              //console.log("error ajax"+this.status+" state - "+this.readyState);
          }
        };
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.send(createDataToSend(nameOfForm));
}
function runTaskAfterAjax(nameOfForm,response)
{
    console.log('---runTaskAfterAjax()---');
    console.log(response);
    var responseData = JSON.parse(response);
    if(responseData[0]==='1')
    {
        setOverAllErrDiv(responseData[1],true);
    }
    else
    {
        setOverAllErrDiv(responseData[1],false);
        switch(nameOfForm)
        {
            case 'cUser':
                setNewDataState('User added');
                break;
            case 'deleteUser':
                setNewDataState('User removed');
                break;
            case 'editUser':
            case 'userPermissions':
                setNewDataState('User updated');
                break;
            default:
                alert('[runTaskAfterAjax()]WRONG TASK - '+nameOfForm);
                break;
        } 
    } 
}
function setNewDataState(infoAlert)
{
    alert(infoAlert);
    getAjaxData('getusers','','sUsers',null);
    $('#AdaptedModal').modal('hide'); 
}
function setOverAllErrDiv(data,action)
{
    console.log('---setOverAllErrDiv()---');
    var errDiv=document.getElementById('errDiv-Adapted-overall');
    if(action)
    {
        errDiv.innerHTML=data;
        errDiv.style.display = "block";  
    }
    else
    {
        errDiv.innerHTML='';
        errDiv.style.display = "none";  
    };
}
function createDataToSend(nameOfForm)
{
    console.log('---createDataToSend---\nName of form - '+nameOfForm);
    var formToCheck=document.getElementsByName(nameOfForm);
    console.log(document.getElementById(nameOfForm));
    console.log(formToCheck);
    var fieldName;
    var fieldValue;
    var params = '';
    
    for( var i=0; i<formToCheck[0].elements.length; i++ )
    {
        fieldName =formToCheck[0].elements[i].name;
        fieldValue =formToCheck[0].elements[i].value;
        //console.log(i+'| form name: '+fieldName+" form value: "+fieldValue);
        if(fieldName!=='')
        {
            console.log(fieldName+" - "+fieldValue);
            params += fieldName + '=' + fieldValue + '&'; 
        } 
    }
    //console.log(params);
    return params;
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
getAjaxData('getusers','','sUsers',null);