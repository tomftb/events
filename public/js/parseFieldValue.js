/* VERSION 18.09.2019 */
var errInputValue=new Array();
// PARSE FIELD VALUE
function parseFieldValue(data,fieldType,errDivAlt)
{
    console.log('===parseFieldValue()===');
    console.log('FIELD TYPE: '+fieldType+'\nERR DIV ALT: '+errDivAlt);
    console.log("DATA TYPE: "+typeof(data));
    var errDiv='';
    var plChars='ąĄćĆęĘłŁńŃóÓśŚżŻźŹ';
    var valueToParse='';
    var typeOfValueToParse='';
    var typeOfValue='';
    if(typeof(data)==='object')
    {
        console.log('object');
        valueToParse=data.value;
        typeOfValueToParse=data.name;
        errDiv=data.parentNode.childNodes[1];   
        //console.log(data.parentNode.childNodes[1]);
        //console.log(data.name);
        typeOfValueToParse=data.name;
    }
    else
    {
        console.log('no object');
        valueToParse=data;
        typeOfValueToParse=fieldType;
        errDiv=document.getElementById(errDivAlt);
    };
    valueToParse=valueToParse.trim();
    typeOfValueToParse=typeOfValueToParse.split('-');
    console.log('type - '+typeOfValueToParse[0]);
    typeOfValue=typeOfValueToParse[0].toString();
    console.log('type of value to parse - '+typeOfValue);
    switch(typeOfValue)
    {
        case 'wiadomosc':
            checkValueLength(0,65535,valueToParse,typeOfValue,errDiv);
            break;
        case 'temat':
            checkValueLength(1,128,valueToParse,typeOfValue,errDiv); 
            break;
        case 'nazwa': // MIN 3 MAX 30 CHARACTERS
            regExp(valueToParse,typeOfValue,"^[a-zA-Z"+plChars+"][a-zA-Z"+plChars+"\\d]{2,29}$",errDiv);
            break;
        case 'extra':
        case 'klient_umowy':
        case 'numer_umowy':
        case 'temat_umowy':
            regExp(valueToParse,typeOfValue,"^[\\da-zA-Z'"+plChars+"][\\/\\-\\_\\s\\da-zA-Z"+plChars+"]*[\\.\\s\\da-zA-Z"+plChars+"]{1}$",errDiv);
            break;
        case 'login':
            regExp(valueToParse,typeOfValue,"^[a-z][\\da-z]*[\\da-z]{3,30}$",errDiv);
            break;
        case 'imie':
                if(valueToParse.length>2)
                {
                    regExp(valueToParse,typeOfValue,"^[a-zA-Z'"+plChars+"][\\sa-zA-Z"+plChars+"]*[a-zA-Z"+plChars+"]{1}$",errDiv);
                }
                else
                {
                    console.log('ERROR LENGTH');
                    setErrTab(typeOfValue);
                    showDivErr(errDiv,'Błąd składni');
                }
                break;
        case 'nazwisko':
                if(valueToParse.length>2)
                {
                    regExp(valueToParse,typeOfValue,"^[a-zA-Z'"+plChars+"][\\-\\sa-zA-Z"+plChars+"]*[a-zA-Z"+plChars+"]{1}$",errDiv);
                }
                else
                {
                    console.log('ERROR LENGTH');
                    setErrTab(typeOfValue);
                    showDivErr(errDiv,'Błąd składni');
                }
            break;
        case 'stanowisko':
                if(valueToParse.length>0)
                {
                    regExp(valueToParse,typeOfValue,"^[\\da-zA-Z'"+plChars+"][\\/\\-\\_\\.\\s\\da-zA-Z"+plChars+"]*[\\.\\da-zA-Z"+plChars+"]{1}$",errDiv);
                }
            break;
        case 'address_id':
                var typeOfValue2=typeOfValueToParse[1].toString();
                typeOfValue="s-"+typeOfValue+'-'+typeOfValue2;
                errDiv=document.getElementById(errDivAlt);
                console.log(errDiv);
        case 'email':
                console.log('VALUE TO PARSE LENGHT = '+valueToParse.length);
                valueToParse=decodeValue(valueToParse);
                console.log(valueToParse);
                if(!checkValueLength(1,40,valueToParse,typeOfValue,errDiv))
                {
                    //regExp(valueToParse,typeOfValue,"^[a-zA-Z][\\d\\-\\_\\.\\s\\da-zA-Z]*@[\\da-zA-Z]{2,}.[a-zA-Z]{2,}$",errDiv);
                    //regExp(valueToParse,typeOfValue,"^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$",errDiv);
                    regExp(valueToParse,typeOfValue,"^\\w+([\\.\\-]?\\w+)*@\\w+([\\.\\-]?\\w+)*(\\.\\w{2,3})+$",errDiv);
                }
            break;
        case 'emailexist':
            regExp(valueToParse,typeOfValue,"^[a-zA-Z][\\d\\-\\_\\.\\s\\da-zA-Z]*@[\\da-zA-Z]{2,}.[a-zA-Z]{2,}$",errDiv);
            break;
        case 'emailAccount':
                var typeOfValue2=typeOfValueToParse[1].toString();
                regExp(valueToParse,typeOfValue+'-'+typeOfValue2,"^[a-zA-Z][\\d\\-\\_\\.\\s\\da-zA-Z]*@[\\da-zA-Z]{2,}.[a-zA-Z]{2,}$",errDiv);
            break;   
        case 'multiplyEmailAccount':
                var valueArray=valueToParse.split(';');
                for(var i=0;i<valueArray.length;i++)
                {
                    regExp(valueArray[i],typeOfValue+'-'+typeOfValue2,"^[a-zA-Z][\\d\\-\\_\\.\\s\\da-zA-Z]*@[\\da-zA-Z]{2,}.[a-zA-Z]{2,}$",errDiv);
                }          
            break; 
        case 'rejestr_id':
                typeOfValue=typeOfValueToParse[0].toString()+'-'+typeOfValueToParse[1].toString();
                regExp(valueToParse,typeOfValue,"^([a-zA-Z][a-zA-Z]*[\\-\\_]{0,1}[a-zA-Z][a-zA-Z]*[\\-\\_]{0,1})|([a-zA-Z][a-zA-Z]*[\\-\\_]{0,1})[a-zA-Z\\d]*$",errDiv);
            break;
        case 'pracownik_id':
                //valueToParse=parseInt(valueToParse,10);
                typeOfValue=typeOfValueToParse[0].toString()+'-'+typeOfValueToParse[1].toString();
        case 'unsignedinteger':
                regExp(valueToParse,typeOfValue,"^[\\d][\\d]{0,7}$",errDiv);
            break;  
            
        case 'symbol':
            regExp(valueToParse,typeOfValue+typeOfValueToParse[1]+typeOfValueToParse[2],"^[\\da-zA-Z'"+plChars+"][\\/\\-\\.\\_\\s\\da-zA-Z"+plChars+"]*[\\.\\s\\da-zA-Z"+plChars+"]{1}$",errDiv);
            break;
        case 's':
            // list check 
            console.log('recursion');
            parseFieldValue(data,typeOfValueToParse[1].toString()+'-'+typeOfValueToParse[2].toString(),errDivAlt);
            break;
        case 'emlNewCat':
            regExp(valueToParse,fieldType,"^[a-zA-Z'"+plChars+"][\\-\\_\\d\\sa-zA-Z"+plChars+"]{0,13}[\\da-zA-Z"+plChars+"]{1}$",errDiv);
            break;
        default:
            console.log('---parseFieldValue() wrong type ---');
            break;
    }
}
// REG EXP
function regExp(value,valueType,testCondition,errDiv)
{
    console.log('===regExp()===\n TEST CONDITION : '+testCondition);
    var thisRegex = new RegExp(testCondition);
    if(!thisRegex.test(value))
    {
        console.log('ERROR');
        console.log('[err]['+valueType+'] ['+value+']');
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
    console.log('FNAME: '+fName+"\nindex of:");
    console.log(errInputValue.indexOf(fName));
    console.log(errInputValue.indexOf('nazwa'));
    if(errInputValue.indexOf(fName)===-1)
    {
        console.log('append');
        errInputValue.push(fName); 
    };
    console.log(errInputValue);
}
function removeErrTab(fName)
{
    console.log('---removeErrTab()---');
    console.log('FNAME: '+fName);
    if(errInputValue.indexOf(fName)!==-1)
    {
        console.log('remove');
        errInputValue.splice(errInputValue.indexOf(fName), 1 );
    };
    console.log(errInputValue);
}
function showDivErr(div,value)
{
    console.log('---showDivErr()---');
    //console.log(div);
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
function removeErrFromTab(indexToRemove)
{
    console.log('---removeErrFromTab()---');
    errInputValue.splice( errInputValue.indexOf(indexToRemove), 1 );
}
function setConfirmButton(err,button)
{
    console.log('===setConfirmButton()===');
    console.log(err);
    var element = document.getElementById(button);
    if(err)
    {
        console.log("button disabled");
        element.classList.add("disabled");
        element.setAttribute("disabled", "TRUE");
    }
    else
    {
       console.log("button enabled");
       element.classList.remove("disabled");
       element.removeAttribute('disabled');
    };
}
function decodeValue(value)
{
    console.log('---decodeValue()---\n'+value);
    //value = value.replace(/\\/g, "");
    //value = value.replace(/\//g, "");
    value=decodeURIComponent(value);
    value = value.replace(/\%2A/g, "*");
    value = value.replace(/\%28/g, "(");
    value = value.replace(/\%29/g, ")");
    value = value.replace(/\%2E/g, ".");
    value = value.replace(/\%3B/g, ";");
    //console.log(value);
    //el.attr('data-content', 'ASDASD');
    return value;
}
function encodeValue(value)
{
    console.log('---encodeValue()---\n'+value);
    value = value.replace(/\\/g, "");
    value = value.replace(/\//g, "");
    value=encodeURIComponent(value);
    value = value.replace(/\*/g, "%2A");
    value = value.replace(/\(/g, "%28");
    value = value.replace(/\)/g, "%29");
    value = value.replace(/\./g, "%2E");
    value = value.replace(/\;/g, "%3B");
    //console.log(value);
    //el.attr('data-content', 'ASDASD');
    return value;
}
function checkValueLength(min,max,value,typeOfValue,errDiv)
{
    console.log('===checkValueLength()===\nMIN - '+min+' MAX - '+max);
    var err=true;
    if(value.length<min || value.length>max)
    {
        setErrTab(typeOfValue);
        showDivErr(errDiv,'Błąd składni');
    }
    else
    {
        removeErrTab(typeOfValue);
        hideDivErr(errDiv);
        err=false;
    }
    return err;
}