<?php
class Perms_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }
    public function editPermUsers($sendedUsers,$allPermUsers,$permId)
    {
        $this->load->model('Login_model');
        log_message('debug', "[".__METHOD__."] RUN()");
        $changeSessionPerm=false;
        $this->clearUserPermTab($sendedUsers,$allPermUsers);
        // DELETE
        foreach($allPermUsers as $suser)
        {
            log_message('debug', "[".__METHOD__."] ADD - ".$suser['id']);
            $this->deleteUserPerm($suser['id'],$permId);  
            $this->checkSessionUser($suser['id'],$changeSessionPerm);
        }
        // ADD
        foreach($sendedUsers as $userid)
        {
            log_message('debug', "[".__METHOD__."] DELETE - ".$userid[1]);
            $this->addUserPerm($userid[1],$permId);
            $this->checkSessionUser($userid[1],$changeSessionPerm);
        }
        if($changeSessionPerm)
        {
            log_message('debug', "[".__METHOD__."] CHANGE CURRENT USER SESSION PERMISSION"); 
            log_message('debug', "[".__METHOD__."] PERM TAB - ".$this->Login_model->getUserPerm($this->session->userid));
            $this->session->set_userdata('perm',$this->Login_model->getUserPerm($this->session->login));
        }
    }
     protected function addUserPerm($userId,$idPerm)
    {
        $this->db->query('INSERT INTO uzyt_i_upr (id_uzytkownik,id_uprawnienie) VALUES ("'.$userId.'","'.$idPerm.'")'); 
    }
    protected function deleteUserPerm($userId,$idPerm)
    {
        $this->db->query('DELETE FROM uzyt_i_upr WHERE id_uzytkownik="'.$userId.'" AND id_uprawnienie="'.$idPerm.'"');
    }
    protected function clearUserPermTab(&$sendedUsers,&$allPermUsers)
    {
        foreach($sendedUsers as $key=> $userid)
        {
            log_message('debug', "[".__METHOD__."] SENDED USERS ${key} - ${userid}");
            log_message('debug', "[".__METHOD__."] SENDED USERS ID - ".$userid[1]);
            foreach($allPermUsers as $id => $user)
            {
                if($userid[1]===$user['id'])
                {
                    //echo "FOUND - UNSET\n";
                    UNSET($sendedUsers[$key]);
                    UNSET($allPermUsers[$id]);
                }
            }
        }
    }
    public function checkSessionUser($id,&$changeSessionPerm)
    {
        log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] ".$_SESSION['userid']." - ".$this->session->userid);
        if($_SESSION['userid']===$id)
        {
            $changeSessionPerm=$id;
        }
    }
    protected function setActSessionPermRole($idRole,$idUser)
    {
        // UPDATE CURRENT USER SESSION PERM;
        //echo "UPDATE PERM ROLE<br/>";
        $permRole=array();
        if($idRole)
        {
            $this->query('SELECT SKROT FROM v_upr_i_slo_rola_v2 WHERE idRola=?',$idRole);
            $permRole=$this->queryReturnValue();
            //print_r($permRole); 
        }
        $this->query('SELECT SKROT FROM v_uzyt_i_upr_v2 WHERE idUzytkownik=?',$idUser);
        $perm=$this->queryReturnValue();
        $_SESSION['perm']=$this->parsePermRole($perm,$permRole);
        //echo "SESSION PERM ROLE CHANGED\n";
        //print_r($_SESSION);
    }
}