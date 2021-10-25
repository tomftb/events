<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Json extends CI_Controller
{
    private $sessout = [
                        'success' => false,
                        'message' => 'User not logged in!'
                ];
    private $message=array('success'=>true,'data'=>'');
    private $categoryShortcut=1;
    public function __construct()
    {
        parent::__construct();
        date_default_timezone_set("Europe/Warsaw"); 
        $this->load->library('session');
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $this->load->helper('url');
        $this->load->helper('form');
        $this->load->helper('date'); 
    }
    public function returnJson($response)
    {
        $output = $this->output->set_content_type('application/json');
        return ( $output->set_output(json_encode($response)));
    }
    public function getEventRecipient($id=1)
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $output = $this->output->set_content_type('application/json');
        //  AND e.data_koniec>=".now()."
        $this->message['data'] = $this->db->query("SELECT er.`recipient_nrewid` as \"NR EWID\",er.`recipient_name` as \"Osoba\",er.`recipient_email` AS \"Email\", (CASE WHEN `status` ='y' THEN \"TAK\" ELSE \"NIE\" END) AS \"Status\" FROM events_recipient er, events e WHERE e.`id`=".$id." AND e.`id`=er.`id_event` AND e.wsk_u='0' order by er.`recipient_name`")->result_array();
        return $output->set_output(json_encode( $this->message));
    }
    public function getEvents($idcat=1)
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] ID EVENT CATEGORY - ".$idcat);
        $output = $this->output->set_content_type('application/json');
        $message = $this->getEventsData($idcat);
        return $output->set_output(json_encode($message));
    }
    private function getEventsData($idcat)
    {
        log_message('debug', "[".__METHOD__."] SHORTCUT - ".$this->categoryShortcut);
        // datetime
        $current_unix_dt=gmdate("Y-m-d\TH:i:s\Z", now());
        log_message('debug', "[".__METHOD__."] CURRENT DATE TIME - ".now());
        log_message('debug', "[".__METHOD__."] CURRENT DATE TIME - ".$current_unix_dt);
        
        // REMOVE DATE TO SEE EVENTS, DISABLE BUTTON ON VIEW
        // e.data_koniec>=".now()." AND
        $query = $this->db->query("SELECT e.id,e.temat,e.autor,e.autor_email,e.odbiorca,e.odbiorca_email,e.tresc,FROM_UNIXTIME(e.data_koniec) as data_koniec,data_dod  as data_dod,e.wsk_r,(select er.status from events_recipient er where er.id_event=e.id AND er.recipient_nrewid=".$this->session->nrewid." ) as status FROM events e WHERE  e.wsk_u='0' AND e.id_cat=$idcat order by e.id desc");
        
        $events=$query->result_array();
        foreach($events as $k => $v)
        {
            //echo $k."<br/>".$v['tresc']."<br/>";
            $events[$k]['temat']=html_entity_decode($v['temat'],ENT_QUOTES);
            $events[$k]['tresc']=html_entity_decode($v['tresc'],ENT_QUOTES); 
        }
        return ($events);
    }
    public function getUsers()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $output = $this->output->set_content_type('application/json');
        //if ($this->verify_permits('uzytkownicy', 'view')) {
            $query = $this->db->query("SELECT ID,Imie,Nazwisko,Login,Email,TypKonta,Rola FROM v_all_user WHERE wskU=\"0\" order by ID");
            $response = $query->result_array();
        //} else {
         //   $output->set_status_header(403);
         //   $response = [];
        //}
        return $output->set_output(json_encode($response));
    }
    public function getPerms()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $output = $this->output->set_content_type('application/json');
        $query = $this->db->query("SELECT ID,Skrot, Nazwa, Opis FROM `v_upr` order by ID");
        $response = $query->result_array();
        return $output->set_output(json_encode($response));
    }
    public function getPermsForRole()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $this->message['PERM']=$this->db->query("SELECT ID,Nazwa FROM `v_upr` order by ID")->result_array();
        return ($this->returnJson($this->message));
    }
    public function getPermsRole($id='')
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] ID ROLE - ".$id);
        // GET ROLE
        $this->message['ROLE']=$this->db->query("SELECT ID,Nazwa,WSK_U FROM `v_slo_rola` WHERE ID=${id}")->result_array();
        // SET ROLE PERM
        $this->message['PERMROLE']=$this->combineSlo($this->db->query("SELECT ID,Nazwa FROM `v_upr_v2` order by ID")->result_array(),'ID',$this->db->query("SELECT idUpr,idRola FROM `v_upr_i_slo_rola` where idRola=".$id." order by idUpr")->result_array(),'idUpr');

        return ($this->returnJson($this->message));
    }
    public function getRoleUsers($id='')
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        // GET ROLE
        $this->message['ROLE']=$this->db->query("SELECT ID,Nazwa,WSK_U FROM `v_slo_rola` WHERE ID=${id}")->result_array();
        // GET ROLE USERS
        $this->message['USERS']=$this->db->query('SELECT Imie as "Imię", Nazwisko,Login,Email FROM v_all_user WHERE idRola="'.$id.'" AND wskU="0" ORDER BY Nazwisko,Imie,ID ASC ')->result_array();
        return ($this->returnJson($this->message));
    }
    public function getRole()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $output = $this->output->set_content_type('application/json');
        $query = $this->db->query("SELECT ID,Nazwa FROM `v_slo_rola` WHERE `WSK_U`='0' order by ID");
        $response = $query->result_array();
        return $output->set_output(json_encode($response));
    }

    public function getParms()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $output = $this->output->set_content_type('application/json');
        $query = $this->db->query("SELECT ID,Skrot,Nazwa,Typ,Opis,Wartosc FROM `v_parm` order by ID");
        $response = $query->result_array();
        return $output->set_output(json_encode($response));
    }
    public function getParm($id)
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $output = $this->output->set_content_type('application/json');
        $query = $this->db->query("SELECT ID,Nazwa,Typ,Wartosc FROM `v_parm` WHERE `ID`=".$this->db->escape_str($id)."");
        $response = $query->result_array();
        return $output->set_output(json_encode($response[0]));
    }
    protected function combineSlo($slo,$sloKey,$uprRole,$sloUserKey)
    {
        // $sloKey = ID
        // $sloUserKey = idUprawnienie
        $found=false;
        foreach($slo as $id => $value)
        {
            foreach($uprRole as $key => $valueEmpl)
            {
                if($value[$sloKey]===$valueEmpl[$sloUserKey])
                {
                    $slo[$id]['DEFAULT']='t';
                    $found=true;
                    unset($uprRole[$key]);
                    break;
                }   
            }
            if(!$found)
            {
                $slo[$id]['DEFAULT']='n';  
            }
            $found=false;
        }
        return($slo);
    }
    public function getUsersWithPerm($idPerm)
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        $this->message['PERM']=$this->db->query('SELECT id, ImieNazwisko FROM v_upr_i_uzyt_v3 WHERE idUprawnienie="'.$idPerm.'"')->result_array();
        // GET ALL USERS
        $this->message['USERS']=$this->db->query('SELECT ID as "id",CONCAT(Imie," ",Nazwisko) AS "ImieNazwisko" FROM v_all_user WHERE wskU=? ORDER BY ID asc',"0")->result_array();
        return ($this->returnJson($this->message));
    }
    public function getUserDetails($idUser)
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        // GET USER DATA
        $user=$this->db->query('SELECT * FROM v_all_user WHERE ID=?',$idUser)->result_array();
        $this->message['USER']=$user;
        //GET PERMS
        $this->message['PERM']= $this->giveUserPerm($idUser);
        //GET ROLE
        $this->message['ROLE']= $this->getUserRole($user[0]['IdRola']);
        return ($this->returnJson($this->message));
    }
    public function getUserRole($idUserRole='')
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $userRoleSlo=array();
        // GET ALL ROLE
        $result=$this->db->query('SELECT * FROM v_slo_rola WHERE WSK_U="0"');  
        $allRole=$result->result_array();
        if($idUserRole!='')
        {
                // COMBINE USER DICT
                $emptArr=array('ID'=>0,'Nazwa'=>'');
                $result=$this->db->query('SELECT * FROM v_slo_rola WHERE ID='.$idUserRole);  
                $userRole=$result->result_array();
                array_push($userRole,$emptArr);
                foreach($allRole as $key => $value)
                {
                    if($value['ID']===$userRole[0]['ID'])
                    {
                        unset($allRole[$key]);
                        break;
                    }
                }
                $userRoleSlo=array_merge($userRole,$allRole);
        }
        else
        {
            $emptArr=array(array('ID'=>0,'Nazwa'=>'','DEFAULT'=>'t'));
            //echo 'NO USER ROLE\n';
            $userRoleSlo=array_merge($emptArr,$allRole);
        }
        //print_r($userRoleSlo);
        return ($userRoleSlo);
    }
    protected function giveUserPerm($idUser)
    {
        // GET EMPLOYEE DICTIONARY 
        $perm=$this->db->query('SELECT * FROM v_uzyt_i_upr WHERE idUzytkownik="'.$idUser.'" ORDER BY idUprawnienie ASC ');
        // COMBINE
        return $this->combineSlo($this->getSlo('v_slo_upr'),'ID',$perm->result_array(),'idUprawnienie');
    }
    public function getUserPerm($idUser)
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $response=$this->giveUserPerm($idUser);
        return ($this->returnJson($response));
    }
    # RETURN ALL NOT DELETED DICTIONARY and other FROM DB
    public function getSlo($tableToSelect,$order='ID')
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $result=$this->db->query('SELECT * FROM '.$tableToSelect.' ORDER BY '.$order.' ASC ');
        return $result->result_array();
    }
    public function getNewUserSlo()
    {
        if($this->session->login=='') { return ( $this->returnJson($this->checkSession(__METHOD__))); }
        // SLO UPR
        $this->message['UPR']=$this->getSlo('v_slo_upr');
        // SLO ROLA
        $emptArr=array(array('ID'=>0,'Nazwa'=>'','DEFAULT'=>'t'));
        $this->message['ROLE']=array_merge($emptArr,$this->getSlo('v_slo_rola_v2'));
        return ($this->returnJson($this->message));
    }
    public function getRecipients($value='')
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] value : ".$value);
        $value=$this->urlEncode($value);
        log_message('debug', "[".__METHOD__."][urlEncode] value : ".$value);
        $query = $this->db->query("SELECT `adres`,`nazwa` FROM recipients WHERE UPPER(`adres`) like UPPER(('%".$value."%')) OR  UPPER(`nazwa`) like UPPER(('%".$value."%'))");
        //$response = $query->result_array();
        $this->message['DATA']=$query->result_array();
        return ($this->returnJson($this->message));
        //return ($this->returnJson($response));
    }
    private function urlEncode($string)
    {
        $entities = array('%21', '%2A', '%27', '%28', '%29', '%3B', '%3A', '%40', '%26', '%3D', '%2B', '%24', '%2C', '%2F', '%3F', '%25', '%23', '%5B', '%5D');
        $replacements = array('!', '*', "'", "(", ")", ";", ":", "@", "&", "=", "+", "$", ",", "/", "?", "%", "#", "[", "]");
        
        return str_replace($entities, $replacements, $string);
    }
    private function checkSession($method)
    {
        log_message('debug', "[".$method."] User not logged in!");  
        return $this->sessout;
    }
    private function returnErr($msg='Failed! Something has gone wrong. Please contact a system administrator.')
    {
        return $this->returnJson($response = ['success' => false, 'message'=>$msg]);
    }
}
