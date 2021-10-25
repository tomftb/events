<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ajax extends CI_Controller
{ 
    private $sessout = [
                        'success' => false,
                        'message' => 'User not logged in!'
                ];
    public function __construct()
    {
        parent::__construct();
        $this->load->library('session');
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $this->load->helper('url');
        $this->load->helper('form');
        $this->load->model('Ajax_model');
        $this->load->model('Parse_model');
        $this->load->helper('string');
        $this->load->library('session');   
    }
    public function returnJson($response)
    {
        $output = $this->output->set_content_type('application/json');
        return ( $output->set_output(json_encode($response)));
    }
    public function eRole()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        $this->load->model('Login_model');
        log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] ".$this->input->post('data'));
        if(!$this->checkUserAcl('EDIT_ROLE')) { return $this->returnNoAcl('EDIT_ROLE'); }
        $post=$this->Ajax_model->parsePost();
        if($this->Ajax_model->checkExistInDb('v_slo_rola_v2','NAZWA="'.$post['nazwa'].'" AND ID!="'.$post['id'].'"'))
        {
            $response = [
                        'success' => false,
                        'message' => 'Istnieje już rola o podanej nazwie'
                ];
            return ( $this->returnJson($response));
        }
        $this->Ajax_model->setupRolePerm($post,$post['id']);
        // CHECK CURRENT LOGGED USER ROLE
        log_message('debug', "[".__METHOD__."] USER ID - ".$this->session->userid);
        $idRole=$this->Ajax_model->getUserIdRole($this->session->userid);
        log_message('debug', "[".__METHOD__."] ID ROLE - ".$idRole);
        // UPDATE CURRENT LOGGED USER SESSION PERMSISSION
        if($idRole==$post['id'])
        {
            log_message('debug', "[".__METHOD__."] UPDATE USER PERM ");
            $this->session->set_userdata('perm',$this->Login_model->getUserPerm($this->session->login));
        }
        return ($this->returnJson($response = ['success' => true]));
    }
    public function cRole()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] ".$this->input->post('data'));
        if(!$this->checkUserAcl('ADD_ROLE')) { return $this->returnNoAcl('ADD_ROLE'); }
        $post=$this->Ajax_model->parsePost();
        if($this->Ajax_model->checkExistInDb('v_slo_rola_v2','NAZWA="'.$post['nazwa'].'"'))
        {
            $response = [
                        'success' => false,
                        'message' => 'Istnieje już rola o podanej nazwie'
                ];
            return ($this->returnJson($response));
        }
        $this->Ajax_model->setupRolePerm($post,$this->Ajax_model->addRole($post['nazwa']));
        return ( $this->returnJson($response = ['success' => true]));
    }
    public function dRole()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        if(!$this->checkUserAcl('DEL_ROLE')) { return $this->returnNoAcl('DEL_ROLE'); }
        $post=$this->Ajax_model->parsePost();
        $this->db->query('UPDATE slo_rola SET WSK_U="1" WHERE ID="'.$post['id'].'"');
        return ( $this->returnJson($response = ['success' => true]));
    }
    public function ePermUsers()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] ".$this->input->post('data'));
        if(!$this->checkUserAcl('EDIT_USER_PERM')) { return $this->returnNoAcl('EDIT_USER_PERM'); }
        // GET SENDED DATA VIA POST
        $post=$this->Ajax_model->parsePost();
        $this->Ajax_model->updatePermUser($post['id'],$post);
        return $this->returnJson($response = ['success' => true]);
    }

    public function dUser()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] ID - ".$this->input->post('data'));
        $post=$this->Ajax_model->parsePost();
        $this->load->model('User_model');
        $response=$this->User_model->deleteUser($post['id']);
        return $this->returnJson($response);
    }
    public function cUser()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        $post=$this->Ajax_model->parsePost();
        if(($this->Ajax_model->checkExistInDb('v_all_user_v2','TRIM(UPPER(Login))="'.trim(mb_strtoupper($post['login'])).'"')) ||
                
                ($this->Ajax_model->checkExistInDb('v_all_user_v2','TRIM(UPPER(Imie))="'.trim(mb_strtoupper($post['imie'])).'" AND TRIM(UPPER(Nazwisko))="'.trim(mb_strtoupper($post['nazwisko'])).'"'))
                )
            {
            return $this->returnJson($response = [
                        'success' => false,
                        'message' => 'Istnieje już użytkownik o wprowadzonych danych: imię i nazwisko lub login'
                ]);
        } 
        if(trim($post['email'])!='')
        {
            if ($this->Ajax_model->checkExistInDb('v_all_user_v2','TRIM(UPPER(Email))="'.trim(mb_strtoupper($post['email'])).'"'))
            {
               return $this->returnJson($response = [
                        'success' => false,
                        'message' => 'Istnieje już użytkownik o wprowadzonym adresie email'
                ]); 
            }
        }
        $this->load->model('User_model');
        $id=$this->User_model->addUser($post);
        if(!$id)
        {
            return $this->returnJson($response = ['success' => false, 'message'=>'Failed! Something has gone wrong. Please contact a system administrator.']);
        }
        log_message('debug', "[".__METHOD__."] LAST INSERTED ID - ".$id);
        $this->User_model->editUserPerm($this->Ajax_model->getSpecData($post,'cbox-'),$id);
        return $this->returnJson($response = ['success' => true]);
    }
    public function eUser()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        $post=$this->Ajax_model->parsePost();
        if ($this->Ajax_model->checkExistInDb('v_all_user_v2','TRIM(UPPER(Login))="'.trim(mb_strtoupper($post['login'])).'" AND ID!="'.trim($post['id']).'"'))
        {
            return $this->returnJson($response = [
                        'success' => false,
                        'message' => 'Istnieje już użytkownik o podanym loginie'
                ]); 
        }
        if ($this->Ajax_model->checkExistInDb('v_all_user_v2','TRIM(UPPER(Imie))="'.trim(mb_strtoupper($post['imie'])).'" AND TRIM(UPPER(Nazwisko))="'.trim(mb_strtoupper($post['nazwisko'])).'" AND ID!="'.trim($post['id']).'"'))
        {
            return $this->returnJson($response = [
                        'success' => false,
                        'message' => 'Istnieje już użytkownik o podanym imieniu i nazwisku'
                ]); 
        }
        $this->load->model('User_model');
        if(!$this->User_model->updateUser($post))
        {
            return $this->returnJson($response = ['success' => false, 'message'=>'Failed! Something has gone wrong. Please contact a system administrator.']);
        }
        $this->User_model->editUserPerm($this->Ajax_model->getSpecData($post,'cbox-'),$post['id']);
        return $this->returnJson($response = ['success' => true]);
        //$this->setActSessionPermRole($this->inpArray['rola'],$this->inpArray['idUser']);
    }
    public function userPerm()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        $post=$this->Ajax_model->parsePost();
        $this->load->model('User_model');
        $this->User_model->editUserPerm($this->Ajax_model->getSpecData($post,'cbox-'),$post['id']);
        //$this->setActSessionPermRole($idRole[0]['IdRola'],$this->inpArray['idUser']);
        return $this->returnJson($response = ['success' => true]);   
    }
    public function eParm()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        if(!$this->checkUserAcl('EDIT_PARM')) { return $this->returnNoAcl('EDIT_PARM'); }
        $this->load->model('Parm_model');
        return ($this->Parm_model->updateParm($post) != 1) ?  $this->returnErr() : $this->returnOk();
        //return ($this->db->affected_rows() != 1) ?  $this->returnErr() : $this->returnOk();  
    }
    public function returnErr($msg='Failed! Something has gone wrong. Please contact a system administrator.')
    {
        return $this->returnJson($response = ['success' => false, 'message'=>$msg]);
    }
    public function returnNoAcl($aclCode)
    {
        return $this->returnJson($response = ['success' => false, 'message'=>'['.$aclCode.'] NO PERMISSION']);
    }
    public function returnOk()
    {
        return ($this->returnJson($response = ['success' => true]));
    }
    private function checkUserAcl($aclCode)
    {
        $check=in_array($aclCode,$this->session->perm);
        log_message('debug', "[".__METHOD__."] ${aclCode} - ".$check);
        return ($check);
    }
    public function cEmail()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        $this->load->model('Email_model');
        $post=$this->Ajax_model->parsePost();
        $status=$this->Email_model->sendEmail($post,'cEmail');
        if($status!=='')
        {
            return ($this->returnJson($response = ['success' => false,'message'=>$status]));
        }
        return ($this->returnJson($response = ['success' => true]));
    }

    public function chEmlReadStatus()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        $post=$this->Ajax_model->parsePost();
        log_message('debug', "[".__METHOD__."] ID - ".$post['id']);
        $status='';
        if(is_numeric($post['id']))
        {
            log_message('debug', "[".__METHOD__."] SET READ STATUS TO TRUE");
            $status=$this->db->query("UPDATE `emails` SET `wsk_r`='y' WHERE ID='".$this->db->escape_str($post['id'])."'");
        }
        else
        {
            log_message('debug', "[".__METHOD__."] NO UPDATE - WRONG ID");
        }
        log_message('debug', "[".__METHOD__."] QUERY STATUS - ".$status);
        //$this->db->affected_rows()
        return ( $status != 1) ?  $this->returnErr() : $this->returnOk();
    }

    private function checkSession($method)
    {
        log_message('debug', "[".$method."] User not logged in!");  
        return $this->sessout;
    }
    public function saveUserToEvent()
    {
        if($this->session->login==''){ return ( $this->returnJson($this->checkSession(__METHOD__))); }
        log_message('debug', "[".__METHOD__."] POST - ".$this->input->post('data'));
        $post=$this->Ajax_model->parsePost();
        $post['id']=intval(trim($post['id']));
        $this->load->model('Event_model');
        $answer=$this->Event_model->changeUserEventStatus($post['id']);
        // send notify
        $this->load->model('Email_model');
        $tmp=$this->Event_model->getEventData($post['id']);
        $email_data=$tmp[0];
        $email_data['email_type-0']='to';
        $email_data['s-address_id-0']=$this->session->email;
        $email_data['s-address-0']=$this->session->fullname;
        
        $status=$this->Email_model->sendEmail($email_data,'cEventEmail');
        if($status!=='')
        {
            return ($this->returnJson($response = ['success' => false,'message'=>$status]));
        }
        // set success to false to show notify even is ok
        return ($this->returnJson($response = ['success' => true,'message'=>$answer]));
        
    }
}