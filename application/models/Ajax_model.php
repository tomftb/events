<?php

class Ajax_model extends CI_Model
{
    protected $infoArray=array(
                "role"=>array
                (
                    "Podana Nazwa jest za krótka",
                    "Podana Nazwa jest za długa",
                    "Istnieje już rola o podanej nazwie"
                )
            );
    public function __construct()
    {
        parent::__construct();
        $this->load->library('session');
        if($this->session->login=='') { log_message('debug', "[".__METHOD__."] User not logged in");  return 'User not logged in!';}
    }
    public function parsePost()
    {
        $data=explode("&",$this->input->post('data'));
        return $this->expl($data);
    }
    private function expl($data)
    {
        $new_array=array();
        foreach($data as $value)
        {
            $tmp=explode("=",$value);
            $new_array[$tmp[0]]=$tmp[1];
        }
        return $new_array;
    }
    public function checkRecCount($table,$col,$id)
    {
        log_message('debug', "[".__METHOD__."] tabla = ${table}, ${col} = ${id}");
        $result = $this->db->query('SELECT count(*) AS Count FROM '.$table.' WHERE '.$col.'="'.$id.'"');
        $ile=$result->result_array();
        log_message('debug', "[".__METHOD__."] RESULT - ".$ile[0]['Count']);
        return $ile[0]['Count'];
    }
    public function getRec($table,$col,$id)
    {
        log_message('debug', "[".__METHOD__."] tabla = ${table}, ${col} = ${id}");
        $result = $this->db->query('SELECT '.$col.' FROM '.$table.' WHERE '.$col.'="'.$id.'"');
        $rec=$result->result_array();
        return $rec;
    }
    public function checkExistInDb($table,$where)
    {
        log_message('debug', "[".__METHOD__."] tabla = ${table}, where = ${where}");
        $result = $this->db->query('SELECT count(*) AS Count FROM '.$table.' WHERE '.$where.'');
        $ile=$result->result_array();
        log_message('debug', "[".__METHOD__."] RESULT - ".$ile[0]['Count']);
        return $ile[0]['Count'];     
    }
    public function setupRolePerm($post,$id)
    {
        foreach($this->getSpecData($post,'cbox-') as $value)
        {
            log_message('debug', "[".__METHOD__."] ".$value[0]." - ".$value[1]."");
            if($value[1]>0)
            {
                $this->addRolePerm($id,$value[0]);
            }
            else
            {
                $this->removeRolePerm($id,$value[0]);
            }
        }
    }
    public function addRole($nazwa)
    {
        $this->db->query('INSERT INTO slo_rola (NAZWA) VALUES ("'.$nazwa.'")');
        return $this->db->insert_id();
    }
    public function getSpecData($DATA,$field)
    {
        $tmpArray=array();
        $tmpRec=array();

        foreach($DATA as $key => $value)
        {
            if(strpos($key,$field)!==false) 
            {
                log_message('debug', "[".__METHOD__."] FIELD FOUND - ".$key." - ".$value);
                $tmpData=explode('-',$key);
                array_push($tmpRec,$tmpData[1],$value);
                array_push($tmpArray,$tmpRec);
            }
            $tmpRec=[];
        }
        return $tmpArray;
    }
    private function addRolePerm($roleId,$value)
    {
        log_message('debug', "[".__METHOD__."]");
        // CHECK IS EXIST
        if(!$this->checkExistInDb('upr_i_slo_rola','id_rola="'.$roleId.'" AND id_upr="'.$value.'"'))
        {
            // NOT EXIST -> ADD
            $this->db->query('INSERT INTO upr_i_slo_rola (id_rola,id_upr) VALUES ("'.$roleId.'","'.$value.'")'); 
        }
    }
    private function removeRolePerm($roleId,$value)
    {
        log_message('debug', "[".__METHOD__."]");
        if($this->checkExistInDb('upr_i_slo_rola','id_rola="'.$roleId.'" AND id_upr="'.$value.'"'))
        {
            // EXIST -> DELETE
            $this->db->query('DELETE FROM upr_i_slo_rola WHERE id_rola="'.$roleId.'" AND id_upr="'.$value.'"'); 
        }   
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
    public function getUserIdRole($id)
    {
        $result = $this->db->query('
                SELECT
                idRola AS idRola
                FROM
                v_all_user_v2
                WHERE
                id="'.$this->db->escape_str($id).'"
                ');
        $idRole=$result->result_array();
        return $idRole[0]['idRola'];
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
    public function updatePermUser($id,$post)
    {       
        $this->load->model('Perms_model');
        $sendedUsers=$this->getSpecData($post,'pers_');
        $this->Perms_model->editPermUsers($sendedUsers,$this->db->query('SELECT id FROM v_upr_i_uzyt_v2 WHERE idUprawnienie="'.$id.'"')->result_array(),$id); 
    }   
}