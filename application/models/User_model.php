<?php
class User_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->load->library('session');
    }
    # DELETED PROJECT IN DB
    public function deleteUser($userId)
    {
        log_message('debug', "[".__METHOD__."] ID - ".$userId);
        $userId=trim($this->db->escape_str($userId));
        if($userId!='')
        {
            $this->db->query('UPDATE uzytkownik SET wsk_u="1" WHERE id='.$userId);
            return ($response = ['success' => true]);
        }
        else
        {
            return ($response = [
                        'success' => false,
                        'message' => 'NO ID USER'
                ]);
        }      
    }
    public function addUser($userData)
    {
        log_message('debug', "[".__METHOD__."] User data - ".$userData);
        $curretDateTime=date('Y-m-d H:i:s');
        $this->db->query('INSERT INTO uzytkownik 
            (imie,nazwisko,login,haslo,email,typ,id_rola,mod_dat,mod_user,mod_user_id) 
		VALUES
		("'.$this->db->escape_str($userData['imie']).'","'.$this->db->escape_str($userData['nazwisko']).'","'.$this->db->escape_str($userData['login']).'","'.$this->db->escape_str($userData['haslo']).'","'.$this->db->escape_str($userData['email']).'","'.$this->db->escape_str($userData['typkonta']).'","'.$this->db->escape_str($userData['rola']).'","'.$curretDateTime.'","'.$_SESSION["user"].'","'.$_SESSION["userid"].'")');  
        return ($this->db->insert_id());
    }
    public function updateUser($userData)
    {
        $curretDateTime=date('Y-m-d H:i:s');
        $query=$this->db->query('UPDATE uzytkownik SET imie="'.$this->db->escape_str($userData['imie']).'", nazwisko="'.$this->db->escape_str($userData['nazwisko']).'", login="'.$this->db->escape_str($userData['login']).'",email="'.$this->db->escape_str($userData['email']).'",haslo="'.$this->db->escape_str($userData['haslo']).'",typ="'.$this->db->escape_str($userData['typkonta']).'",id_rola="'.$this->db->escape_str($userData['rola']).'", mod_dat="'.$curretDateTime.'", mod_user="'.$_SESSION["user"].'",mod_user_id='.$_SESSION["userid"].' WHERE id='.$this->db->escape_str($userData['id']));
        return ($query != 1) ? false : true;  
       // return ($this->db->affected_rows() != 1) ? false : true;  
    }
    
    public function editUserPerm($permArray,$userId)
    {
        log_message('debug', "[".__METHOD__."]");
        $this->load->model('Login_model');
        $changeSessionPerm=false;
        foreach($permArray as $key => $value)
        {
            log_message('debug', "[".__METHOD__."] User perm - ${key} - ${value}");
            if($value[1]>0)
            {
                $this->addUserPerm($userId,$value[0]);
            }
            else
            {
                $this->removeUserPerm($userId,$value[0]);
            }
        }
        $this->checkSessionUser($userId,$changeSessionPerm);
        if($changeSessionPerm)
        {
            $this->session->set_userdata('perm',$this->Login_model->getUserPerm($this->session->login));
        }
    }
    protected function addUserPerm($userId,$value)
    {
        // CHECK IS EXIST
        if(!$this->Ajax_model->checkExistInDb('v_uzyt_i_upr','idUzytkownik='.$userId.' AND idUprawnienie='.$value))
        {
            // NOT EXIST -> ADD
            $this->db->query('INSERT INTO uzyt_i_upr (id_uzytkownik,id_uprawnienie) VALUES ("'.$userId.'","'.$value.'")'); 
        }
    }
    protected function removeUserPerm($userId,$value)
    {
        if($this->Ajax_model->checkExistInDb('v_uzyt_i_upr','idUzytkownik='.$userId.' AND idUprawnienie='.$value))
        {
            // EXIST -> DELETE
            $this->db->query('DELETE FROM uzyt_i_upr WHERE id_uzytkownik="'.$userId.'" AND id_uprawnienie="'.$value.'"'); 
        } 
    }
    private function checkSessionUser($id,&$changeSessionPerm)
    {
        log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] ".$_SESSION['userid']." - ".$this->session->userid);
        if($_SESSION['userid']===$id)
        {
            $changeSessionPerm=$id;
        }
    }
}
