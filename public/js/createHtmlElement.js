/* VERSION 18.09.2019 */
// GLOBAL INPUT PROPERTIES
var inputAttribute= new Array(
        Array('type','text'),
        Array('class','form-control mb-1'),
        Array('name','inputProject'),
        Array('id','inputProject'),
        Array('value',''),
        Array('placeholder',''),
        Array('no-readOnly','true'),
        Array('no-disabled',''),
	Array('maxlength',"30")
        );
var inputStyle=new Array();
// ADD BUTTON
var addButtonAttribute=new Array(
            Array('class','btn btn-success btn-add disabled')
            );
// FUNCTION CREATE ANY HTML ELEMENT
// a. html tag to setup
// b. array of array to setup tag attribute
// c. array of classes
// d. array of css
function createHtmlElement(htmlTag,elementAttribute,elementStyle)
{
    //console.log('---createHtmlElement()---\n'+htmlTag);
    //console.log(elementAttribute);
    //console.log(elementClassList);
    //console.log(elementStyle);
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
            //console.log(elementStyle[j][0]);
            //console.log(elementStyle[j][1]);
            //htmlElement.style.elementStyle[j][0] = elementStyle[j][1];
            htmlElement=addStyleToHtmlTag(htmlElement,elementStyle[j][0],elementStyle[j][1]);
        };
    }
    //console.log(htmlElement);
    return (htmlElement);
}
function addStyleToHtmlTag(htmlElement,styleName,styleValue)
{
    console.log('CSS NAME: '+styleName+'\nCSS VALUE: '+styleValue);
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
        case 'width':
            htmlElement.style.width=styleValue;
            break;
        case 'rows':
            htmlElement.rows=styleValue;
            break;
        case 'cols':
            htmlElement.cols=styleValue;
            break;
        case 'resize':
            break;
        default:
            console.log('===addStyleToHtmlTag()=== invalid css\n'+styleName)
            break;
    };
    return(htmlElement);
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
function removeHtmlChildsDirect(htmlElement)
{
    console.log('---removeHtmlChildsDirect()---');
    //console.log(htmlElement);
    while (htmlElement.firstChild)
    {
        //console.log(ele.firstChild);
        htmlElement.firstChild.remove(); 
    };
}
function removeHtmlElement(ele)
{
    ele.parentNode.removeChild(ele);
}
function addHiddenInput(name,value)
{
    console.log('===addHiddenInput()===');
    var input=document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("value",value);
        input.setAttribute("name",name);
    return (input);
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
 * SET INPUT MODE
 */
function setInputMode(mode)
{
    //console.log('---setInputMode()---\n'+mode);
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
function closeModal(modalId)
{
    $('#'+modalId).modal('hide');
}
function createAddButton2()
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
function createAddButton()
{
    // i PARAMETERS
    var removeButtonIattribute=new Array(
	Array('class','fa fa-plus'),
	Array('aria-hidden','true')
	);

    var removeButtonIstyle=new Array(
	Array('color','#ffffff')
    );
    var iElement=createHtmlElement('i',removeButtonIattribute,removeButtonIstyle,null);
    // div-button PARAMETERS
    var removeButtonDivButtonAttribute=new Array(
	Array('class','btn btn-success  mt-0'), //disabled
	);
        var removeButtonDivButtonStyle=new Array();
        /*
    var removeButtonDivButtonStyle=new Array(
	Array('borderTopLeftRadius','0px'),
        Array('borderBottomLeftRadius','0px')
    );
     * */
         
    var divRemoveButtonElement=createHtmlElement('div',removeButtonDivButtonAttribute,removeButtonDivButtonStyle);
    
    divRemoveButtonElement.appendChild(iElement);
    return(divRemoveButtonElement); 
}
function createRemoveButton(rmvBtnStatus,task)
{
    // i PARAMETERS
    var removeButtonIattribute=new Array(
	Array('class','fa fa-minus'),
	Array('aria-hidden','true')
	);

    var removeButtonIstyle=new Array(
	Array('color','#ffffff')
    );
    var iElement=createHtmlElement('i',removeButtonIattribute,removeButtonIstyle,null);
    // div-button PARAMETERS
    var removeButtonDivButtonAttribute=new Array(
	Array('class','btn btn-danger gt-no-rounded-left '+rmvBtnStatus) // disabled
	);
    var removeButtonDivButtonStyle=new Array(
	Array('borderTopLeftRadius','0px'),
        Array('borderBottomLeftRadius','0px')
    );
    if(task==='cEmail')
    {
         removeButtonDivButtonStyle.push(Array('width','49px'));
    }
    var divRemoveButtonElement=createHtmlElement('div',removeButtonDivButtonAttribute,removeButtonDivButtonStyle);
    
    divRemoveButtonElement.appendChild(iElement);
    return(divRemoveButtonElement); 
}
function checkLength(field,type)
{
    console.log('---checkLength()---');
    console.log('TYPE: '+type);
    console.log('NAME: '+field.name);
    var max=30;
    var min=0;
    var fValue=field.value;
    var fName=field.name;
    var divId='';
    var divErr='';
    fValue=fValue.trim();
    var fLength=fValue.length;
    console.log(fValue.length);
    switch(type)
    {
       case 'doc':
            // GET DIV ERR
            // SET ARRAY OF ERRORS
            //console.log(field.parentNode.parentNode.childNodes[2].getAttribute('id'));
            //divErr=field.parentNode.parentNode.childNodes[2];
            //divId=field.parentNode.parentNode.childNodes[2].getAttribute('id');
            divErr=document.getElementById('errDiv-'+field.name);
            divId='errDiv-'+field.name;
            if(fLength>min)
            {
                if(fLength>max)
                {
                    setErrTab(fName);
                    showDivErr(divErr,'[L:'+fLength+']FIELD VALUE TOO LONG');
                }
                else
                {
                    parseFieldValue(fValue,fName,divId);
                };
            }
            else
            {
                removeErrTab(fName);
                hideDivErr(divErr);
            };
            break;
        case 'umowa':
            break;
        case 'temat':
            break;
        default:
            break;
    };
}
function getFormInpByName(formName)
{
    console.log('===fetFormInp()===\n'+formName);
    var htmlForm=document.getElementsByName('postData');
    console.log(htmlForm);
    var inp=new Array();
    for( var i=0; i<htmlForm[0].elements.length; i++ )
    {
        inp.push(Array(htmlForm[0].elements[i].name,htmlForm[0].elements[i].value))  
    }  
    console.log(inp);
    return (inp);
}