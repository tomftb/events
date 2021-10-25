<?php
if(!defined('BASEPATH')){ exit('No direct script access allowed');}

class Logout extends CI_Controller
{
    public function index()
    {
         log_message('debug', "[".__METHOD__."]");
        $this->load->library('session');
        $this->load->helper('url');
        $this->clearSession();
        redirect("login/1");
    }
    private function clearSession()
    {
        log_message('debug', "[".__METHOD__."]");
        $this->session->set_userdata('user','');
        $this->session->set_userdata('__ci_last_regenerate','');
        $this->session->set_userdata('token','');
        $this->session->unset_userdata('user');
        echo "hkggkgk".$this->session->user."<br/>";
        $this->session->sess_destroy();
        echo "SESS DATA<pre>";
        print_r($this->session);
        echo "</pre>";
    }
}
