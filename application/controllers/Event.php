<?php
class Event extends CI_Controller{
    public function __construct(){
        parent::__construct();
        $this->load->library('session');
        $this->load->helper('url');
        $this->load->helper('form');
        $this->load->model('Event_model');
        $this->load->helper('string');
        $this->load->library('session');   
        $this->load->model('Event_model');
    }
    public function __destruct(){}

    private function returnJson($response){
        $output = $this->output->set_content_type('application/json');
        return ( $output->set_output(json_encode($response)));
    }
    public function eventSign(){
        if($this->session->login==''){ return self::userNotLoggedIn(); }
        log_message('debug', "[".__METHOD__."]");
        try{
            $this->Event_model->sign();
        }
        catch(Exception $e){
            self::returnJson(array('status'=>$e->getMessage())); 
        }
    }

    public function getAll(){
        if($this->session->login==''){ return self::userNotLoggedIn(); }
        log_message('debug', "[".__METHOD__."]");
        try{
            $this->Event_model->get();
        }
        catch(Exception $e){
            self::returnJson(array('status'=>$e->getMessage())); 
        }
    }
    private function checkErrorCode($code=-1,$message=''){
        log_message('debug', "[".__METHOD__."]\r\nCODE: ${code}\r\nMESSAGE: ${message}");
        if($code===-1){
            return array('status'=>$message);
        }
        return array('status'=>'Application error!');
    }
    public function getEvents(){
        if($this->session->login==''){ return self::userNotLoggedIn(); }
        /* ADD CHECK PERMISSION */
         try{
            self::returnJson($this->Event_model->getEvents()); 
        }
        catch(Exception $e){
            self::returnJson(array('ERROR'=>$e->getMessage())); 
        }
    }
    public function getEvent($idEvent=0){
        if($this->session->login==''){ return self::userNotLoggedIn(); }
        /* ADD CHECK PERMISSION */
        try{
            self::returnJson($this->Event_model->getEvent(intval($idEvent,10))); 
        }
        catch(Exception $e){
            self::returnJson(self::checkErrorCode($e->getCode(),$e->getMessage())); 
        }
    }
    public function getEventRecipient($idEvent=1){
        if($this->session->login==''){ return self::userNotLoggedIn(); }
        /* ADD CHECK PERMISSION */
        try{
            self::returnJson($this->Event_model->getEventRecipient($idEvent)); 
        }
        catch(Exception $e){
            self::returnJson(array('status'=>$e->getMessage())); 
        }
    }
    private function userNotLoggedIn(){
        return (self::returnJson(self::checkErrorCode(-1,'User not logged in!')));
    }
}
