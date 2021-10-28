<?php
class Main extends CI_Controller
{
    private $uid='';
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('url');
        $this->load->library('session');
        $this->load->model('Main_model');
        $this->uid=uniqid();
    }
    private $NaglowekDane=array(
        'app_name'=>'GT-Events',
        'tytul'=>'Wydarzenia',
        'url'=>'',
        'link'=>'',
        'js'=>'',
        'email_footer'
    );
    private $appFunc=array(
        'showUsers'=>'Użytkownicy',
        'showPerms'=>'Uprawnienia',
        'showRole'=>'Role',
        'showParms'=>'Parametry'
    );
    private $userData=array();
    public function index()
    {
        $this->checkSession();
        $this->userData=$this->Main_model->getUserData($this->session->userid);
        $this->setDefNgDane();
        $this->NaglowekDane['js']=base_url()."js/main.js?".$this->uid;
        $this->NaglowekDane['emails_cat']=$this->Main_model->getEmailsCategory();
        $this->NaglowekDane['EMAIL_D_T_INTVAL']=$this->Main_model->getTimeInterval();
        $this->NaglowekDane['MAIL_RECV']=$this->Main_model->getParameterByShortcut('MAIL_RECV');
        $this->NaglowekDane['email_footer']=$this->Main_model->getEmailFooter();
        $this->runView();
        //print_r($this->NaglowekDane);
    }
    protected function runView()
    {
        $this->load->view('templates/vHeader',$this->NaglowekDane);
        in_array('LOG_INTO_EVENTS',$this->session->perm) ? $this->load->view('vMain',$this->NaglowekDane) :  $this->runNoPermView('[LOG_INTO_EVENTS] Brak uprawnienia');
        //$this->load->view('main',$this->NaglowekDane);
        $this->load->view('templates/vFooter',$this->NaglowekDane);
    }
    protected function checkSession()
    {
        /*
         * 
         
        echo "<pre>";
        print_r($this->session);
        print_r($this->session->get_userdata());
        echo "</pre>";
        echo "User ID:".$this->session->userid;
        echo "User:".$this->session->user;
        die();
         */
        $this->session->user=='tak' ? '' : redirect();
    }
    
    public function showUsers()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->checkSession();
        $this->userData=$this->Main_model->getUserData($this->session->userid);
        $this->setDefNgDane();
        $this->NaglowekDane['js']=base_url()."js/users.js";
        $this->NaglowekDane['tytul']="Użytkownicy";
        $this->load->view('templates/vHeader',$this->NaglowekDane);
        //$this->load->view('vUsers',$this->NaglowekDane);
        in_array('LOG_INTO_UZYT',$this->session->perm) ? $this->load->view('vUsers',$this->NaglowekDane) :  $this->runNoPermView('[LOG_INTO_UZYT] Brak uprawnienia');
        $this->load->view('templates/vFooter',$this->NaglowekDane);
    }
    public function showPerms()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->checkSession();
        $this->userData=$this->Main_model->getUserData($this->session->userid);
        $this->setDefNgDane();
        $this->NaglowekDane['js']=base_url()."js/perms.js";
        $this->NaglowekDane['tytul']="Uprawnienia";
        $this->load->view('templates/vHeader',$this->NaglowekDane);
        //$this->load->view('vPerms',$this->NaglowekDane);
        in_array('LOG_INTO_UPR',$this->session->perm) ? $this->load->view('vPerms',$this->NaglowekDane) :  $this->runNoPermView('[LOG_INTO_UPR] Brak uprawnienia');
        $this->load->view('templates/vFooter',$this->NaglowekDane);
    }
    public function showRole()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->checkSession();
        $this->userData=$this->Main_model->getUserData($this->session->userid);
        $this->setDefNgDane();
        $this->NaglowekDane['js']=base_url()."js/role.js";
        $this->NaglowekDane['tytul']="Role";
        $this->load->view('templates/vHeader',$this->NaglowekDane);
        in_array('LOG_INTO_ROLE',$this->session->perm) ? $this->load->view('vRole',$this->NaglowekDane) :  $this->runNoPermView('[LOG_INTO_ROLE] Brak uprawnienia'); 
        $this->load->view('templates/vFooter',$this->NaglowekDane);
    }
    public function showParms()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->checkSession();
        $this->userData=$this->Main_model->getUserData($this->session->userid);
        $this->setDefNgDane();
        $this->NaglowekDane['js']=base_url()."js/parms.js";
        $this->NaglowekDane['tytul']="Parametry";
        $this->NaglowekDane['colList']=array
                (
                array('ID','ID',20),
                array('Skrot','Skrót',40),
                array('Nazwa','Nazwa',100),
                array('Opis','Opis',200),
                array('Wartosc','Wartość',100),
            );
        $this->NaglowekDane['colListLegth']=count( $this->NaglowekDane['colList']);
        //$fieldListLegth=count($fieldList);
        $this->load->view('templates/vHeader',$this->NaglowekDane);
        in_array('LOG_INTO_PARM',$this->session->perm) ? $this->load->view('vParms',$this->NaglowekDane) :  $this->runNoPermView('[LOG_INTO_PARM] Brak uprawnienia'); 
        $this->load->view('templates/vFooter',$this->NaglowekDane);
    }
    public function showAdmin()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->checkSession();
        $this->userData=$this->Main_model->getUserData($this->session->userid);
        $this->setDefNgDane();
        $this->NaglowekDane['f']=$this->appFunc;
        $this->NaglowekDane['tytul']="Administrator";
        $this->load->view('templates/vHeader',$this->NaglowekDane);
        $this->load->view('vAdmin',$this->NaglowekDane);
        $this->load->view('templates/vFooter',$this->NaglowekDane);
    }
    private function setDefNgDane()
    {
        $this->NaglowekDane['userlogin']=$this->userData[0]['login'];
        $this->NaglowekDane['useremail']=$this->userData[0]['email'];
        $this->NaglowekDane['url']=base_url();
        $this->NaglowekDane['link']=base_url().$this->uri->segment(1);
        //$this->NaglowekDane['acl']=$this->Main_model->setUserAcl();
        $this->NaglowekDane['acl']=$this->session->perm;
        $this->NaglowekDane['js_setuserpermission']=base_url()."js/setUserPermission.js";
        $this->NaglowekDane['js_createhtmlelement']=base_url()."js/createHtmlElement.js";
        $this->NaglowekDane['js_datatablesextend']=base_url()."js/datatablesExtend.js";
        $this->NaglowekDane['js_parse']=base_url()."js/parseFieldValue.js";
        $this->NaglowekDane['js_ajax']=base_url()."js/ajax.js";   
    }
    private function runNoPermView($err)
    {
        $this->NaglowekDane['err']=$err;
        return ($this->load->view('vNoPerm',$this->NaglowekDane));
    }
}
