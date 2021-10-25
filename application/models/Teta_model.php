<?php
class Teta_model extends CI_Model
{
    private $tetadb='';
    private $now='';
    private $unixDT='';
    private $eFullContent=array();
    public  $err='1';
    private $errMessage='';
    private $tetaDir='';
    
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('file');
        date_default_timezone_set("Europe/Warsaw"); 
        $this->tetadb=$this->load->database('tetate',TRUE);
        $this->now= date("Y-m-d H:i:s");   
        $this->unixDT=strtotime($this->now);
        // GET ATTACHMENT DIRECTORY
        $this->setTetaDir();
         if($this->checkTetaDir()!=1) {return $this->err;}
    }
    private function setTetaDir()
    {
        $rs=$this->db->query('SELECT `WARTOSC` FROM `parametry` WHERE `SKROT`="TETA_AT_DIR"');
        $val=$rs->row();
        $this->tetaDir=$val->WARTOSC;
        log_message('debug', "[".__METHOD__."] TETA DIR - ".$this->tetaDir);
    }
    private function checkTetaDir()
    {
        // CHECK DIRECTORY
        $dirPerm=substr(sprintf('%o', fileperms($this->tetaDir)), -4);
        $lastPerm=substr($dirPerm,strlen($dirPerm)-1,strlen($dirPerm));
        log_message('debug', "[".__METHOD__."] FILEPERMS -> ".$dirPerm); 
        log_message('debug', "[".__METHOD__."] FILEPERMS [GUEST] -> ".$lastPerm); 
        if($lastPerm!='7' && $lastPerm!='6')
        //if (is_dir($dir) && is_readable($dir))
        //if (is_writable($dir.'/test.txt'))
        {
            $this->err="The file ".$this->tetaDir." does not exist or is not readable or writable!";
            log_message('debug', "[".__METHOD__."] "); 
            return 0;
            //&& is_readable($dir.'//') && is_writable($dir.'//')
        }
        else
        {
            log_message('debug', "[".__METHOD__."] The file ".$this->tetaDir." exists and is readable and writable"); 
        }
        return 1;
    }
    public function insEmail($post)
    {
        if($this->session->login=='') { log_message('debug', "[".__METHOD__."] User not logged in");  return 'User not logged in!';}
        log_message('debug', "[".__METHOD__."]"); 
        log_message('debug', "[".__METHOD__."] DATE -> ".$this->now); 
        log_message('debug', "[".__METHOD__."] UNIX DATE -> ".$this->unixDT); 
        log_message('debug', "[".__METHOD__."] POST ID -> ".$post['id']);  
        $emlId=$this->db->escape_str($post['id']);
        $basedir=filter_input(INPUT_SERVER,'DOCUMENT_ROOT').'/attachments/';
        $fext='';
        //$emailSymbolFV=array();
        $emailSymbolFV='';
        $newfilename='';
        $emailResponseAddr='';
        //EMAIL CONTENT
        $query = $this->db->query("SELECT e.temat as temat,e.nadawca as nadawca,e.nadawca_nazwa as nadawca_nazwa,e.tresc as tresc, e.data_odb as data FROM emails e WHERE e.id=".$this->db->escape_str($post['id']).";");
        if(!$query) {return '';}
        $eContent = $query->result_array();
        log_message('debug', "[".__METHOD__."] EMAIL COUNT -> ".count($eContent)); 
        if (count($eContent)<1)
        {
            return 'Email doesn\'t exist!';
        }
        //GET SPECIFICTION
        $this->setEmailFullContent($post);
        $this->checkIsThereAttachments();
        log_message('debug', "[".__METHOD__."] ERR => ".$this->err); 
        log_message('debug', "[".__METHOD__."] ERR => ".strcmp($this->err, '1') !== 0); 
        if(strcmp($this->err, '1') != 0) {  log_message('debug', "[".__METHOD__."] ERR => NOT EQUAL");  return ($this->err);}
        
        // ATTACHMENTS
        $query = $this->db->query("SELECT e.id as idattach,e.name as name,e.local_name as lname FROM emails_attach e WHERE e.id_email=".$this->db->escape_str($post['id']).";");
        if(!$query) {return '';}
        $attach = $query->result_array();
        log_message('debug', "[".__METHOD__."] ATTACH COUNT -> ".count($attach)); 
        if (count($attach)<1)
        {
            return 'No attachment/s!';
        }
        if($post['MAIL_RECV']=='1')
        {
            if (!filter_var($post['MAIL_RECV_ADDR'], FILTER_VALIDATE_EMAIL))
            {
                return($post['MAIL_RECV_ADDR']." is not a valid email address");
            }
            $emailResponseAddr=$post['MAIL_RECV_ADDR'];
        }
        
        // CHECK THAT ATTACHMENTS EXISTS
        log_message('debug', "[eFullContent] CHECK ATTACHMENTS EXISTS"); 
        foreach($this->eFullContent as $k => $v)
        {
            foreach($v['attach'] as $id => $val)
            {
                log_message('debug', "[eFullContent][$id] $val"); 
                foreach($attach as $key => $value)
                {
                    if($value['idattach']==$id)
                    {
                        if(!file_exists($basedir.$value['lname']))
                        {
                            return '['.$value['lname'].']FILE '.$value['name'].' NOT EXIST!';
                        }
                    }
                }
            }
        } 
        // iterate on sended description attach
        foreach($this->eFullContent as $k => $v)
        {
            // GEN EMAILS
            log_message('debug', "[eFullContent] NUMBER => $k"); 
            // GET SYMBOL FV
            $emailSymbolFV.='- '.$v['symbol']."<br/>";
            //array_push($emailSymbolFV,'- '.$v['symbol']."<br/>");
            // EMAIL => TO FILE
            $emailFileName=$emlId.'_'.$this->unixDT.'_'.uniqid();
            $emailFile = fopen($this->tetaDir.'/'.$emailFileName.'.eml', "w") or  log_message('debug', "Unable to open file! ".$basedir.'new.eml');
            fwrite($emailFile, $this->getEmailContent($eContent[0]));
            fclose($emailFile);
            log_message('debug', "[eFullContent] EMAIL FILE NAME => $emailFileName"); 
            foreach($v['attach'] as $id => $val)
            {
                log_message('debug', "[eFullContent-attach] ID => ".$id); 
                foreach($attach as $key => $value)
                {
                    log_message('debug', "[DB-ATTACH] ${key} => ".$value['idattach']); 
                    if($value['idattach']==$id)
                    {
                        log_message('debug', "[DB-ATTACH][eFullContent-attach] EQUAL");
                        $fext=explode('.',$value['lname']);
                        $newfilename=$post['id'].'_'.$this->unixDT.'_'.uniqid().".".end($fext); // IF the same leave -> $value['lname']
                        $query = $this->tetadb->query("INSERT INTO \"TETA_2000\".\"DDI_WRD_DOK_IMP\" (\"MAIL_ID\",\"ZAL_ID\",\"PRAC_ID\",\"DOK_SYMBOL\",\"REJESTR\",\"DATA_DOST\",\"T_01\",\"T_02\",\"T_03\",\"T_04\",\"T_05\",\"N_01\") VALUES ('".$emailFileName."','".$newfilename."',".$this->tetadb->escape_str($v['pracownik_id']).",'".$this->tetadb->escape_str($v['symbol'])."','".$this->tetadb->escape_str($v['rejestr_id'])."', (SELECT TO_DATE('".$this->now."','yyyy/mm/dd HH24:MI:SS') AS \"DATE\" FROM DUAL),'".$value['idattach']."','".$value['name']."','".$this->session->login."','".$this->now."','".$this->input->server('REMOTE_ADDR')."','".$this->session->userid."')");
                        //,\"N_01\" ,'".$this->input->server('REMOTE_ADDR')."'
                        // remove from tab
                        
                        unset($this->eFullContent[$k]['attach'][$id]);
                        // COPY FILE
                        if($query!=1) {break;}
                        
                        //uniqid($post['id'])
                        if (!copy($basedir.$value['lname'], $this->tetaDir.'/'.$newfilename))
                        {
                            log_message('debug', "[".__METHOD__."] failed to copy ".$value['lname']."..."); 
                        }
                        else
                        {
                            log_message('debug', "[".__METHOD__."] COPY ".$value['lname']." => ${newfilename}");
                            log_message('debug', "[".__METHOD__."] [EXT-MIME] ".get_mime_by_extension($basedir.$value['lname']));
                            log_message('debug', "[".__METHOD__."] [EXT-DOT] ".end($fext));
                        }
                        break;
                    }
                }
            }
            //$query = $this->tetadb->query("INSERT INTO \"TETA_2000\".\"DDI_WRD_DOK_IMP\" (\"MAIL_ID\",\"ZAL_ID\",\"PRAC_ID\",\"DOK_SYMBOL\",\"REJESTR\",\"DATA_DOST\",\"T_01\",\"T_02\") VALUES (".$this->tetadb->escape_str($post['id']).",'".$value['lname']."',".$this->tetadb->escape_str($post['s-pracownik']).",'".$this->tetadb->escape_str($post['symbol-dokumentu'])."','".$this->tetadb->escape_str($post['s-rejestr'])."', (SELECT TO_DATE('".$this->now."','yyyy/mm/dd HH24:MI:SS') AS \"DATE\" FROM DUAL),'".$value['idattach']."','".$value['name']."')");
            //log_message('debug', "[".__METHOD__."] INSERT INTO TETA_2000.DDI_WRD_DOK_IMP STATUS -> ".$query); 
            
            // rollback ??
            // GET PRACOWNIK NAME
            $query = $this->tetadb->query("SELECT \"PRAC_NAZWA\" FROM \"TETA_2000\".\"DDI_WRD_IMP_PRAC\" WHERE \"PRAC_ID\"=".$this->tetadb->escape_str($v['pracownik_id']));
            $pracownik=$query->result_array();
            log_message('debug', "[".__METHOD__."] [TETA-PRAC-NAME] ".$pracownik[0]['PRAC_NAZWA']);
            // GET FULL REJESTR NAME
            $query = $this->tetadb->query("SELECT \"NAZWA\" FROM \"TETA_2000\".\"DDI_WRD_IMP_REJE\" WHERE \"SYMBOL\"='".$this->tetadb->escape_str($v['rejestr_id'])."'");
            $rejestr_nazwa=$query->result_array();
            log_message('debug', "[".__METHOD__."] [TETA-PRAC-NAME] ".$rejestr_nazwa[0]['NAZWA']);
            // INSERT TO emails_ext_id
            $query = $this->db->query('INSERT INTO emails_ext_teta (id_email,ext_teta_id,prac_id,pracownik,dok_symbol,rejestr,data,user_id,user_name,host) VALUES ('.$this->db->escape_str($post['id']).',"'.$emailFileName.'",'.$this->db->escape_str($v['pracownik_id']).',"'.$pracownik[0]['PRAC_NAZWA'].'","'.$this->db->escape_str($v['symbol']).'","['.$this->db->escape_str($v['rejestr_id']).'] '.$rejestr_nazwa[0]['NAZWA'].'","'.$this->now.'",'.$this->session->userid.',"'.$this->session->login.'","'.$this->input->server('REMOTE_ADDR').'");');
            if($query!=1) {break;}
            
        }
        //log_message('debug', "[".__METHOD__."] [EMAIL-SYMBOL] COUNT : ".count($emailSymbolFV));
        /*
        foreach($emailSymbolFV as $ke => $ve)
        {
            log_message('debug', "[".__METHOD__."] [EMAIL-SYMBOL] $ke => $ve ");
        }
         *
         */
        //$query = $this->tetadb->query("INSERT INTO \"TETA_2000\".\"DDI_WRD_DOK_IMP\" (\"MAIL_ID\",\"ZAL_ID\",\"PRAC_ID\",\"DOK_SYMBOL\",\"REJESTR\",\"DATA_DOST\") VALUES (".$this->tetadb->escape_str($post['id']).",".$this->tetadb->escape_str($post['id']).",".$this->tetadb->escape_str($post['s-pracownik']).",'".$this->tetadb->escape_str($post['symbol-dokumentu'])."','".$this->tetadb->escape_str($post['s-rejestr'])."', (SELECT TO_DATE('".$this->now."','yyyy/mm/dd HH24:MI:SS') AS \"DATE\" FROM DUAL))");
        //$query = $this->tetadb->query("INSERT INTO \"TETA_2000\".\"DDI_WRD_DOK_IMP\" (\"MAIL_ID\",\"ZAL_ID\",\"PRAC_ID\",\"DOK_SYMBOL\",\"REJESTR\",\"DATA_DOST\") VALUES (".$post['id'].",".$post['id'].",".$post['s-pracownik'].",'".$post['wiadomosc']."','".$post['s-rejestr']."','".$this->now."')");
        
        
        if($post['MAIL_RECV']=='1')
        {
            // SEND notification to 
            $this->load->model('Email_model');
            $emailData=array(
                    'email_type-0'=>'to',
                    's-address-0'=>$post['MAIL_RECV_ADDR'],
                    's-address_id-0'=>$post['MAIL_RECV_ADDR'],
                    'temat'=>'Potwierdzenie otrzymania faktur',
                    'wiadomosc'=>'<b>Dzień dobry</b>,<br/><br/>Geofizyka Toruń S.A. potwierdza otrzymanie faktur przesłanych drogą elektroniczną o numerach:<br/><br/>'.$emailSymbolFV.'<br/>--<br/>Dziękujemy za przesłane dokumenty.<br/>',
            );
            
            $sendStatus=$this->Email_model->sendEmail($emailData,'teta');
            log_message('debug', "[".__METHOD__."] ".$sendStatus);
            $query = $this->db->query("INSERT INTO `emails_teta_response_addr` (`id_email`,`addr`,`send_err`)VALUES(".$this->db->escape_str($post['id']).",\"".$this->db->escape_str($post['MAIL_RECV_ADDR'])."\",\"".$this->db->escape_str(htmlentities($sendStatus,ENT_QUOTES))."\");"); //MAIL_RECV_ADDR 
        }  
        return ($this->err);
        //return $query;
    }
    private function getEmailContent($content)
    {
        log_message('debug', "[".__METHOD__."]"); 
        log_message('debug', "[".__METHOD__."] TEMAT - ".$content['temat']);
        //log_message('debug', "[".__METHOD__."] TRESC - ".$content['tresc']);
        log_message('debug', "[".__METHOD__."] UNIX DATA ODB - ".$content['data']);
        //$content['temat'];
        //$content['nadawca'];
        //$this->plaintextMessage .= trim(htmlentities($messageBody));
        //$this->plaintextMessage = nl2br($this->plaintextMessage);
        //$content['tresc']= strip_tags($content['tresc']);
        //$content['tresc']=$this->rip_tags($content['tresc']);  
        //$content['tresc']=trim(htmlentities($content['tresc']));
        $content['temat']=html_entity_decode(base64_encode($content['temat']),ENT_QUOTES);
        $content['tresc']= html_entity_decode(trim($content['tresc']),ENT_QUOTES);
        $content['tresc']="\r\n".$content['tresc'];
        $content['data']=date("D,  j M Y H:i:s",$content['data']);
        log_message('debug', "[".__METHOD__."] DATA ODB - ".$content['data']);
        //PHP_EOL
        $eml='Return-Path: <'.$content['nadawca'].'>
X-Original-To: faktury@geofizyka.pl
Delivered-To: faktury@geofizyka.pl
Received: from localhost (mail [127.0.0.1])
	by mail.geofizyka.pl (Postfix) with ESMTP id E2B184059F9
	for <faktury@geofizyka.pl>; '.$content['data'].' +0200 (CEST)
X-Virus-Scanned: GT AV check at geofizyka.pl
X-Spam-Flag: NO
X-Spam-Score: -11
X-Spam-Level:
X-Spam-Status:
Received: from mail.geofizyka.pl ([127.0.0.1])
	by localhost (mail.geofizyka.pl [127.0.0.1]) (amavisd-new, port 10024)
	with ESMTP id dfGcKSopb71a for <faktury@geofizyka.pl>;
	'.$content['data'].' +0200 (CEST)
Received: from localhost ([127.0.0.1])
	(Authenticated sender: hidden)
	by mail.geofizyka.pl (Postfix) with ESMTPSA id ABFC44059E4
	for <faktury@geofizyka.pl>; '.$content['data'].' +0200 (CEST)
DKIM-Signature:
To: faktury@geofizyka.pl
From: '.$content['nadawca_nazwa'].' <'.$content['nadawca'].'>
Subject: =?UTF-8?B?'.$content['temat'].'?=
Message-ID: database ID
Date: NOW() OR ORIGINAL
User-Agent: KancelariaGT
MIME-Version: 1.0
Content-Type: text/html; charset=utf-8; format=flowed
Content-Transfer-Encoding: 8bit
Content-Language: pl
'.$content['tresc'].'
';
        return $eml;
    }
    
     function rip_tags($string) { 
    
    // ----- remove HTML TAGs ----- 
    $string = preg_replace ('/<[^>]*>/', ' ', $string); 
    
    // ----- remove control characters ----- 
    //$string = str_replace("\r", '', $string);    // --- replace with empty space
    //$string = str_replace("\n", ' ', $string);   // --- replace with space
    //$string = str_replace("\t", ' ', $string);   // --- replace with space
    
    // ----- remove multiple spaces ----- 
    $string = trim(preg_replace('/ {2,}/', ' ', $string));
    
    return $string; 

    }
    private function setEmailFullContent($email)
    {
        log_message('debug', "[".__METHOD__."] START");
        // counter
        $i=0;
        foreach($email as $k => $v)
        {
            log_message('debug', "[".__METHOD__."] ${k} => ${v}"); 
            // check what it is
            log_message('debug', "[".__METHOD__."] ${tmp[0]}");
            //$this->parseEmailFields($k,$v,$i);
            $this->parseEmailFields($k,$v);
        }
        
        // check email full content
        $this->checkEContent($this->eFullContent);
    }
    //private function parseEmailFields($key,$value,$i)
    private function parseEmailFields($key,$value)
    {
        log_message('debug', "[".__METHOD__."] KEY => ".$key);
        log_message('debug', "[".__METHOD__."] VALUE => ".$value);
        $tmp=explode('-',$key);
        switch($tmp[0])
            {
                case 'id':
                        log_message('debug', "[".__METHOD__."] TYPE => id");
                       
                        break;
                case 'symbol':
                        log_message('debug', "[".__METHOD__."] TYPE => symbol [".$tmp[2]."][".$tmp[0]."]");
                        $this->eFullContent[$tmp[2]][$tmp[0]]=$value;
                        break;
                case 's':
                        log_message('debug', "[".__METHOD__."] TYPE => s -> rekurencja");
                        // rekurencja
                        $this->parseEmailFields($tmp[1].'-'.$tmp[2],$value);
                    break;
                case 'attach':
                        log_message('debug', "[".__METHOD__."] TYPE => attach [".$tmp[1]."][".$tmp[0]."][".$tmp[2]."]");
                        if($value) {$this->eFullContent[$tmp[1]][$tmp[0]][$tmp[2]]=$value;}
                    break;
                case 'pracownik_id':
                        log_message('debug', "[".__METHOD__."] TYPE => pracownik id [".$tmp[1]."][".$tmp[0]."]");
                        $this->eFullContent[$tmp[1]][$tmp[0]]=$value;
                        break;
                case 'rejestr_id': // LAST ELEMNT
                        log_message('debug', "[".__METHOD__."] TYPE => rejestr id [".$tmp[1]."][".$tmp[0]."]");
                        $this->eFullContent[$tmp[1]][$tmp[0]]=$value;
                        break;
                case 'pracownik':
                        log_message('debug', "[".__METHOD__."] TYPE => pracownik");
                        break;
                 case 'rejestr':
                        log_message('debug', "[".__METHOD__."] TYPE => rejestr");
                        break;
                default:
                    //wrong type!
                    break;
            }
    }
    private function checkEContent($val)
    {
        foreach($val as $k => $v)
        { 
            is_array($v) ?  $this->checkEContent($v) : log_message('debug', "[".__METHOD__."] TEST => $k => $v");
        }
    }
    private function checkIsThereAttachments()
    {
        $test=false;
        $err='';
        foreach($this->eFullContent as $k => $v)
        {
            $test=array_key_exists("attach",$v);
            log_message('debug', "[".__METHOD__."] ID ${k} => ATTACH EXISTS => ".$test."");
            if($test!=1)
            {
                $err.="<br/>[DESCRIPTION][".$k."] No attachment checked!";
                log_message('debug', "[DESCRIPTION][".__METHOD__."] [${k}] No attachment checked!");
            }
        }
        if($err!='')
        {
            $this->err=$err;    
        }
    }
}