<?php

class Parm_model extends CI_Model
{
    private $errMessage='';
    protected $id='';
    protected $parm='';
    protected $post='';
    public function __construct()
    {
        parent::__construct();     
    }
    public function setData()
    {
        log_message('debug','[POST] => '.$this->input->post('data'));
        $post=explode("&",$this->input->post('data'),2);
        log_message('debug','[POST[0]] => '.$post[0]);
        $this->id=$this->getDataParm($post[0],2);
        log_message('debug','[ID] => '.$this->id[1]);
        log_message('debug','[POST[1]] => '.$post[1]);
        $this->parm=$this->getDataParm($post[1],2);
        log_message('debug','[PARM] => '.$this->parm[1]);
    }
    public function getDataParm($value,$limit)
    {
        $tmp=explode("=",$value,$limit);
        return ($tmp);
    }
    public function updateParm($post)
    {
        $querySucces=1;
        $this->post=$post;
        $this->setData();
        $wartosc=$this->db->query('SELECT Wartosc FROM `v_parm` WHERE ID="'.$this->db->escape_str($this->id[1]).'"')->row();
        log_message('debug','[DB] Wartosc => '.$wartosc->Wartosc);
        $this->parm[1]=htmlentities(trim($this->parm[1]),ENT_QUOTES);
        log_message('debug','[POST] Wartosc => '.$this->parm[1]);
        if(trim($wartosc->Wartosc)!=$this->parm[1])
        {
            log_message('debug', "[".__METHOD__."] UPDATE - DATA: ".$wartosc->Wartosc." => ".$this->parm[1]);
            $querySucces=$this->db->query('UPDATE parametry SET WARTOSC="'.$this->db->escape_str($this->parm[1]).'" WHERE ID="'.$this->db->escape_str($this->id[1]).'"');
        }
        else
        {
            log_message('debug', "[".__METHOD__."] NO UPDATE - THE SAME DATA");
        }
        return ($querySucces);
    }
   
}