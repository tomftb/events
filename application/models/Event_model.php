<?php
class Event_model extends CI_Model
{
    private $now='';
    public function __construct()
    {
        parent::__construct();
        date_default_timezone_set("Europe/Warsaw"); 
        $this->load->helper('url');
        $this->load->library('session');
        $this->now= date("Y-m-d H:i:s");  
    }
    public function changeUserEventStatus($id)
    {
        //check messages
        log_message('debug', "[".__METHOD__."] EVENT ID => ".$id." USER NREWID => ".$this->session->nrewid." USER NAME => ".$this->session->fullame." USER EMAIL => ".$this->session->email." DATE TIME => ".$this->now);
        // check event exist
        $user_status_event='n';
        if($this->db->query("SELECT  * FROM `events` WHERE `id`=${id}")->num_rows()<1)
        {
            log_message('debug', "[".__METHOD__."] EVENT (${id}) NOT EXIS");
            return 'Wydarzenie ('.$id.') nie istnieje!';
            
        }
        if($this->db->query("SELECT  * FROM `events` WHERE data_koniec>=".now()." AND `id`=${id}")->num_rows()<1)
        {
            log_message('debug', "[".__METHOD__."] EVENT (${id}) DATA END LOWER THAN NOW()");
            return 'Upłynął termin zapisu na wydarzenie ('.$id.')!';
            
        }
        $exist = $this->db->query("SELECT  `id` FROM `events_recipient` WHERE `id_event`=${id} AND `recipient_nrewid`=\"".$this->session->nrewid."\"  ")->num_rows();
        log_message('debug', "[".__METHOD__."] EVENT CURRENT USER ROWS IN DB => ".$exist);

        $msg='Zapisałeś się na wydarzenie!';
        if($exist<1)
        {
            // UZYTKOWNIK NIE ZAPISANY
            log_message('debug', "[".__METHOD__."] ADD USER ".$this->session->nrewid." TO EVENT ($id)");
            $this->db->query('INSERT INTO `events_recipient` (`id_event`,`recipient_nrewid`,`recipient_name`,`recipient_email`,`recipient_email_login`)VALUES('.$id.',"'.$this->session->nrewid.'","'.$this->session->fullname.'","'.$this->session->email.'","'.$this->session->email_login.'")'); 
            return $msg;
        }
        else
        {
            // check status
            $status = $this->db->query("SELECT `status` as status FROM `events_recipient` WHERE `id_event`=${id} AND `recipient_nrewid`='".$this->session->nrewid."' ")->row();
            if($status->status=='n')
            {
                $user_status_event='y';
            }
            else
            {
                $user_status_event='n';
                $msg='Wypisałeś się z wydarzenia!';
            }
            log_message('debug', "[".__METHOD__."] CHANGE USER EVENT ($id) STATUS TO => ".$user_status_event);
        }
        $this->db->query('UPDATE `events_recipient` SET `status`="'.$user_status_event.'",`mod_dat`="'.$this->now.'" WHERE `id_event`='.$id.' AND `recipient_nrewid`="'.$this->session->nrewid.'"'); 
        return $msg;
    }
    public function getEventData($id)
    {
        log_message('debug', "[".__METHOD__."] EVENT ID => ".$id);
        $email_tresc_col='email_nie';
        $status = $this->db->query("SELECT `status` as status FROM `events_recipient` WHERE `id_event`=${id} AND `recipient_nrewid`='".$this->session->nrewid."' ")->row();
        log_message('debug', "[".__METHOD__."] USER STATUS => ".$status->status);
        if($status->status=='y')
        {
             $email_tresc_col='email_tak';
        }
        return ($this->db->query("SELECT CONCAT('(', `temat`,') ',`email_tytul`) as `temat`,`odbiorca`,`odbiorca_email`,`".$email_tresc_col."` as 'wiadomosc' FROM `events` WHERE `id`=${id}")->result_array());
        // check event exist
    }
}