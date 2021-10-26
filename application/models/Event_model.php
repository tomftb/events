<?php
class Event_model extends CI_Model
{
    private $now='';
    private $timestamp='';
    public function __construct()
    {
        parent::__construct();
        date_default_timezone_set("Europe/Warsaw"); 
        $this->load->helper('url');
        $this->load->library('session');
        $this->now= date("Y-m-d H:i:s");  
        $this->timestamp=strtotime($this->now);
    }
    public function changeUserEventStatus($id)
    {
        try{
            //check messages
            log_message('debug', "[".__METHOD__."]\r\nEVENT ID => ".$id."\r\nUSER NR EWID => ".$this->session->nrewid."\r\nUSER NAME => ".$this->session->fullame."\r\nUSER EMAIL => ".$this->session->email."\r\nDATE TIME => ".$this->now."\r\nTIMESTAMP => ".$this->timestamp);
            // check event exist
            $user_status_event='n';
            if($this->db->query("SELECT  * FROM `events` WHERE `id`=${id}")->num_rows()<1){
                log_message('debug', "[".__METHOD__."] EVENT (${id}) NOT EXIS");
                return 'Wydarzenie ('.$id.') nie istnieje!';
            }
            if($this->db->query("SELECT  * FROM `events` WHERE data_koniec>=".$this->timestamp." AND `id`=${id}")->num_rows()<1){
                log_message('debug', "[".__METHOD__."] EVENT (${id}) DATA END LOWER THAN NOW()");
                return 'Upłynął termin zapisu na wydarzenie ('.$id.')!';
            }
            $exist = $this->db->query("SELECT  `id` FROM `events_recipient` WHERE `id_event`=${id} AND `recipient_nrewid`=\"".$this->session->nrewid."\"  ")->num_rows();
            log_message('debug', "[".__METHOD__."] EVENT CURRENT USER ROWS IN DB => ".$exist);
            $msg='Zapisałeś się na wydarzenie!';
            if($exist<1){
                // UZYTKOWNIK NIE ZAPISANY
                log_message('debug', "[".__METHOD__."] ADD USER ".$this->session->nrewid." TO EVENT ($id)");
                $this->db->query('INSERT INTO `events_recipient` (`id_event`,`recipient_nrewid`,`recipient_name`,`recipient_email`,`recipient_email_login`)VALUES('.$id.',"'.$this->session->nrewid.'","'.$this->session->fullname.'","'.$this->session->email.'","'.$this->session->email_login.'")'); 
                return $msg;
            }
            else{
                // check status
                $status = $this->db->query("SELECT `status` as status FROM `events_recipient` WHERE `id_event`=${id} AND `recipient_nrewid`='".$this->session->nrewid."' ")->row();
                if($status->status==='n'){
                    $user_status_event='y';
                }
                else{
                    $user_status_event='n';
                    $msg='Wypisałeś się z wydarzenia!';
                }
                log_message('debug', "[".__METHOD__."] CHANGE USER EVENT ($id) STATUS TO => ".$user_status_event);
            }
            $this->db->query('UPDATE `events_recipient` SET `status`="'.$user_status_event.'",`mod_dat`="'.$this->now.'" WHERE `id_event`='.$id.' AND `recipient_nrewid`="'.$this->session->nrewid.'"'); 
            throw Exception ('asdasd');
        }
        catch(Exception $e){
            log_message('debug', "[".__METHOD__."]\r\nERROR CODE:".$e->getCode()."\r\nERROR MESSAGE: ".$e->getMessage());
            return 'ERROR';
        }
        return $msg;
    }
    public function sign(){
        
        log_message('debug', "[".__METHOD__."] SESSION NR EWID => ".$this->session->nrewid);
        /* CHECK EVENT */
        $event = self::checkEvent($this->input->post('event'));
        /* GET EVENT FIELDS */
        $event_fields = $this->db->query("SELECT `id`,`name` FROM `events_details` WHERE `id_event`=".$this->input->post('event')." AND `req`='y'")->result_array();
        /* CHECK EVENT COVID */
        if($this->input->post('covid')!=='y'){
            Throw new Exception('Brak zaznaczonej deklaracji COVID-19',-1);
        }
        if(trim($this->session->nrewid)===''){
            Throw new Exception('Użytkownik nie ma wprowadzonego numeru ewidencyjnego w Active Directory',-1);
        }
        $event_record=$this->db->query("SELECT `id`,`status` FROM `events_recipient` WHERE `recipient_nrewid`=".$this->session->nrewid." AND `id_event`=".intval($this->input->post('event'),10)." ")->row();
        
        print_r($this->input->post('value'));
        foreach($this->input->post() as $k => $v){
            log_message('debug', "[".__METHOD__."] K $k => V ".$v);
        }
    }
    private function up(){
        log_message('debug', "[".__METHOD__."]");
       
        //throw new Exception ('asdsadas',-1);
    }
    private function off(){
        log_message('debug', "[".__METHOD__."]");
        //throw new Exception ('asdsadas',-1);
    }
    public function getEventRecipient($id)
    {
        log_message('debug', "[".__METHOD__."] EVENT ID => ".$id);
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
    public function getEvent($id=0)
    {
        log_message('debug', "[".__METHOD__."] CURRENT DATE TIME - ".$this->timestamp);
        $event = self::checkEvent($id);
        /* SETUP USER READ STATUS */
        return (array('event'=>$event,'status'=>''));
    }
    private function checkEvent($id=0){
        log_message('debug', "[".__METHOD__."] EVENT ID => ${id}");
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
}