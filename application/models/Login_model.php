<?php

class Login_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }
    public function checkUserInDb()
    {
        $result = $this->db->query('
                SELECT
                count(*) AS UserCount
                FROM
                uzytkownik
                WHERE
                login="'.$this->db->escape_str($this->input->post('username')).'"
                ');
        $ile=$result->result_array();
        return $ile[0]['UserCount'];
    }
    public function getUserId()
    {
        $result = $this->db->query('
                SELECT
                id AS IdUser
                FROM
                uzytkownik
                WHERE
                login="'.$this->db->escape_str($this->input->post('username')).'"
                ');
        foreach($result->result() as $row)
        {
            $id=$row->IdUser;
        }
        return $id;
    }
    public function getUserType()
    {
        $result = $this->db->query('
                SELECT
                typ AS AccType
                FROM
                uzytkownik
                WHERE
                login="'.$this->db->escape_str($this->input->post('username')).'"
                ');
        $accType=$result->result_array();
        return $accType[0]['AccType'];
    }
    public function checkUserPass()
    {
        $result = $this->db->query('
                SELECT
                count(*) AS UserCount 
                FROM
                uzytkownik
                WHERE
                login="'.$this->db->escape_str($this->input->post('username')).'" AND
                haslo="'.$this->db->escape_str($this->input->post('password')).'"  
                ');
        $UserCount=$result->result_array();
        return $UserCount[0]['UserCount'];
    }
    public function getUserPerm($username)
    {
        log_message('debug', "[".__METHOD__."] ".$username); 
        // GET INDIVIDUAL PERMS
        $result=$this->db->query('SELECT skrot FROM v_upr_i_uzyt_v4 WHERE login="'.$this->db->escape_str($username).'"');
        $perm=$result->result_array();
        
        // GET ROLE PERMS
        $result=$this->db->query('SELECT skrot FROM v_upr_i_slo_rola_v2 WHERE login="'.$this->db->escape_str($username).'"');
        $permRole=$result->result_array();

        return ($this->mergePermRole($perm,$permRole));
    }
    private function mergePermRole($perm,$roleperm)
    {
        log_message('debug', "[".__METHOD__."]"); 
        $array1=array();
        $array2=array();
        // FLATTEN 1
        foreach($perm as $value)
        {
            log_message('debug', "[".__METHOD__."] PERM -> ".$value['skrot']);
            array_push($array1,$value['skrot']);
        }
        //print_r($array1);
        // FLATTEN 2
        foreach($roleperm as $value)
        {
            log_message('debug', "[".__METHOD__."] ROLE PERM -> ".$value['skrot']);
            if(!in_array($value['skrot'],$array1))
            {
                array_push($array2,$value['skrot']);
            }
        } 
        //print_r($array2);
        $merge=array_merge($array1,$array2);
        foreach($merge as $value)
        {
            log_message('debug', "[".__METHOD__."] USER PERM -> ".$value);
        }
        return ($merge);
    }   
}