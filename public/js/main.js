/* VERSION 18.09.2019 */
/* global id */
 var dynamic_table;
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
//console.log(emailTimeInt);
var timeIntVal=parseInt(emailTimeInt.WARTOSC)*60000;
var dokCount=0;
/*
 * COLUMNS WHERE FUNCTION openEmail shouldn't work
 * @type Array
 */
var offDataTableCol = new Array(5);
/*
 * 
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

/*
 * DIV ERROR DEFAULT ATR
 * @type Array
 */        
var divErrAtr=new Array(
            Array('class','col-sm-auto alert alert-danger'),
            Array('id','')
            );
var divErrStyle=new Array(
            Array('display','none')
            );      
/*
 * 
 * PERMISSION
 */
const perm = {
    DOW_EMAIL : 'disabled',
    SEND_EMAIL : 'disabled',
    EDIT_CAT_EMAIL : 'disabled',
    DEL_EMAIL : 'disabled',
    TETA_EMAIL : 'disabled',
    SHOW_EVENT_USERS : 'disabled'

};
/*
 * EMAIL SEND TYPE
 * @type Array
 */
var emailType=new Array(
            Array('to','Do:'),
            Array('cc','Kopia:'),
            Array('bcc','Ukryta kopia:')
            );
/*
 * 
 * @type Array
 * Main Category Email
 */
var buttonShowMessage=0;
var inpNewCatCounter=0;
var mainDocArray=new Array();
var idBin=getEmailCatId('EML_BIN');
var idTeta=getEmailCatId('EML_TETA');
var idOdebrane=getEmailCatId('EML_ANSWER');
var idWyslane=getEmailCatId('EML_SEND');
var tetaprac='';
var tetarej='';
var fieldsCount=1;
var inpNumber=0;
var inpAddrNumber=0;
var currentIdEmail=1;
setPermission();
/*
 * EMAIL DATA
 */
var emailFullData=new Array();
//console.log(acl);
//console.log(perm);
//console.log(emlCat);
//console.log('MAIL_RECV - '+emailMailRecv.WARTOSC);
// INPUT FIELDS
//         new Array('hidden','','id',''),

var inputFields=new Array(
        new Array('ta','Do:','s-address',''),
        new Array('t','Temat:','temat',''),
        new Array('tx','','wiadomosc',''),
        
    );
     //new Array('hidden','','s-address_id-','')  
    // 
    /*
     *         new Array('hidden','','s-pracownik_id-',''),
        new Array('hidden','','s-rejestr_id-','')
     * @type Array
     */
// INPUT FIELDS
var inputFields2=new Array(
        new Array('n','Ile opisów?','fields-count','1')
    );
// GLOBAL SELECT
var selectAttribute=new Array(
            Array('class','form-control mb-0 pl-0 pr-0'),
            Array('id',''),
            Array('name',''),
            Array('no-readOnly','true'),
            Array('no-disabled','true')
            );
// GLOBAL 
var modalRowlabelAtr=new Array(
            Array('for','inputEmployee'),
            Array('class','col-sm-1 control-label text-right font-weight-bold')
            );
var modalRowFieldAtr=new Array(
            Array('class','col-sm-10 pl-0'),
            Array('id','divRow-0')
            );
