<?php
if(!defined('BASEPATH')){ exit('No direct script access allowed');}

class Login extends CI_Controller
{
    private $NaglowekDane=array(
        'app_name'=>'GT-Events',
        'tytul'=>'Zaloguj się',
        'url'=>'',
        'err'=>'',
        'err_bg'=>'bg-danger'
        );
    private $login=false;
    private $userperm=array();
    private $user_full_data=array();
    public function index()
    {
        $this->load->model('Login_model');
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->library('form_validation');
        $this->load->library('ldap');
        $this->ldap->connect('geofizyka.geofizyka.pl','(&(sAMAccountName=%u)(objectcategory=person)(objectclass=user))','ou=Geofizyka, dc=geofizyka, dc=pl',389,'ldap@geofizyka.pl','Ld4p321');//Ld4p321
        $this->NaglowekDane['url']=base_url();
        $this->checkUriSegments();
        $this->checkUserSession();
        $this->checkFormUserData();
        $this->runView();
        if($this->login)
        {
            log_message('debug', "[".__METHOD__."] login = TRUE");
            $this->setUpSession();
            $this->Login_model->insertLog('Zalogowano się do aplikacji');
            redirect(base_url()."main");
        }    
    }
    private function checkFormUserData()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->form_validation->set_rules('username','Login','required');
        $this->form_validation->set_rules('password','Hasło','required');
        if($this->form_validation->run()!=FALSE)
        {
            log_message('debug', "[".__METHOD__."] form_validation->run()");
            $this->runCheckInAD(); 
            //$this->runCheckInDB();
          
            if ($this->login)
            {
                //$this->Login_model->getUserType()=='a' ? $this->runCheckInAD() : $this->checkUserFormPass();
            }
             // CHECK PERM
            if ($this->login)
            {
                $this->runCheckLoginPerm(); 
            }
        }
        else
        {
            log_message('debug', "[".__METHOD__."] form_validation->run() === FALSE");
            //$this->NaglowekDane['err']='[ERROR] Wprowadź dane logowania';
        }
    }
    private function checkUserSession()
    {
        log_message('debug', "[".__METHOD__."]");
        if($this->session->user!='' && $this->session->token!='')
        {
            //echo "sessio not empty";
            //echo "<pre>";
            //print_r($this->session);
            //echo "</pre>";
            //echo $this->session->user."<br/>";
            //die();
            redirect(base_url()."main");
        }
    }
    private function runCheckInDB()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->Login_model->checkUserInDb()<1 ? $this->NaglowekDane['err']='[ERROR] Błąd logowania' : $this->login=true;      
    }
    private function runCheckLoginPerm()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->userperm=$this->Login_model->getUserPerm($this->input->post('username'));
        // ADD LOG_INTO_APP BY DEFAULT FOR ALL AD USERS
        array_push($this->userperm,'LOG_INTO_APP');
        array_push($this->userperm,'LOG_INTO_EVENTS');
        in_array('LOG_INTO_APP',$this->userperm) ? $this->login=true : $this->setLoginErr('[LOG_INTO_APP] Brak uprawnienia');      
    }

    private function runCheckInAD()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->ldap->loginAd($this->input->post('username'),$this->input->post('password'));
        $err=$this->ldap->getError();
        //$this->$user_full_data['email']=$this->ldap->getUserAdData('mail',0);
        //$this->$user_full_data['email_login']=$this->ldap->getUserAdData('userPrincipalName',0);
        //$this->$user_full_data['nrewid']=$this->ldap->getUserAdData('physicalDeliveryOfficeName',0);
        //$this->$user_full_data['fullname']=$this->ldap->getUserAdData('displayName',0);
        //log_message('debug', "[".__METHOD__."][AD][EMAIL] ".$this->$user_full_data['email']);
        //log_message('debug', "[".__METHOD__."][AD][NREWID] ".$this->$user_full_data['nrewid']);
        $err!='' ? $this->setLoginErr($err)  : $this->login=true; 
    }
    private function checkUserFormPass()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->Login_model->checkUserPass() >0 ? $this->login=true : $this->setLoginErr('[ERROR] Błąd logowania'); 
    }
    private function checkUriSegments()
    {
        log_message('debug', "[".__METHOD__."]");
         log_message('debug', "[".__METHOD__."][1] ".$this->uri->segment(1));
          log_message('debug', "[".__METHOD__."][2] ".$this->uri->segment(2));
           log_message('debug', "[".__METHOD__."][3] ".$this->uri->segment(3));
           if( $this->uri->segment(2)==1)
           {
               $this->NaglowekDane['err']='Wylogowano';
               $this->NaglowekDane['err_bg']='gt-bg-color-green';
           }
    }
    private function setLoginErr($info)
    {
        $this->NaglowekDane['err']=$info;
        $this->login=false;
    }
    private function runView()
    {
        $this->load->view('login/vheader',$this->NaglowekDane);
        $this->load->view('login/vlogin',$this->NaglowekDane);
        $this->load->view('login/vfooter',$this->NaglowekDane);
    }
    private function setUpSession()
    {
        $this->session->set_userdata('user','tak');
        $this->session->set_userdata('token',uniqid());
        $this->session->set_userdata('userid',$this->Login_model->getUserId());
        $this->session->set_userdata('perm',$this->userperm);
        $this->session->set_userdata('login',$this->input->post('username'));
        $this->session->set_userdata('email',$this->ldap->getUserAdData('mail',0));
        $this->session->set_userdata('email_login',$this->ldap->getUserAdData('userPrincipalName',0));
        $this->session->set_userdata('fullname',$this->ldap->getUserAdData('displayName',0));
        $this->session->set_userdata('nrewid',$this->ldap->getUserAdData('physicalDeliveryOfficeName',0));
    }
}