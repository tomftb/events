<?php
class Event_model extends CI_Model
{
    private $now='';
    private $timestamp='';
    private $idEvent=0;
    private $post=array();
    public function __construct()
    {
        parent::__construct();
        date_default_timezone_set("Europe/Warsaw"); 
        $this->load->helper('url');
        $this->load->library('session');
        $this->now= date("Y-m-d H:i:s");  
        $this->timestamp=strtotime($this->now);
    }
    public function sign(){
        log_message('debug', "[".__METHOD__."]\r\nSESSION NR EWID => ".$this->session->nrewid);
        /* CHECK EVENT */
        $this->idEvent=intval($this->input->post('idEvent'),10);
        $this->post=$this->input->post();
        
        UNSET($this->post['idEvent']);
        self::checkEvent($this->idEvent);
        /* CHECK SESSION NR EWID */
        if(trim($this->session->nrewid)===''){
            Throw new Exception('Użytkownik nie ma wprowadzonego numeru ewidencyjnego w Active Directory',-1);
        }
        $event_record=$this->db->query("SELECT `id`,`status` FROM `events_recipient` WHERE `recipient_nrewid`=".$this->session->nrewid." AND `id_event`=".$this->idEvent." ")->row();
        log_message('debug', "[".__METHOD__."]\r\nEVENT RECIPIENT ID => ".$event_record->id."\r\nEVENT RECIPIENT STATUS => ".$event_record->status); 
        
        
        (!$event_record->id || $event_record->status==='n') ? self::up($event_record->id) : self::off($event_record->id);
        
        Throw new exception ('test',-1);
        return array('status'=>'');
    }
    private function up($id=0){
        log_message('debug', "[".__METHOD__."] ID => ".$id);
        /* GET EVENT FIELDS */
        $event_fields = $this->db->query("SELECT `id`,`name`,`type`,`title`,`req` FROM `events_field` WHERE `active`='y' AND `id_event`=".$this->idEvent."")->result_array();
        /* CHECK EVENT FIELDS AND COMPARE WITH POST */
        self::checkSignFields($event_fields);
        if($id){
            log_message('debug', "[".__METHOD__."] UPDATE");
            if(!$this->db->query("UPDATE `events_recipient` SET `status`='y' WHERE `id`=$id")){
                throw new Exception ('DATABASE QUERY ERROR IN '.__METHOD__." LINE ".__LINE__,0);
            }
        }
        else{
            log_message('debug', "[".__METHOD__."] INSERT");
            if(!$this->db->query("INSERT INTO `events_recipient` (`id_event`,`recipient_nrewid`,`recipient_name`,`recipient_email`,`status`) VALUES (".$this->idEvent.",'".$this->session->nrewid."','".$this->session->fullname."','".$this->session->email."','y')")){
                throw new Exception ('DATABASE QUERY ERROR IN '.__METHOD__." LINE ".__LINE__,0);
            }
            /* GET LAST INSERT ID */
            $id=$this->db->insert_id();
        }
        self::setEventPersonField($event_fields,$id);
    }
    private function off($id=0){
        log_message('debug', "[".__METHOD__."]\r\nEVENT ID:".$this->idEvent."\r\nEVENT RECIPIENT ID: ".$id);
        if($id){
            log_message('debug', "[".__METHOD__."] UPDATE");
            $this->db->query("UPDATE `events_recipient` SET `status`='n' WHERE `id`=$id");
            /* SET events_recipient_field delete */
            /* DELETE EVENT FIELDS */
            log_message('debug', "[".__METHOD__."] DELETE RECIPIENT EVENTS FIELD");
            if(!$this->db->query("DELETE FROM `events_recipient_field` WHERE `id_event_field` IN (SELECT ef.`id` FROM `events_field` ef WHERE ef.`id_event`=".$this->idEvent.") AND `id_event_recipient`=(SELECT er.`id` FROM `events_recipient` er WHERE er.`id_event`=".$this->idEvent." AND er.`id`='".$id."')  ")){
                throw new Exception ('DATABASE QUERY ERROR IN '.__METHOD__." LINE ".__LINE__,0);
            }
        }
        //throw new Exception ('asdsadas',-1);
    }
    private function checkSignFields($event_fields=array()){
        log_message('debug', "[".__METHOD__."]");
        foreach($event_fields as $v){
            log_message('debug', "[".__METHOD__."]FIELD\r\nNAME => ".$v['name']."\r\nREQUIRE => ".$v['req']);
            self::checkSignKeyExist($v['name']);
            self::checkSignKeyReq($v['name'],$v['type'],$v['req']);
        }
    }
    private function setEventPersonField($event_fields=array(),$idEventRecipient=0){
        log_message('debug', "[".__METHOD__."] ID EVENT RECIPIENT => ".$idEventRecipient);
       
            foreach($event_fields as $v){
                log_message('debug', "[".__METHOD__."] EVENT FIELD ID => ".$v['id']);
                /*
                 * GET EVENT RECIPIENT FIELDS
                 */
                $events_recipient_field=$this->db->query("SELECT `id` FROM `events_recipient_field` WHERE `id_event_field`=".$v['id']." AND `id_event_recipient`=".$idEventRecipient)->row();
                if($events_recipient_field){
                    /*
                    * UPDATE EVENTS RECIPIENT FIELDS
                    */
                    log_message('debug', "[".__METHOD__."] UPDATE `events_recipient_field` FIELD ID => ".$events_recipient_field->id);
                    if(!$this->db->query("UPDATE `events_recipient_field` SET `value`='".$this->post[$v['name']]."' WHERE `id`=".$events_recipient_field->id)){
                        throw new Exception ('DATABASE QUERY ERROR IN '.__METHOD__." LINE ".__LINE__,0);
                    }

                }
                else{
                    /*
                    * INSERT EVENTS RECIPIENT FIELDS
                    */
                    log_message('debug', "[".__METHOD__."] INSERT `events_recipient_field` FIELD ID ".$v['id']." => VALUE ".$this->post[$v['name']]);
                    if(!$this->db->query("INSERT INTO `events_recipient_field` (`id_event_field`,`id_event_recipient`,`value`,`mod_host`) VALUES (".$v['id'].",".$idEventRecipient.",'".$this->post[$v['name']]."','".$this->input->ip_address()."')")){
                        throw new Exception ('DATABASE QUERY ERROR IN '.__METHOD__." LINE ".__LINE__,0);
                    }
                }
                UNSET($this->post[$v['name']]);
            }
        
    }
    private function checkSignKeyExist($key=''){
        if(!array_key_exists($key, $this->post)){
            Throw new Exception('NO '.$key.' KEY IN POST!',0);
        }
    }
    private function checkSignKeyReq($key,$type,$req){
        /* CHECK EVENT CHECKBOX */
        if($req==='y' && $this->post[$key]==='y' && $type==='checkbox'){
            Throw new Exception('Nie zaznaczono - '.$key,-1);
        }
        /* CHECK EVENT INPUT */ 
        /* CHECK EVENT SELECT */ 
    }
    public function getEventRecipient($id)
    {
        log_message('debug', "[".__METHOD__."]\r\nEVENT ID => ".$id);
        /* CHECK EVENT */
        /* SETUP EVENT READ */
        self::setEventRead($id);
        $event=$this->db->query("SELECT `temat`,`autor`,`autor_email`,`odbiorca`,`odbiorca_email` FROM `events` WHERE `id`=${id} ")->row();
        $recipient=$this->db->query("SELECT `recipient_nrewid`,`recipient_name`,`recipient_email` FROM `events_recipient` WHERE `id_event`=${id} AND `status`='y' ")->result_array();
        return array('event'=>$event,'recipient'=>$recipient);
    
    }
    public function getEvents($idcat=1)
    {
        log_message('debug', "[".__METHOD__."] CURRENT DATE TIME - ".$this->timestamp);
        $query = $this->db->query("SELECT e.id,e.temat,e.autor,e.autor_email,e.odbiorca,e.odbiorca_email,FROM_UNIXTIME(e.data_koniec) as data_koniec,data_dod  as data_dod,(select er.status from events_recipient er where er.id_event=e.id AND er.recipient_nrewid=".$this->session->nrewid." ) as status FROM events e WHERE  e.data_koniec>=".$this->timestamp." AND e.wsk_u='0' AND e.id_cat=$idcat order by e.id desc");
        $events=$query->result_array();
        foreach($events as $k => $v){
            $events[$k]['temat']=html_entity_decode($v['temat'],ENT_QUOTES);
            $events[$k]['tresc']=html_entity_decode($v['tresc'],ENT_QUOTES); 
        }
        return ($events);
    }
    public function getEvent($idEvent=0)
    {
        log_message('debug', "[".__METHOD__."] CURRENT DATE TIME - ".$this->timestamp);
        $event = self::checkEvent($idEvent);
        $event_fields = $this->db->query("SELECT `name`,`title`,`req`,`type` FROM `events_field` WHERE `id_event`=".$idEvent." AND `active`='y' ")->result_array();
        /* SETUP EVENT READ */
        self::setEventRead($idEvent);
        return (array('event'=>$event,'event_fields'=>$event_fields,'status'=>''));
    }
    private function checkEvent($id=0){
        log_message('debug', "[".__METHOD__."]\r\nEVENT ID => ${id}");
        $event = $this->db->query("SELECT e.id,e.temat,e.tresc,e.autor,e.autor_email,e.data_koniec,FROM_UNIXTIME(e.data_koniec) as koniec,e.wsk_u,er.`status` as `recipient_status`,er.`id` as recipient_id FROM events e left join events_recipient er on er.id_event=e.id AND er.recipient_nrewid=".$this->session->nrewid." WHERE e.id=${id}")->row();
        if(!$event){
            Throw new Exception('Wydarzenie nie istnieje!',-1);
        }
        if($event->wsk_u!=='0'){
            Throw new Exception('Wydarzenie zostało usunięte!',-1);
        }
        if($this->timestamp>$event->data_koniec){
            Throw new Exception('Przekroczono termin zapisu!',-1);
        }
        unset($event->wsk_u);
        return $event;
    }
    private function setEventRead($idEvent){
        log_message('debug', "[".__METHOD__."]\r\nSESSION NR EWID => ".$this->session->nrewid);
        if($this->session->nrewid===''){
            log_message('debug', "[".__METHOD__."]\r\nNO SESSION NR EWID => EXIT");
            return false;
        }
        if(!$this->db->query("SELECT `nr_ewid` FROM `events_read` WHERE `id_event`=${idEvent} AND `nr_ewid`=".$this->session->nrewid)->row()){
            $this->db->query("INSERT INTO `events_read` (`id_event`,`nr_ewid`,`read_host`) VALUES (".$idEvent.",'".$this->session->nrewid."','".$this->input->ip_address()."')");
        }
    }
}