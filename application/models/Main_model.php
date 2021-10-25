<?php
class Main_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
        $this->load->library('session');
    }
    public function getUserData($id)
    {
        log_message('debug', "[".__METHOD__."]");
        $result = $this->db->query('
                SELECT
                login,email
                FROM
                uzytkownik
                WHERE
                id="'.$id.'"
                ');
        return $result->result_array();
    }
    public function getEmailsCategory()
    {
        log_message('debug', "[".__METHOD__."]");
        $result = $this->db->query("
                SELECT
                `ID`,`ID_CAT`,`SHORTCUT`,`NAME`,`ICO`
                FROM
                `emails_cat`
                WHERE
                `SHORTCUT` IN ('EML_ANSWER','EML_SEND','EML_BIN','EML_TETA') OR
                `WSK_U`='0'
                ORDER BY `ID_CAT`, `ID`
                ");
        return $result->result_array();
    }
    public function setUserAcl()
    {
        $acl=array();
        foreach($this->session->perm as $value)
        {
            $acl[$value]=1;
        }
        return $acl;
    }
    public function getTimeInterval()
    {
        log_message('debug', "[".__METHOD__."]");
        $result = $this->db->query('
                SELECT
                SKROT,WARTOSC
                FROM
                parametry
                WHERE
                SKROT="EMAIL_D_T_INTVAL"
                ');
        return $result->row();
    }
    public function getParameterByShortcut($shortcut)
    {
        log_message('debug', "[".__METHOD__."]");
        $result = $this->db->query('
                SELECT
                WARTOSC
                FROM
                parametry
                WHERE
                SKROT=UPPER("'.$shortcut.'")
                ');
        return $result->row();
    }
    public function getEmailFooter()
    {
        $f=$this->db->query("SELECT `WARTOSC` AS 'email_footer' FROM `parametry` WHERE `SKROT`='MAIL_FOOTER'")->row();
        return(html_entity_decode($f->email_footer));
    }
}