var activeModal;
var activeModalFields={};
/*
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
setPermission();
var scrollY = $(window).innerHeight() - 540;
window.tableHandle = $('#dataTable').DataTable(
{		
    ajax: {
        url: 'Event/getEvents',
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
        text: '<i class="fa fa-pencil"></i> Dodaj wydarzenia',
        className: 'btn btn-success '+perm['SEND_EMAIL'],
        action: function (e, dt, node, config){}
    }, 
    {
        collectionLayout: 'fixed two-column',
        text: '<i class="fa fa-download"></i> Odśwież wydarzenia',
        className: 'btn btn-info',
        action: function (e, dt, node, config){
            reloadMainTable();
        }
    },
    {
        text: '<i class="fa fa-remove"></i> Usuń filtry',
        className: 'btn btn-secondary ml-0',
        action: function (e, dt, node, config){
            dt.search('').draw();
            dt.columns().every(function (id,value){
                $('input', this.footer()).each(function (){
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
        if(data.wsk_r==='n'){
            $(nRow).addClass("font-weight-bold");
        }
        else{
            $(nRow).addClass("font-weight-normal");
        }
        $(nRow).css( 'cursor', 'pointer' );
        $(nRow).on('click', 'td', function (){});
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
    emptyTable: "Brak danych",
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

function createButton(type, row)
{
    if (type === 'display'){
        var event_user_list='';
        if(perm['SHOW_EVENT_USERS']!=='disabled'){
            event_user_list='<button onclick="ajax(\'main/getEventRecipient/'+row.id+'\',\'openEventRecipient\',\'GET\',\'\')" class="btn btn-warning">Lista</button>';
        }
        return "<div class=\"btn-group pr-0 mr-0\"><button onclick=\"ajax('main/getEvent/"+row.id+"','openEvent','GET','')\" class=\"btn btn-info\" >Szczegóły</button>"+event_user_list+"</div>";
    }
    else{
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
function openEvent(data)
{
    //console.log('---openEvent()---');
    //console.log(data);
    activeModal=document.getElementById('adaptedModal').cloneNode(true);
    console.log(activeModal);
    activeModalFields.idEvent=data.event.id;
    /* SETUP HEADER */
    activeModal.childNodes[0].childNodes[0].childNodes[0].classList.add('bg-info');
    activeModal.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText='Szczegóły wydarzenia';
    /* SETUP HEADER CLOSE BUTTON */
    //console.log(activeModal.childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0]);
    activeModal.childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[0].onclick = function() {reloadMainTable();};
    if(!checkEventStatus(activeModal,data)){ return false; }
    /* SETUP BODY TITLE */
    activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML="<p class=\"text-center h3\">"+data.event.temat+"</p>";
    /* SETUP BODY DATA */
    activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].innerHTML=data.event.tresc;
    /* SETUP BODY BUTTON */
    //console.log(activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[2].childNodes[0]);
    /* SETUP INPUT - BUTTON */
    activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[2].childNodes[0].innerHTML='<div class="btn-group float-right mb-1 mt-3 " role="group" aria-label="BasicGroup"><button class="btn btn-dark" data-dismiss="modal" aria-label="Close" onClick="reloadMainTable()">Anuluj</button>'+checkEventRecord(data)+'</div>';
    /* SETUP BODY LEGEND */
    activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[5].innerHTML='<div class="border-top col-12 mt-2 mb-2"><div>Dobrowolne Oświadczenie</div>'+eventInput(data.event_fields)+'</div>';
    //<ul class="border-top w-100 pt-3" style="list-style-type: square"><li>Pola napisane <span class="text-danger">czerwoną</span> czcionką - wymagane.</li><li>Pola napisane czarną czcionką - niewymagane.</li></ul>';
    /* SETUP FOOTER INFO */
    activeModal.childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].innerHTML="<small class=\"text-secondary\">Autor: "+data.event.autor+" ("+data.event.autor_email+")</small>";    
    $(activeModal).modal('show');
    //console.log(activeModalFields);
}
function eventInput(data){
    var input='';
    //console.log(data);
    for(const prop in data){
        
        switch(data[prop].type) {
            case 'checkbox':
                input+=eventInputCheckbox(data[prop]);
                break;
            case 'select':
                // code block
                break;
            case 'input':
                break
            default:
          // code block
      }
  }
  //console.log(input);
  return input;
}
function eventInputCheckbox(data){
    //console.log(data);
    var color='';
    var checked='';
    //var field=data.name;
    
    if(data.req==='y'){
        color='font-weight-bold text-danger';
    }
    if(data.value==='y'){
        checked='checked';
        activeModalFields[data.name]=data.value;
    }
    else{
        /* FOR NULL AND n */
        activeModalFields[data.name]='n';
    }
    /* ADD ACTION ONCLICK*/
    return '<div class="form-check w-100 mt-1"><input type="checkbox" '+checked+' class="form-check-input" value="n" name="'+data.name+'" onClick="changeCheckboxValue(this)"><label class="form-check-label '+color+'" for="transport">['+data.name+'] '+data.title+'</label></div>';
}
function changeCheckboxValue(ele){
    //console.log('---changeCheckboxValue()---');
    /*
    console.log(ele);
    console.log(ele.name);
    console.log(ele.value);
    console.log(activeModalFields);
     */
    if(ele.value==='y'){
        activeModalFields[ele.name]='n';
        ele.value='n';
    }
    else{
        activeModalFields[ele.name]='y';
        ele.value='y';
    }
}
function checkEventStatus(modal,data){
    if(data.status!==''){
        /* SETUP DIV ERROR AND EXIT */
        modal.childNodes[0].childNodes[0].childNodes[1].childNodes[3].childNodes[0].classList.remove('d-none');
        modal.childNodes[0].childNodes[0].childNodes[1].childNodes[3].childNodes[0].innerHTML=data.status;
        $(modal).modal('show');
        return false;
    }
    return true;
}
function checkEventRecord(data){
    var yes='<button class="btn btn-primary" onClick="sign('+data.event.id+')">Zapisz mnie</button>';
    var no='<button class="btn btn-danger" onClick="sign('+data.event.id+')">Wypisz mnie</button>';
    if(data.event.recipient_id===null || (data.event.recipient_id!==null && data.event.recipient_status!=='y')){
        return yes; 
    }
    return no;
}
function setDynamicTable(html,dataSet,columns)
{
    $(html).DataTable({
    data: dataSet,
    dom: '<"fixedcontrols"Bfr><"row row-overflow"<"col"tip>>',
    paging: true,
    pageLength:100,
    scroller:true,
    columns:columns,
    buttons: [
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
        ],
    language: {
            search : "Szukaj",
            processing: "Trwa przetwarzanie...",
            lengthMenu: "Pokaż _MENU_ wpisów",
            info: "Wyświetlono wyniki od _START_ do _END_ z _TOTAL_",
            infoEmpty: "Brak wpisów spełniających kryteria",
            infoFiltered: "(przefiltrowane z _MAX_)",
            loadingRecords: "Trwa wczytywanie...",
            zeroRecords: "Brak wpisów spełniających kryteria",
            emptyTable: "Brak danych",
        paginate: {
            previous: "Poprzednia <i class=\"fa fa-chevron-left\"></i> ",
            next: "<i class=\"fa fa-chevron-right\"></i> Następna"
        }
        }
  });
}
function ajax(url,task,method,data){
    //console.log('---getEventRecipient()---\nURL: '+url+'\nTASK: '+task);
    /* DATA IS OBJECT */
    $.ajax(
    {
	url: url,
	async: true,
	beforeSend: function()
	{
           	
	},
	complete: function()
	{
           
	},
        data,
        method: method,
        success: function (answer){
           // console.log('---AJAX SUCCESS---');
           // console.log(answer);
            //(new Function(`${task}('${answer}')`))();
            window[task](answer);
        },
        error: function (request, status, error)
        {
            //console.log('---AJAX ERROR---');
            //console.log(request);
            //console.log(error+' '+status);
            alert('Error occured!');
        }
    });  
}
function openEventRecipient(data)
{
    //console.log('---openEventRecipient()---\nData:');
    try {
        //console.log(data);
        var modal=document.getElementById('adaptedModal').cloneNode(true);
        //console.log(modal);
        //console.log(modal.childNodes[0].childNodes[0].childNodes[0]);
        /* SETUP HEADER */
        modal.childNodes[0].childNodes[0].childNodes[0].classList.add('bg-warning');
        modal.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText='Lista zapisanych';
        //console.log(modal.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]);
        /* SETUP BODY TITLE */
        //console.log(modal.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0]);
        modal.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML="<p class=\"text-center h3\">"+data.event.temat+"</p>";
        /* SETUP BODY DATA */
        var table=document.getElementById('dynamicDataTableDiv').cloneNode(true); 
            setDynamicTable(table.childNodes[0],data.recipient,data.event.fields); 
            //console.log(modal.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0]);
            modal.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].appendChild(table);
            
        /* SETUP FOOTER INFO */
        //console.log(modal.childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0]);
        modal.childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].innerHTML="<small class=\"text-secondary\">Autor: "+data.event.autor+" ("+data.event.autor_email+")</small>";
        /* SHOW */
        $(modal).modal('show');
    }
    catch (error) {
        console.error(error);   
    }
}
function checkSignAnswear(data){
    /*
    console.log('---checkSignAnswear()---');
    console.log(data);
    console.log(activeModal);
    console.log(activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[3].childNodes[0]);
    */
    /*
     * SETUP DIV ERROR
     * 
     * NO ERROR => HIDE DIV 
     */
    if(data.status===''){
        $(activeModal).modal('hide');
        activeModal='';
        activeModalFields={
            
        };
        reloadMainTable();
        return true;
    }
    activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[3].childNodes[0].classList.remove('d-none');
    activeModal.childNodes[0].childNodes[0].childNodes[1].childNodes[3].childNodes[0].innerHTML=data.status;
}
function sign(eventId){
    console.log('---signUp()---');
    ajax('main/eventSign','checkSignAnswear','POST',activeModalFields);
}
function reloadMainTable()
{
    //console.log('---reloadMainTable()---');
    window.tableHandle.ajax.reload(null, false);
}
$(document).keyup(function(e)
{
    if (e.key === "Escape"){ 
        // escape key maps to keycode `27`
       reloadMainTable();
    }
});