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
        url: '/Event/getEvents',
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
            reloadData();
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
$(document).keyup(function(e)
{
    if (e.key === "Escape"){ 
        // escape key maps to keycode `27`
       reloadData();
    }
});
function createButton(type, row)
{
    if (type === 'display'){
        var event_user_list='';
        if(perm['SHOW_EVENT_USERS']!=='disabled'){
            event_user_list='<button onclick="ajax(\'getEventRecipient/'+row.id+'\',\'openEventRecipient\',\'GET\',\'\')" class="btn btn-warning">Lista</button>';
        }
        return "<div class=\"btn-group pr-0 mr-0\"><button onclick=\"ajax('getEvent/"+row.id+"','openEvent','GET','')\" class=\"btn btn-info\" >Szczegóły</button>"+event_user_list+"</div>";
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
    console.log('---openEvent()---');
    console.log(data);
    var modal=document.getElementById('adaptedModal').cloneNode(true);
    console.log(modal);
    /* SETUP HEADER */
    modal.childNodes[0].childNodes[0].childNodes[0].classList.add('bg-info');
    modal.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText='Szczegóły wydarzenia';
    if(!checkEventStatus(modal,data)){ return false; }
    var actionBtn=checkEventRecord(data);
    /* SETUP BODY TITLE */
    modal.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML="<p class=\"text-center h3\">"+data.event.temat+"</p>";
    /* SETUP BODY DATA */
    modal.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].innerHTML=data.event.tresc;
    /* SETUP BODY BUTTON */
    console.log(modal.childNodes[0].childNodes[0].childNodes[1].childNodes[2].childNodes[0]);
    modal.childNodes[0].childNodes[0].childNodes[1].childNodes[2].childNodes[0].innerHTML='<div class="form-check border-top w-100 mt-3 font-weight-bold"><input type="checkbox" class="form-check-input" id="transport"><label class="form-check-label" for="transport">Czy chcesz skorzystać ze zorganizowanego transportu do i z CKK Jordanki?</label></div><div class="form-check font-weight-bold text-danger"><input type="checkbox" class="form-check-input" id="covid"><label class="form-check-label" for="covid">Deklaruję, że dnia 9.12.2021 będę osobą w pełni zaszczepioną przeciw COVID-19.</label></div><div class="btn-group float-right mb-1 mt-3" role="group" aria-label="BasicGroup"><button class="btn btn-dark" data-dismiss="modal" aria-label="Close">Anuluj</button>'+actionBtn;
    /* SETUP BODY LEGEND */
    modal.childNodes[0].childNodes[0].childNodes[1].childNodes[5].innerHTML='<ul class="border-top w-100" style="list-style-type: square"><li>Zapis możliwy tylko i wyłącznie dla osób w pełni zaszczepionych przeciwko COVID-19.</li></ul>';
    /* SETUP FOOTER INFO */
    modal.childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].innerHTML="<small class=\"text-secondary\">Autor: "+data.event.autor+" ("+data.event.autor_email+")</small>";    
    $(modal).modal('show');
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
    var yes='<button class="btn btn-primary" onClick="sign('+data.event.id+',\'y\')">Zapisz mnie</button></div>';
    var no='<button class="btn btn-danger" onClick="sign('+data.event.id+',\'n\')">Wypisz mnie</button></div>';
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
    console.log('---getEventRecipient()---\nURL: '+url+'\nTASK: '+task);
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
            console.log('---AJAX SUCCESS---');
            console.log(answer);
            //(new Function(`${task}('${answer}')`))();
            window[task](answer);
        },
        error: function (request, status, error)
        {
            console.log('---AJAX ERROR---');
            console.log(request);
            console.log(error+' '+status);
            alert('Error occured!');
        }
    });  
}
function openEventRecipient(data)
{
    console.log('---openEventRecipient()---\nData:');
    try {
        console.log(data);
        var columns=[
            {
                title:"Nr ewid",
                data: 'recipient_nrewid',
                search:  null,  
                orderable:false
            },
            {
                title:"Nazwisko Imię",
                data: 'recipient_name',
                search:  null,  
                orderable:false
            },
            {
                title:"E-mail",
                data: 'recipient_email',
                search:  null,  
                orderable:false
            }
        ];
        var modal=document.getElementById('adaptedModal').cloneNode(true);
        console.log(modal);
        console.log(modal.childNodes[0].childNodes[0].childNodes[0]);
        /* SETUP HEADER */
        modal.childNodes[0].childNodes[0].childNodes[0].classList.add('bg-warning');
        modal.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText='Lista zapisanych';
        console.log(modal.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0]);
        /* SETUP BODY TITLE*/
        console.log(modal.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0]);
        modal.childNodes[0].childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerHTML="<p class=\"text-center h3\">"+data.event.temat+"</p>";
        /* SETUP BODY DATA*/
        var table=document.getElementById('dynamicDataTableDiv').cloneNode(true); 
            setDynamicTable(table.childNodes[0],data.recipient,columns); 
            console.log(modal.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0]);
            modal.childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].appendChild(table);
            
        /* SETUP FOOTER INFO */
        console.log(modal.childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].childNodes[0]);
        modal.childNodes[0].childNodes[0].childNodes[2].childNodes[0].childNodes[0].innerHTML="<small class=\"text-secondary\">Autor: "+data.event.autor+" ("+data.event.autor_email+")</small>";
        /* SHOW */
        $(modal).modal('show');
    }
    catch (error) {
        console.error(error);   
    }
}
function checkSignAnswear(data){
    console.log('---checkSignAnswear()---');
    console.log(data);
    
}
function sign(eventId,record){
    console.log('---signUp()---');
    var value={
        covid:'y',
        transport:'n',
        event:eventId,
        sign:record
    };
    ajax('eventSign','checkSignAnswear','POST',value);
}