var selectStyle=new Array();
var scrollY = $(window).innerHeight() - 540;
window.tableHandle = $('#dataTable').DataTable(
{		
  ajax: {
        url: '/getEvents',
        method: 'GET',
        deferRender: true,
        "dataSrc": "",
        beforeSend: function()
	{ 
            document.getElementById('progressBar').style.display='block';			
	},
	complete: function()
	{
            document.getElementById('progressBar').style.display='none'; 
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
        collectionLayout: 'fixed two-column',
        text: '<i class="fa fa-download"></i> Dodaj wydarzenie',
        className: 'btn btn-info '+perm['DOW_EMAIL'],
        action: function (e, dt, node, config)
        {
            downloadEmails();
        }
    },
    {
        collectionLayout: 'fixed two-column',
        text: '<i class="fa fa-pencil"></i> Wydarzenia',
        className: 'btn btn-success '+perm['SEND_EMAIL'],
        action: function (e, dt, node, config)
        {
            setupAdaptedModalProperties('cEmail',null,null);
        }
    } 
    
    ,{
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
  fnRowCallback: function (nRow,data,id) {
        //console.log(nRow)
        //console.log(data)
        //console.log(id)
        if(data.wsk_r==='n')
        {
            //$(nRow).css("font-weight", "bold");
            $(nRow).addClass("font-weight-bold");
        }
        else
        {
            //$(nRow).css("font-weight", "normal");
            $(nRow).addClass("font-weight-normal");
        }
        $(nRow).css( 'cursor', 'pointer' );
        $(nRow).on('click', 'td', function ()
        {
            console.log('---COL SELECTED---\nINDEX: '+$(this).index()+'\nID: '+data.id);
            if(offDataTableCol.indexOf($(this).index(),0)!==-1)
            {
                
                return ;
            }
            openEvent(data.id,data.wsk_r);
            // you can do additional functionality by clicking on this column here                         
        });
        //$(nRow).click(function(a,b,c,d)
        //{
            //console.log(a);
            //console.log(b);
            //console.log(c);
            //console.log(d);
            //console.log('---ROW SELECTED---\nID: '+data.id);
        //});
    },
  language: {
    search : "Szukaj",
    processing: "Trwa przetwarzanie...",
    lengthMenu: "Pokaż _MENU_ wpisów",
    info: "Wyświetlono wiadomości od _START_ do _END_ z _TOTAL_",
    infoEmpty: "Brak wpisów spełniających kryteria",
    infoFiltered: "(przefiltrowane z _MAX_)",
    loadingRecords: "Trwa wczytywanie...",
    zeroRecords: "Brak wpisów spełniających kryteria",
    emptyTable: "Brak wiadomości",
    paginate: {
      previous: "Poprzednia",
      next: "Następna"
    }
  },
  "columnDefs": [
    { "searchable": false, "targets": [0,6] }, // DISABLE SEARCH IN OPTION COLUMN
    { orderable: false, targets: [0,6] }, // DISABLE ORED IN OPTION COLUMN 
     { "visible": false, "targets": 0},  // SHOW HIDE COLUMN 
     { "width": "100px", "targets": 5 }
    ],
    "columns": [
    { // zaznacz wszystkie
        data: null,
        search:  null,  
        orderable:false,
        render: function (data, type, row)
        {
            // checkbox 
            if (type === 'display')
            {
                return '<input type="checkbox" value="' + row.id + '" class="email-checkbox" name="email[]">';
            }
            else
            {
              return '';
            }
        }  
    },
    { // READ STATUS
        data: 'temat',
        render: function (data, type, row)
        {
            return setReadStatus(type,row.wsk_r,row.temat);
        }
    },
    {
        data: 'data_koniec'
    },
    {
        data: 'autor'
    },
    {
        data: 'odbiorca'
    },
    {
        data: null,
        // parse status
        render: function (data,type,row)
        {
            return parseStatus(row);
        }
    },
    { // OPCJE
        
        "data": null,
        "width": "200px",
        render: function (data, type, row)
        {
            return createButton(type,row);
        }
    }
  ] 
 });
 // CHECK AND HIDE COLUMNS
//setVisibleCol(0);
setVisibleCol(idOdebrane);

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
    if (e.key === "Escape")
    { // escape key maps to keycode `27`
        // <DO YOUR WORK HERE>
        reloadData();
    }
});
function createButton(type, row)
{
    if (type === 'display')
    {
        emailFullData[row.id]=row;
        // parse status to button
        var btn_color='bg-primary';
        var btn_label='Zapisz się';
        var event_user_list='';
        if(getEventUserStatus(row)==='y')
        {
            btn_color='bg-danger';
            btn_label='Wypisz się';
        }
        if(perm['SHOW_EVENT_USERS']!=='disabled')
        {
            event_user_list="<button onclick=\"ajaxGet('sEventRecipients','getEventRecipient','"+row.id+"')\" class=\"btn btn-warning\" >Lista</button>";
        }
        return "<div class=\"btn-group pr-0 mr-0\"><button onclick=\"openEvent('"+row.id+"','"+row.wsk_r+"')\" class=\"btn btn-info\" >Szczegóły</button>"+event_user_list+"<button class=\"btn "+btn_color+" text-white \" style=\"min-width:100px;\" onclick=\"sendDataDirect(\'saveUserToEvent\',\'id="+row.id+"\',true)\">"+btn_label+"</button></div>";
    }
    else
    {
        return ''; // NO UPR
    };
}
function parseStatus(row)
{
    //console.log(row);
    var st=getEventUserStatus(row);
    switch(st)
    {
        case 'y':
            return "<span style=\"color:#0000ff\">Zapisany</span>";
            break;
        case 'undefined':
        case 'null':
        case 'n':
            return "<span style=\"color:#ff0000\">Niezapisany</span>";
            break;
        default :
            break;
    }
}
function getEventUserStatus(row)
{
    var status='y';
    //console.log(row.status);
    if(row.status===null)
    {
        status='n';
    }
    else
    {
        status=row.status;
    };
    return status;
}
function setReadStatus(type,wskr,data)
{
    //console.log('---setReadStatus()---');
    if(wskr==='n')
    {
        return "<p class=\"font-weight-bold\">"+data+"</p>";
    }
    return "<p class=\"font-weight-normal\">"+data+"</p>";
}
function openEvent(emailid,wsk_r)
{
    console.log('---openEvent()---\n'+emailid+'\nWSK_R: '+wsk_r);
    setupAdaptedModalProperties('sEvent',emailid,wsk_r);
}
function showUploadImg()
{
	//$('#uploadImgDiv').show();
}
$('#checkAll, #checkAllBtn').on('click', function ()
{
  var checkboxes = $('.email-checkbox').filter(':visible');
  var checkboxes_checked = checkboxes.filter(':checked');

  if (checkboxes.length == checkboxes_checked.length)
  {
		checkboxes.prop('checked', false);
		//document.getElementById("checkAll").innerHTML ="Zaznacz wszystkie";
		//document.getElementById("checkAllBtn").innerHTML ="<i class=\"fa fa-check\"></i>&nbspZaznacz wszystkie";
                document.getElementById("checkAllBtn").innerHTML ="<i class=\"fa fa-check\"></i>";
  }
  else
  {
    checkboxes.prop('checked', true);
	//document.getElementById("checkAll").innerHTML ="Odznacz wszystkie";
	//document.getElementById("checkAllBtn").innerHTML ="<i class=\"fa fa-remove\"></i>&nbspOdznacz wszystkie";
        document.getElementById("checkAllBtn").innerHTML ="<i class=\"fa fa-remove\"></i>";
  }
});
function downloadEmails()
{    
    console.log('---downloadEmails()---\n');
    console.log(perm['DOW_EMAIL']);
    if(perm['DOW_EMAIL']==='disabled') { return 0; };
    ajaxGetDirect('nEmails','downloadEmails',null);
}
function setupTetaMM(id,wskr)
{
    console.log('---setupTetaMM()---\n'+id+'\n'+wskr);
    console.log(emailFullData[id].attach.length);
    // SET CONFIRM BUTTON
    
    // check how many attachments
    if(emailFullData[id].attach.length>0)
    {
        ajaxGet('pTeta','ddiWrdImpPracReje',id);
    }
    else
    {
        alert('Brak załączników...');
    };
}
function setupTetaMMHistory(id,wskr)
{
    console.log('---setupTetaMMHistory()---\n'+id+'\n'+wskr);
    //console.log(emailFullData[id]);
    console.log(emailFullData[id].attach.length);
     // GET ACTUALY HISTORY
     // 
    // check how many attachments
    if(emailFullData[id].attach.length>0)
    {
        ajaxGet('hTeta','tetaMMHist/'+id,id);
    }
    else
    {
        alert('Brak załączników...');
    };
}
function setDefaultValues(id)
{
    console.log('===setDefaultValues()===');
    currentIdEmail=id;
    fieldsCount=1;
    inpNumber='';
    inpAddrNumber=0;
}
function setupAdaptedModalProperties(task,id,data)
{
    console.log('---setupAdaptedModalProperties()---\n'+task+'\nID: '+id);
    console.log(data);
    clearAdaptedComponent();
    setDefaultValues(id);
    //setDataFields(task,id);
    createModalHeader(task,data);
    // get form
   // var dataDiv=getForm();
    //document.getElementById('adaptedDynamicData').appendChild(dataDiv);
    // SET MODAL BODY CONTENT
    
    // ADD HIDDEN ID INPUT
    //dataDiv.childNodes[1].childNodes[1].appendChild(addHiddenInput('id',id));
    // SET DATA ROWS
    if(task==='sEvent')
    {
        getEventView(document.getElementById('adaptedDynamicData'),id);
        //getEventView(dataDiv.childNodes[1].childNodes[1],id);
    }
    else if(task==='sEventRecipients')
    {
        setModalBodyContent(task,id,data);
    }
    else
    {
        
    };
    document.getElementById('adaptedButtonsBottom').appendChild(createBodyButtonContent(task));
    document.getElementById('adaptedModalBodyExtra').appendChild(addLegendDiv(task));
    $('#adaptedModal').modal('show');
    //console.log($('#adaptedModal')[0]);
}
function addLegendDiv(type)
{
    console.log('===addLegendDiv()===');
    var legendDiv=document.getElementById('legendDivFrame').cloneNode(true);
    var hr='<hr class="w-100"></hr>';
    var label='<small class="modal-title text-left text-secondary pl-1 pb-2" id="fieldModalLabel">Legenda:</small>';
    var ul_s='<ul class="text-secondary font-weight-normal small" style="list-style-type:square;">';
    var ul_e='</ul>';
    var legendValue='';
    
    switch(type)
    {
        case 'sEvent':
            legendValue='<li>Zapis poprzez kliknięcie przycisku "Zapisz się";</li><li>Wypis poprzez kliknięcie przycisku "Wypisz się";</li>';
            break;
        case 'sEventRecipients':
            legendValue='<li>Lista w trybie "Tylko do odczytu".</li>';
            break;
        default :
            break;
    }
    legendDiv.innerHTML=hr+label+ul_s+legendValue+ul_e;
    legendDiv.classList.remove("modal");
    legendDiv.classList.remove("fade");
    return (legendDiv);
}
function getEventView(whereAppend,id)
{
    console.log('---getEventView---');
    var odb_all='';
    if(emailFullData[id].odbiorca_email!==null)
    {
        odb_all='<hr class="mt-1 mb-1"/>Odbiorca email: '+emailFullData[id].odbiorca_email;
    }
    whereAppend.innerHTML='<div class="card card-body">Autor: '+emailFullData[id].autor+' ('+emailFullData[id].autor_email+')<hr class="mt-1 mb-1"/>Odbiorca: '+emailFullData[id].odbiorca+odb_all+'<hr class="mt-1 mb-1"/><p class="font-weight-bold mb-1 mt-1">Temat: <span class="font-weight-normal">'+emailFullData[id].temat+'</span></p><hr class="mt-1 mb-1"/>Treść :<br/>'+emailFullData[id].tresc+'</div>';
}
function setupInputFields(task)
{
    var inpFieldsToSetup=inputFields;
    switch(task)
    {
        case 'cEmail':
            break;
        case 'caEmail':                       
            break;
        case 'pTetaM':
              
            break;
        case 'pTeta': 
                inpFieldsToSetup=inputFields2;             
            break;
        default:
                console.log('---setupInputFields() wrong task---');
            break;
    }
    return inpFieldsToSetup;
}
function createModalHeader(task,data)
{
    console.log('===createModalHeader()===\nTASK: '+task+'\nDATA: '+data);
    $("#adaptedModalBgTitle").addClass("modal-header");
    switch(task)
    {
        case 'sEvent':
                $("#adaptedModalBgTitle").addClass("bg-info");
                $("#adaptedModalTitle").html("SZCZEGÓŁY");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Event ID: "+currentIdEmail+"</small>"); 
            break;
        case 'sEventRecipients':
                $("#adaptedModalBgTitle").addClass("bg-warning");
                $("#adaptedModalTitle").html("LISTA");
                $("#adaptedModalInfo").html("<small class=\"text-secondary\">Event ID: "+currentIdEmail+"</small>"); 
            break;
        default:
                console.log('===createModalHeader() wrong task===');
            break;
    }
}
function setTaskData(task,data)
{
    switch(task)
    {
        case 'cEmail':
               
            break;
        case 'caEmail':
                                    
            break;
        case 'sEmail':
               
            break;
        case 'pTeta':
                tetaprac=data.PRAC;
                tetarej=data.REJE;   
        case 'pTetaM':   
                
            break;    
        default:
                console.log('---setTaskData() wrong task---');
            break;
    }
}
function setDataFields(task,id)
{
    console.log('===setDataFields()===\nTASK: '+task+'\nID: '+id);
    console.log(emailFullData[id]);
    inputFields[0][0]='ta';
    inputFields[0][1]='Do: ';
    inputFields[0][2]='s-address';
    inputFields[1][0]='t';
    inputFields[1][1]='Temat: ';
    inputFields[1][1]='temat';
    inputFields[2][0]='tx';
    inputFields[2][1]='';
    inputFields[2][2]='wiadomosc';
    
    switch(task)
    {
        case 'cEmail':
                inputFields[0][3]='';
                inputFields[1][3]='';
                inputFields[2][3]='';
                //inputFields[3][3]='';
                //inputFields[3][2]='s-address_id-';
                //setEmailBodyContent(task,1);
            break;
        case 'caEmail':                       
                //inputFields[0][3]=id;
                inputFields[0][3]=emailFullData[id].nadawca;
                inputFields[1][3]="Re: "+emailFullData[id].temat;
                inputFields[2][3]=emailFullData[id].tresc;
                //inputFields[3][3]='null';
            break;
        case 'pTeta': 
                //inputFields[0][3]=id;
                inputFields[0][0]='s-pracownik';
                inputFields[0][1]='Wskaż pracownika: ';
                inputFields[0][2]='pracownik';
                inputFields[0][3]='';
                inputFields[1][0]='s-rejestr';
                inputFields[1][1]='Wskaż rejestr: ';
                inputFields[1][2]='rejestr';
                inputFields[1][3]='';
                inputFields[2][0]='t';
                inputFields[2][1]='Symbol Dokumentu: ';
                inputFields[2][2]='symbol-dokumentu-';
                inputFields[2][3]='';
                //inputFields[3][2]='s-pracownik_id-';
            break;
        case 'sEmail':
                // NOTHING TO SETUP
            break;
        default:
                console.log('---setDataFields() wrong task---');
            break;
    }
    console.log('INPUT FIELDS ATR:');
    console.log(inputFields);
}
function setModalBodyContent(task,id,json)
{
    console.log('===setModalBodyContent()===\n'+task);   
    //var inpFieldsToSetup=inputFields;
    document.getElementById("adaptedModalBodyTitle").innerText='';
    //document.getElementById('adaptedDynamicData').appendChild(dataDiv);
    switch(task)
    {
        case 'sEventRecipients': 
                var template=document.getElementById('dynamicDataTableDiv').cloneNode(true);
                //console.log(template.childNodes[1]);       
                setDynamicTable(template.childNodes[1],json.data,setDynamicColumns(json.data)); 
                document.getElementById('adaptedDynamicData').appendChild(template);
                measureDataTable();
                console.log(document.getElementById('adaptedDynamicData'));
            break;
        default:
                console.log('---setModalBodyContent() wrong task---');
            break;
    }     
}
function setDynamicColumns(json)
{
    console.log('===setDynamicColumns()===');
    var columns = [];
    $.each( json[0], function( key ) {
            var item = {};
            item.data = key;
            item.title = key;
            columns.push(item);
    });
    return columns;
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
                Array('class','btn btn-dark pull-right mt-1')
                );
    var cancelButton=createHtmlElement('button',cancelButtonAtr,null);
    cancelButton.innerText = "Anuluj";
    cancelButton.onclick = function() { closeModal('adaptedModal'); reloadData(); };
    // ADD BUTTON
    var confirmButtonAtr = new Array(
            Array('class','btn btn-success btn-add mt-1'),
            Array('id','confirmData'),
            Array('no-disabled',''),
            );
    var confirmButton='';
    
    switch(task)
    {
        case 'sEvent':
            console.log('button - sEvent');
            console.log(emailFullData[currentIdEmail].status);
            // 
            if(emailFullData[currentIdEmail].status==='y')
            {
                confirmButtonAtr[0][1]='btn btn-danger mt-1';
                confirmButton=createHtmlElement('button',confirmButtonAtr,null);
                confirmButton.innerText = "Wypisz się";
            }
            else
            {
                confirmButtonAtr[0][1]='btn btn-primary mt-1';
                confirmButton=createHtmlElement('button',confirmButtonAtr,null);
                confirmButton.innerText = "Zapisz się";
            };
            confirmButton.onclick = function() {
                sendDataDirect('saveUserToEvent','id='+currentIdEmail,true);
                closeModal('adaptedModal'); 
                //reloadData();
            };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break;   
        case 'eEmlCat':
            confirmButtonAtr[0][1]='btn btn-info mt-1';
            confirmButton=createHtmlElement('button',confirmButtonAtr,null);
            confirmButton.innerText = "Zatwierdź";
            confirmButton.onclick = function(){postDataToUrl('eEmlCat'); };
            divButtonElement.appendChild(cancelButton);
            divButtonElement.appendChild(confirmButton);
            break; 
        default:
            divButtonElement.appendChild(cancelButton);
            console.log('createBodyButtonContent() - wrong task');
            break;
    };
    
    return(divButtonElement);
}
function createModalRowContent(whereAppend,task,inpFields)
{
    // rebuild row to col-sm 12 and next row
    console.log('===createModalRowContent()===\n'+task);
    console.log(whereAppend);
    console.log(inputStyle);
    // set row width
    setModalRowContentAtr(task);
    var divCol12Atr=new Array(
            Array('class','col-12 ml-0 mr-0 pl-0 pr-0')
            );
    var divCol12='';
    var divRowAtr=new Array(
            Array('class','row ml-0 mr-0 pl-0 pr-0'),
            Array('id','divRow')
            );
    var divRow='';
    var divRow2='';
    //var tmpName='';
    setInputMode(1);
    
    for(var i=0;i<inpFields.length;i++)
    {
        
        divRowAtr[1][1]='divRow'+i;
        //divCol12Atr[1][1]='divRow'+i;
        divCol12=createHtmlElement('div',divCol12Atr,null);
        divRow=createHtmlElement('div',divRowAtr,null);
        //
        console.log(inpFields[i][0]+' - '+inpFields[i][2]);
        setInputMode(1);
        inputAttribute[0][1]='text';
        inputAttribute[2][1]=inpFields[i][2]+inpNumber;
        inputAttribute[3][1]=inpFields[i][2]+inpNumber;
        inputAttribute[4][1]=inpFields[i][3];
        inputAttribute[8][0]='maxlength';
        modalRowlabelAtr[0][1]='inputProject'+i;
        modalRowFieldAtr[1][1]='divRow'+i;
        
        // ASSIGN PROPER LABEL
        modalRowlabelAtr[1][1]='col-sm-2 pl-0 pr-0';
        modalRowFieldAtr[0][1]='col-sm-10 pl-0';
        //if(task==='cEmail')
        if(inpFields[i][2].match(/s-address/g) && (task==='cEmail' || task==='caEmail'))
        {
            labelElement=createHtmlElement('div',modalRowlabelAtr,null);
            labelElement.appendChild(createSelect(emailType,'email_type-'+inpAddrNumber,0,1,null));
            //labelElement.appendChild(createSelect(emailType,'email_type-',0,1,0));
        }
        //else if(task==='pTeta')
        else if(inpFields[i][2]==='fields-count' && task==='pTeta')
        {
            // DEFAULT
            modalRowlabelAtr[1][1]='col-sm-2 control-label text-right font-weight-bold';
            labelElement=createHtmlElement('label',modalRowlabelAtr,null);
            labelElement.innerText=inpFields[i][1];
        }
        else if(task==='pTetaM')
        {
            // DEFAULT
            modalRowlabelAtr[1][1]='col-sm-3 control-label text-right font-weight-bold';
            modalRowFieldAtr[0][1]='col-sm-9';
            labelElement=createHtmlElement('label',modalRowlabelAtr,null);
            labelElement.innerText=inpFields[i][1];
        }
        else
        {
            modalRowlabelAtr[1][1]='col-sm-1 control-label text-right font-weight-bold';
            modalRowFieldAtr[0][1]='col-sm-11';
            labelElement=createHtmlElement('label',modalRowlabelAtr,null);
            labelElement.innerText=inpFields[i][1];
        }
        div1Element=createHtmlElement('div',modalRowFieldAtr,null);//modalRowFieldAtr
        //
        switch(inpFields[i][0])
        {
            case 'hidden':
                console.log('HIDDEN');
                inputAttribute[0][1]='hidden'; 
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                div1Element.appendChild(inputElement);
                break;
            case 'n':
                inputAttribute[0][1]='number';
                inputAttribute[8][0]='min';
                inputAttribute[8][1]='1';
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+inpFields[i][2]+inpNumber;
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $(inputElement).on('keyup mouseup' , function()
                {
                    //extra="onmouseup=\"parseUnsInt2('"+data.ID+"')\" onkeyup=\"parseUnsInt2('"+data.ID+"')\"";
                    parseUnsInt(this);
                    parseFieldValue(this.value,'unsignedinteger',divErrAtr[1][1]);
                    setConfirmButton(checkIsErr(),'confirmData');
                    fieldsCount=this.value;
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 't':
                inputAttribute[8][1]='30';
                inputElement=createHtmlElement('input',inputAttribute,inputStyle);
                divErrAtr[1][1]='errDiv-'+inpFields[i][2]+inpNumber;
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                //tmpName=inpFields[i][2]+inpNumber;
                $(inputElement).on('keyup blur', function()
                //$(inputElement).keyup(function()
                {
                    console.log(divErrAtr[1][1]);
                    parseFieldValue(this.value,this.id,'errDiv-'+this.id);
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;
            case 'tx':
                inputAttribute[8][1]='1024';
                inputAttribute.push(Array('rows',15));
                inputElement=createHtmlElement('textarea',inputAttribute,inputStyle);
                inputAttribute.pop();
                divErrAtr[1][1]='errDiv-'+inpFields[i][2]+inpNumber;
                divErr=createHtmlElement('div',divErrAtr,divErrStyle);
                $(inputElement).on('keyup blur', function()
                {
                    parseFieldValue(this.value,this.id,'errDiv-'+this.id);
                    setConfirmButton(checkIsErr(),'confirmData');
                });
                div1Element.appendChild(inputElement);
                div1Element.appendChild(divErr);
                break;


            default:
                break;
        };
        divRow.appendChild(labelElement);
        divRow.appendChild(div1Element);
        divCol12.appendChild(divRow);
        whereAppend.appendChild(divCol12);
    };
}
function rmAdrRow(el)
{
    console.log('===rmAdrRow()===');
    console.log(el.parentNode.parentNode);
    console.log(el.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].name);
    // remove from err tab
    removeErrFromTab(el.parentNode.parentNode.childNodes[1].childNodes[0].childNodes[0].name);
    // remove html element
    removeHtmlChildsDirect(el.parentNode.parentNode);
    setConfirmButton(checkIsErr(),'confirmData');
}
function setModalRowContentAtr(task)
{
    console.log('===setModalRowContentAtr()===');
    switch(task)
    {
        default:
        case 'cEmail':
        case 'caEmail':
        case 'sEmail':
            modalRowlabelAtr=new Array(
            Array('for','inputEmployee'),
            Array('class','col-sm-1 control-label text-right font-weight-bold')
            );
            modalRowFieldAtr=new Array(
            Array('class','col-sm-10 pl-0'),
            Array('id','divRow-0')
            );
            break;
        case 'pTeta':
        case 'pTetaM':
            modalRowlabelAtr=new Array(
            Array('for','inputEmployee'),
            Array('class','col-sm-3 control-label text-right font-weight-bold')
            );
            modalRowFieldAtr=new Array(
            Array('class','col-sm-9'),
            Array('id','divRow-0')
            );
            break;
    };
}
function getIdField(elId)
{
    console.log('===getIdField()===\n EL ID = '+elId);
    var res = elId.split("-");
    console.log(res);
    return (res[0]+'-'+res[1]+'_id-'+res[2]);
}
function setIdField(id,value)
{
    console.log('===setIdField()===\nID = '+id+' VALUE = '+value);
    document.getElementsByName(id)[0].value=value;
}
window.onclick = function(event)
{
    // INCREASE PLUS ONE
    var inpNumberOne=inpNumber+1;
    // HIDE DROPDOWN IF NOTHING SELECTED
    //console.log('window onclick');
    if (!event.target.matches('.dropdown'))
    {
        for(var i=0;i<inpNumberOne;i++)
        {
            //console.log(i);
            $('#dropdown-'+i).hide();
        }
        //console.log('out');
    }
    else
    {
        //console.log('in');
    }
};
function setInputStructValue(task,value,fields)
{
    var inpValue='';
    switch(task)
    {
        case 'getRecipients':
            inpValue = value[fields[0]] +' <'+value[fields[1]]+'>';
            break;
        case 'ddiWrdImpPrac':
            //inpValue = "["+value[fields[0]]+"] "+value[fields[1]];
            inpValue = value[fields[1]];
            break;
        case 'ddiWrdImpReje':
            inpValue = "["+value[fields[0]]+"] "+value[fields[1]];
            break;
        default:
            break;
    };
    return (inpValue);
}
function getEmailFooter()
{
    console.log('---getEmailFooter()---');
    var template=document.getElementById('emailFooter').cloneNode(true);
    template.classList.remove("modal");
    template.classList.remove("fade");
    return(template);
}
function setEmailAnswer(id)
{
    console.log('---setEmailAnswer()---\nID: '+id);
    if(emailFullData[id].tresc.trim()!=='')
    {
        var divAtr=new Array(
            Array('class','col-12 rounded')
            );
        var divStyle=new Array(
                Array('border','0px solid #cccccc')
                );
        var divAnswer=createHtmlElement('div',divAtr,divStyle);
        divAnswer.innerHTML='<p><button class="btn btn-outline-info" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" onclick="changeLabel(this)">Pokaż wiadomość</button></p><div class="collapse" id="collapseExample"><div class="card card-body">Adresat: '+emailFullData[id].nadawca+'<hr class="mt-1 mb-1"/>Odbiorca: '+emailFullData[id].odbiorca+'<hr class="mt-1 mb-1"/>Temat: '+emailFullData[id].temat+'<hr class="mt-1 mb-1"/>'+emailFullData[id].tresc+'</div></div>';
    }
    else
    {
        var divAnswer=createHtmlElement('div',null,null);
    };
    return(divAnswer);
}
function changeLabel(el)
{
    console.log('===changeLabel()===');
    //console.log(el);
    if(buttonShowMessage===0)
    {
        el.innerText='Ukryj wiadomość';
        buttonShowMessage=1;
    }
    else
    {
        el.innerText='Pokaż wiadomość';
        buttonShowMessage=0;
    }
}
function setEmailResponseCheck(id)
{
    console.log('===setEmailResponseCheck()===\nID: '+id);
    console.log(emailFullData[id]);
    var divOverAllAtr=new Array(
        Array('class','col-12 rounded')
        );
    var divOverAll=createHtmlElement('div',divOverAllAtr,null);
    var divAtr=new Array(
        Array('class','col-12 rounded')
        );
    var divStyle=new Array(
                Array('border','0px solid #cccccc'),
                Array('width','100%')
                );
    var checkBoxChecked='';  
    //console.log(emailMailRecv.WARTOSC);
    if(parseInt(emailMailRecv.WARTOSC)===1)
      {
          console.log('SET CHECKED');
          checkBoxChecked='checked';
      }
    
    var divResponse=createHtmlElement('div',null,divStyle);
        divResponse.innerHTML='<p class="mb-0 pb-0 mt-0 mb-0" >Wysłać powiadomienie e-mail do adresata?<input class="form-check-input ml-1" type="checkbox" onclick="checkMailRecv(this,1)" '+checkBoxChecked+' value="'+emailMailRecv.WARTOSC+'" id="MAIL_RECV" name="MAIL_RECV"><br/><input type="text" class="form-control mb-1 mt-1" name="MAIL_RECV_ADDR" id="MAIL_RECV_ADDR" max-length="40" value="'+emailFullData[id].nadawca+'" onkeyup="checkMailRecvAddr(this)" onblur="checkMailRecvAddr(this)" /></p>';
    divAtr[0][1]='rounded alert alert-danger';
    divAtr.push(Array("name","errDiv-MAIL_RECV_ADDR"));
    divAtr.push(Array("id","errDiv-MAIL_RECV_ADDR"));
    
    divStyle.push(Array('display','none'));
    divStyle.push(Array('width','100%'));
    var divErr=createHtmlElement('div',divAtr,divStyle);
    //divErr.innerHTML='asdsa';
    divOverAll.appendChild(divResponse);
    divOverAll.appendChild(divErr);
    return (divOverAll);
}
function checkMailRecv(data,action)
{
    console.log('===checkMailRecv()===');
    if(action===1)
    {
        changeCheckBoxValue(data.name);
    }
    var box=document.getElementById(data.name);
    var emailRecvAddr=document.getElementById('MAIL_RECV_ADDR');
    if(parseInt(box.value)===0)
    {
        console.log('CHBOX VALUE - 0');
        removeErrTab('email');
        hideDivErr(document.getElementById('errDiv-MAIL_RECV_ADDR'));
        setConfirmButton(checkIsErr(),'confirmData');
    }
    else
    {
        console.log('CHBOX VALUE - 1');
        if(emailRecvAddr.value.trim()==='')
        {
            setErrTab('email');
            showDivErr('errDiv-MAIL_RECV_ADDR','Błąd składni');
        }
        else
        {
            checkMailRecvAddr(emailRecvAddr);
        }
    }
}
function checkMailRecvAddr(data)
{
    console.log('===checkMailRecvAddr()===');
    console.log(data);
    parseFieldValue(data.value,'email','errDiv-'+data.name);
    setConfirmButton(checkIsErr(),'confirmData');
}
function setHr(whereAppend)
{
    var divAtr=new Array(
            Array('class','col-sm-12')
            );
    var div=createHtmlElement('div',divAtr,null);
    div.innerHTML= "<hr></hr>";
    whereAppend.appendChild(div);
}
function postDataToUrl(task)
{
    console.log('---postDataToUrl()---');
    console.log(task);
    var confirmTask=false;
    var err=false;
    var fieldToParse=new Array();
    /*
    * DEFAULT FORM NAME = postData
    */
    var inpArray=getFormInpByName('postData');
    switch(task)
    {
        case 'pTeta':
             //remove special character from opis
            checkMailRecv(document.getElementById('MAIL_RECV'),0);
            if(!checkIsErr()) { confirmTask=true; }
            break;
        case 'cEmail':
            fieldToParse=Array('s-address_id-','temat','wiadomosc');
            overAllParse(fieldToParse,inpArray);
            err=checkIsErr();
            setConfirmButton(err,'confirmData');
            if(err) {confirmTask=false;} else {confirmTask=true;};
            break;
        case 'eEmlCat':
            // parse fields
            //foreach
            
                console.log('---parseEmailCatList---');
                 var htmlForm=document.getElementsByName('postData');
                console.log(htmlForm);
                var fieldName;
                var fieldValue;
                for( var i=0; i<htmlForm[0].elements.length; i++ )
                {
                    fieldName =htmlForm[0].elements[i].name;
                    fieldValue =htmlForm[0].elements[i].value;
                    //console.log(i+'| form name: '+fieldName+" form value: "+fieldValue);
                    
                    if(fieldName!=='' && fieldName.substring(0, 9)==='emlNewCat')
                    {
                        console.log(fieldName+" - "+fieldValue);
                        parseFieldValue(fieldValue,fieldName,'errDiv-'+fieldName);
                    } 
                }   
            err=checkIsErr();
            setConfirmButton(err,'confirmData');
            if(!err)
            {
                confirmTask=true;
            }
            break;   
        default:
            break;
    }; 
    if (confirmTask)
    {
        sendData(task);
    };
}
function overAllParse(fieldArray,dataArray)
{
    console.log('===overAllParse()===');
    console.log(fieldArray);
    console.log(dataArray);
    for( var i=0; i<dataArray.length; i++ )
    {
        for( var j=0; j<fieldArray.length; j++ )
        {
            if(dataArray[i][0].match(fieldArray[j]))
            {
                console.log('FOUND INPUT - '+dataArray[i][0]);
                parseFieldValue(dataArray[i][1],dataArray[i][0],'errDiv-'+dataArray[i][0]);
            }
        }       
    }
}
function setEmailActiveCategory(ele)
{
    console.log('---setEmailActiveCategory()---');
    
    
    //console.log(ele);
    //console.log($(ele).attr('id'));
    var email_cat=$("#EMAIL_CATEGORY");
    //console.log(email_cat[0].childNodes);
    $( email_cat[0].childNodes ).each(function(e,h)
    {
        //console.log('child'+e);
        //console.log(h);
        $(h).removeClass("active");
    });
    $(ele).addClass("active");
    //downloadEmails();
    var emailIdCat=$(ele).attr('id');
    console.log('EMAIL CETOGORY - '+emailIdCat);
    // change active and visible col to open email 
    setVisibleCol(emailIdCat);
    window.tableHandle.ajax.url(  '/getEmails/'+emailIdCat).load();
    reloadData();
}
function setVisibleCol(emlCat)
{
    console.log('===setVisibleCol()===\nCATEGORY : '+emlCat);
    // GET EMl SHORTCUT
    var shortcut=getEmailCatShortcut(emlCat);
    console.log(shortcut);
    // DEFAULT
    offDataTableCol=[5];
    // STATUS
    window.tableHandle.column( 5 ).visible( true );
    // NADAWCA
    window.tableHandle.column( 3 ).visible( true );
    // ODBIORCA
    window.tableHandle.column( 2 ).visible( true );
}
function changeEmailCat(id,idcat)
{
    console.log('---changeEmailCat()---\nID EMAIL: '+id+'\nID CATALOG: '+idcat);
    //console.log(id);
    //sendDataDirect
    //sendData('mEmailCat','idcat='+idcat+'&id='+id,true);
    sendDataDirect('mEmailCat','idcat='+idcat+'&id='+id,true);
}
function getEmailCatId(shortcut)
{
    console.log('---getEmailCatId()---\nTo find - '+shortcut);
    var id=1;
    //console.log(emlCat);
    $.each(emlCat, function (index, value)
    {
        //console.log(value.SHORTCUT);
        if(shortcut.includes(value.SHORTCUT))
        //if(value.SHORTCUT===shortcut)
        {
            //console.log('FOUND MATCH');
            id=value.ID;
            return false;
        }
    });
    console.log('ID: '+id);
    return id; 
}
function getEmailCatShortcut(idCat)
{
    console.log('---getEmailCatShortcut()---\nTo find - '+idCat);
    var shortcut='EML_ANSWER';
    $.each(emlCat, function (index, value)
    {
        //console.log(value.ID);
        if(value.ID===idCat)
        {
            console.log('FOUND SHORTCUT - '+value.SHORTCUT);
            shortcut=value.SHORTCUT;
            return shortcut;
        }
    });
    return shortcut; 
}
function createSelect(dataArray,fieldIdName,valueCol,nameCol1,nameCol2)
{
    console.log('---createSelect---\n'+fieldIdName);
    console.log(dataArray);
    // PARSE fieldIdName
    if(fieldIdName.substring(0,10)==='emlCatList')
    {
        selectStyle.push(Array('borderTopRightRadius','0px'));
        selectStyle.push(Array('borderBottomRightRadius','0px'));
    }
    selectAttribute[1][1]=fieldIdName; // id 
    selectAttribute[2][1]=fieldIdName; // name
    //var option=document.createElement("OPTION");
    var optionAtr=new Array(
            Array('class','pl-0 pr-0')
            );
        
    var optionText = document.createTextNode("");
    var select=createHtmlElement('select',selectAttribute,selectStyle);    
    for(var i=0;i<dataArray.length;i++)
    {
        //option=document.createElement("OPTION");
        var option=createHtmlElement('option',optionAtr,null);
        option.setAttribute("value",dataArray[i][valueCol]);
        if(nameCol2==null)
        {
            optionText = document.createTextNode(dataArray[i][nameCol1]);
        }
        else
        {
            optionText = document.createTextNode("["+dataArray[i][nameCol2]+"] "+dataArray[i][nameCol1]);
        }
        option.appendChild(optionText);
        select.appendChild(option);
    };
    if(fieldIdName==='emlCat')
    {
        selectStyle.pop();
        selectStyle.pop();
    }
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
function parseUnsInt(ele)
{
    console.log('---parseUnsInt()---');
    if(ele.value<1)
    {
        ele.value='';
    }
}
function changeCheckBoxValue(id)
{
    console.log('---changeCheckBoxValue---');
    console.log(id);
    var box=document.getElementById(id);
    console.log(box);
    console.log('ACT VALUE - '+box.value);
    if(parseInt(box.value)<1) {box.value=1;} else {box.value=0;};
    console.log('NEW VALUE - '+box.value);
}
function setHiddenInp(inpId,valueToSetup)
{
    console.log('---setHiddenInp()---');
    console.log(inpId);
    console.log(valueToSetup);
    document.getElementById(inpId).value=valueToSetup;
}
function downloadDataIntVal()
{
    console.log('---downloadDataIntVal()---');
    //console.log('ACL download emails : '+perm['DOW_EMAIL']);
    //console.log(emailTimeInt);
    //console.log(timeIntVal);
    reloadData();
    // sleep
    // 1 s = 1000 ms
    // check user login
    // check perm
    // check stop
    sleep(timeIntVal).then(() => {
    downloadDataIntVal();
    });  
}

function setupEmailCategory()
{
   console.log('---setupEmailCategory()---'); 
}
function createDivErr()
{
    var divErrAtr=new Array(
            Array('class','row mt-1 mb-1 alert alert-danger'),
            Array('id',''),
            Array('style','display:none;')
            );
    divErrAtr[1][1]='errDiv-emlNewCat-'+inpNewCatCounter; //+projectFileds[i][2];
    var divErr=createHtmlElement('div',divErrAtr,null);
    return (divErr);
}
function createDynamicCatRow()
{
    var inp='';
    var rmBtn='';
    var divDynamicInsideAttrSel=new Array(
            Array('class','col-6 mt-0 mb-0 ml-0 mr-0 pr-0 pl-0 pb-0'),
            Array('style','border-bottom: 0px solid orange')
            ); 
    var divDynamicInsideAttrInp=new Array(
            Array('class','col-5 mt-0 mb-0 ml-0 mr-0 pl-0 pr-0'),
            Array('style','border-bottom: 0px solid green')
            ); 
    var divDynamicInsideAttrBtn=new Array(
            Array('class','col-auto mt-0 mb-0 ml-0 mr-0 pl-0'),
            Array('style','border-bottom: 0px solid red')
            );  
    var divDynamicDataRowAtr=new Array(
            Array('class','row ml-0 mb-0'), // ml-0 mt-0 mb-0 pl-0 pb-0
            Array('style','border-bottom: 0px solid black')
            ); 
    var divDynamicBtnSel=createHtmlElement('div',divDynamicInsideAttrSel,null);
    var divDynamicBtnInp=createHtmlElement('div',divDynamicInsideAttrInp,null);
    var divDynamicBtnRmv=createHtmlElement('div',divDynamicInsideAttrBtn,null);
    
    var divDynamicDataRow=createHtmlElement('div',divDynamicDataRowAtr,null);
    inputStyle.push(Array('borderTopRightRadius','0px'));
    inputStyle.push(Array('borderBottomRightRadius','0px'));
    inputStyle.push(Array('borderTopLeftRadius','0px'));
    inputStyle.push(Array('borderBottomLeftRadius','0px'));
    inputAttribute[4][1]='';
    inputAttribute[6][0]='no-readOnly';
    inputAttribute[7][0]='no-disabled';
    inputAttribute[7][0]='no-disabled';
    inputAttribute[2][1]='emlNewCat-'+inpNewCatCounter;
    inputAttribute[1][1]='form-control mb-0';
    divDynamicBtnSel.appendChild(createSelect(mainDocArray,'emlCatList-'+inpNewCatCounter,0,1,2));
    inp=createHtmlElement('input',inputAttribute,inputStyle);
    $(inp).on('keyup blur', function()
    {
        parseFieldValue(this.value,this.name,'errDiv-'+this.name);
        setConfirmButton(checkIsErr(),'confirmData');
    });
    divDynamicBtnInp.appendChild(inp);
    rmBtn=createRemoveButton('no-disabled','emlCat');
    rmBtn.onclick=function(){removeRow(this.parentNode.parentNode,null,null);}; 
    divDynamicBtnRmv.appendChild(rmBtn);
    divDynamicDataRow.appendChild(divDynamicBtnSel);
    divDynamicDataRow.appendChild(divDynamicBtnInp);
    divDynamicDataRow.appendChild(divDynamicBtnRmv);
    inputStyle.pop();
    inputStyle.pop();
    inputStyle.pop();
    inputStyle.pop();
    inputAttribute[1][1]='form-control mb-1';
    return(divDynamicDataRow);
}
function createDocListRow(elementWhereAppend,inputElement,taskToRun,rmvBtnStatus,dataId)
{
    console.log('---createDocListRow()---');
    //console.log(inputElement);
    //console.log(inputElement.name);
    
    var divColButtonAttribute=new Array(
	Array('class','col-sm-auto mr-0 ml-0 pl-0 pr-0')
	);
    divColButtonElement=createHtmlElement('div',divColButtonAttribute,null);
    var divColInputAttribute= new Array(
               Array('class','col-11 mr-0 pr-0 ml-0 pl-0')
        );
    divColInputElement=createHtmlElement('div',divColInputAttribute,null);
    var divOverAllAttributeCol=new Array(
            Array('class','col-12 ml-0 pl-0 mt-0 mb-0 pr-0'),
            Array('id','divOverAllCol-'+dataId)
            );

    var divOverAllAttribute=new Array(
            Array('class','row ml-0 pl-0 mt-0 mb-0'),
            Array('id','divOverAllRow')
            );
    var divErrAtr=new Array(
            Array('class','row mt-1 mb-1 alert alert-danger'),
            Array('id','')
            );
    var divErrStyle=new Array(
            Array('display','none')
            );
    divErrAtr[1][1]='errDiv-'+inputElement.name; //+projectFileds[i][2];
    var divErr=createHtmlElement('div',divErrAtr,divErrStyle);
    divOverAllCol=createHtmlElement('div',divOverAllAttributeCol,null);
    divOverAll=createHtmlElement('div',divOverAllAttribute,null);
    var removeButtonElement=createRemoveButton(rmvBtnStatus);
    //console.log(taskToRun);
    
    if(rmvBtnStatus!=='disabled')
    {
       removeButtonElement.onclick=function(){removeRowWithData(this.parentNode.parentNode.parentNode,divErr,this.parentNode.parentNode.firstChild.firstChild.value);}; 
    };
    divColInputElement.appendChild(addHiddenInput(dataId,dataId));
    divColInputElement.appendChild(inputElement);
    divColButtonElement.appendChild(removeButtonElement);
    divOverAll.appendChild(divColInputElement);
    divOverAll.appendChild(divColButtonElement);
    divOverAllCol.appendChild(divOverAll);
    divOverAllCol.appendChild(divErr);
    elementWhereAppend.appendChild(divOverAllCol);
    //elementWhereAppend.appendChild(divErr);
    dokCount++;
    //console.log(elementWhereAppend);
}
function removeRow(ele,divErr,inpName)
{
    console.log('---removeRow()---');
    console.log(ele);
    console.log(ele.parentNode);
    console.log(divErr);
    console.log(inpName);
    // check how many messages are in this category
    //removeHtmlChildsDirect(ele);
    removeHtmlElement(ele);
}
function removeRowWithData(ele,divErr,value)
{
    console.log('---removeRowWithData()---');
    console.log(ele);
    console.log(divErr.id);
    console.log(value);
    sendDataDirect('rmEmlCat','id='+value+'&drr='+divErr.id,false);
}
function createDynamicTable(data)
{
    // aHeader - array of column name
    // aData - array od data rows
    console.log('---createDynamicTable()---');
    console.log('DATA:');
    console.log(data)
    var dataL=data.length;
    
    console.log('DATA LENGTH: '+dataL);  
    var tableAtr=new Array(
            Array('class','table table-striped table-condensed')
            );
    var table=createHtmlElement('table',tableAtr,null);
    var tr=createHtmlElement('tr',null,null);
    var td='';
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
    console.log(table);
    return table;
}
downloadDataIntVal();

$(document).ready(function() {
 });

function setDynamicTable(html,dataSet,columns)
{
    //console.log(dataSet);
    //console.log(columns);
    dynamic_table = $(html).DataTable({
    data: dataSet
    ,dom: '<"fixedcontrols"Bfr><"row row-overflow"<"col"tip>>',
        "paging": true,
        "pageLength": 100
        ,scroller:true
        
        
    ,"columns": columns
    ,buttons: [
            { extend: 'csv', text: '<i class="fa fa-file-text"></i> CSV' }, 
            { extend: 'excel', text: '<i class="fa fa-file-excel-o"></i> EXCEL' }, 
            {
            extend: 'print',
            collectionLayout: 'fixed two-column',
            text: '<i class="fa fa-print"></i> <em>D</em>rukuj',
            className: 'btn btn-primary',
            key: {
                key: 'p',
                altkey: true
            }
            }
        ]
    ,language: {
            search : "Szukaj",
            processing: "Trwa przetwarzanie...",
            lengthMenu: "Pokaż _MENU_ wpisów",
            info: "Wyświetlono wyniki od _START_ do _END_ z _TOTAL_",
            infoEmpty: "Brak wpisów spełniających kryteria",
            infoFiltered: "(przefiltrowane z _MAX_)",
            loadingRecords: "Trwa wczytywanie...",
            zeroRecords: "Brak wpisów spełniających kryteria",
            emptyTable: "Brak wiadomości",
        paginate: {
            previous: "Poprzednia <i class=\"fa fa-chevron-left\"></i> ",
            next: "<i class=\"fa fa-chevron-right\"></i> Następna"
        }
        }
  });
  
   
   

}
function measureDataTable()
{
    console.log('===measureDataTable()===');
    console.log(dynamic_table);
    //console.log($.fn.dataTable);
    //$($.fn.dataTable.tables(true)).DataTable().scroller.measure();
    dynamic_table.scroller.measure();
    
}
console.log(document.getElementById('dynamicDataTableDiv'));