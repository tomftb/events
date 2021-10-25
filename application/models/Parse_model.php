<?php

class Parse_model extends CI_Model
{
    private $errMessage='';
    public function __construct()
    {
        parent::__construct();     
    }
    public function checkIsEmpty($darray)
    {
        log_message('debug', "[".__METHOD__."]"); 
        $err=false;
        foreach ($darray as $key => $value)
        {
            log_message('debug', "${key} => ${value}"); 
            if(trim($darray[$key])=='')
            {
                $err=true;
                $this->errMessage = [
                        'success' => false,
                        'message' => "[$key] EMPTY VALUE"
                ];
                break;
            }
        }
        return $err;
    }
    public function setErrMessage($value)
    {
        $this->errMessage=$value;
    }
    public function getErrMessage()
    {
        return $this->errMessage;
    }
}
