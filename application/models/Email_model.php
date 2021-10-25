<?php
class Email_model extends CI_Model
{
    protected $cliAddresses=array();
    protected $emailData='';
    protected $cliAddressesExists=false;
    private $errMessage='';
    private $now='';
    private $config=array(
            'protocol' => 'smtp',
            'smtp_host' => '',
            'smtp_port' => 0,
            'smtp_user' => '',
            'smtp_pass' => '',
            'useragent' => 'EventsGT',
            'mailtype'  => 'html', // html text/plain
            'charset'   => '',
            'smtp_timeout'=>0
        );
    private $footer='';
    public function __construct()
    {
        parent::__construct();
        date_default_timezone_set("Europe/Warsaw"); 
        $this->setEmailParm();
        $this->load->library('email', $this->config);
        $this->load->library('emailrcv');
        $this->load->helper('url');
        $this->load->library('session');
        $this->now= date("Y-m-d H:i:s");  
        // GET EMAIL FOOTER
        $f=$this->db->query("SELECT `WARTOSC` AS 'email_footer' FROM `events`.`parametry` WHERE `SKROT`='MAIL_FOOTER'")->row();
        $this->footer = html_entity_decode($f->email_footer);
        //log_message('debug', "[".__METHOD__."] EMAIL FOOTER: ".$this->footer);
    }
    private function setEmailParm()
    {
        $tmp=array();
        $result=$this->db->query('SELECT Skrot,Wartosc FROM `events`.`parametry` WHERE Skrot LIKE "MAIL_%"');
        //$wartosc=$result->result_array();
        foreach($result->result_array() as $key => $value)
        {
            //log_message('debug', "[".__METHOD__."] ${key} - ");
            log_message('debug', "[".__METHOD__."] ${key} - ".$value['Skrot']." ".$value['Wartosc']);   
            $tmp[$value['Skrot']]=$value['Wartosc'];
        }
        $this->config['protocol']=$tmp['MAIL_PROTOCOL'];
        $this->config['smtp_host']=$tmp['MAIL_SRV'];
        $this->config['smtp_port']=$tmp['MAIL_PORT_OUT'];
        $this->config['smtp_user']=$tmp['MAIL_USER'];
        $this->config['smtp_pass']=$tmp['MAIL_PASS'];
        $this->config['charset']=$tmp['MAIL_CHARSET'];
        $this->config['smtp_timeout']=$tmp['MAIL_TIMEOUT'];
    }
    public function sendEmail($data,$task='')
    {
        if($this->session->login=='') { log_message('debug', "[".__METHOD__."] User not logged in");  return 'User not logged in!';}
        log_message('debug', "[".__METHOD__."]");
        $this->emailData=$data;
        //,'0-address-'=>$this->session->email));
        foreach($this->emailData as $key => $value)
        {
            log_message('debug', "[".__METHOD__."][email_data] $key => $value");
            if(is_array($value))
            {
                foreach($value as $key2 => $value2)
                {
                    log_message('debug', "[".__METHOD__."][email_data][lvl2] $key2 => $value2");
                }
            }
        }
        $err='';
        // GET EMAIL USER
        $e_user = $this->db->query("SELECT `WARTOSC` AS 'email_user' FROM `events`.`parametry` WHERE `SKROT`='MAIL_USER'")->row();
        log_message('debug', "[".__METHOD__."] EMAIL USER: ".$e_user->email_user);
        // GET EMAIL USER ALIAS
        $e_user_alias = $this->db->query("SELECT `WARTOSC` AS 'e_user_alias' FROM `events`.`parametry` WHERE `SKROT`='MAIL_USER_ALIAS'")->row();
        log_message('debug', "[".__METHOD__."] EMAIL USER ALIAS: ".$e_user_alias->e_user_alias);
        $this->email->from($e_user->email_user.'@geofizyka.pl',$e_user_alias->e_user_alias);
        $this->setAddresses();
        $this->setAddressName();
        log_message('debug', "[".__METHOD__."][0] ADDRESS TYPE => ".$this->cliAddresses[0][0]);
        log_message('debug', "[".__METHOD__."][0] ADDRES => ".$this->cliAddresses[0][1]);
        if($this->cliAddressesExists && trim($this->emailData['temat'])==='')
        {
            log_message('debug', "[".__METHOD__."] Nie uzupełniono odbiorcy, tematu lub treści.");
            return 'Nie uzupełniono odbiorcy, tematu lub treści.';
        }
        // PARSE TASK
        $prvMessage=$this->checkEmailTask($task);
        foreach($this->cliAddresses as $addr)
        {
            log_message('debug', "[".__METHOD__."] ".$addr[0]." - ".$addr[1]);
            switch($addr[0])
            {
                case 'to':
                    $this->email->to($addr[1]);
                    break;
                case 'cc': // DW: (CC:) - Do Wiadomości (Carbon Copy)
                    $this->email->cc($addr[1]);
                    break;
                case 'bcc': // UDW: (BCC:) - Ukryte Do Wiadomości (Blind Carbon Copy)
                    $this->email->bcc($addr[1]);
                    break;
                default:
                    break;
            }
        }
        $this->email->subject($this->emailData['temat']);
        $this->email->message($this->emailData['wiadomosc'].$prvMessage.$this->footer);
        $this->email->send(FALSE);
        //$err=$this->email->print_debugger();
        $err=$this->parseSendEmailErr($this->email->print_debugger(array('headers')));
        $this->insSendedEmails($row->email_user.'@geofizyka.pl',$prvMessage,$err);
        //log_message('debug', "[".__METHOD__."]".$err); 
        return $err;
    }
    protected function parseSendEmailErr($sendErrHeaders)
    {
        $patterns = array('/\<\/pre\>/','/\<br \/\>/');
        $replacements = array('','');
        $sendErrHeaders= preg_replace($patterns,$replacements,$sendErrHeaders);
        $err_array=explode('<pre>',$sendErrHeaders);
        $err_array=array_map('trim',$err_array);
        foreach( $err_array as $key => $value)
        {
             log_message('debug', "[".__METHOD__."] $key => $value");
        }
        return(strcmp($err_array[3],'to: 250 2.1.5 Ok')? htmlentities($err_array[3] ,ENT_QUOTES): '');
        //return(array_key_exists('3',$err_array) ? htmlentities($err_array[3] ,ENT_QUOTES): '');
    }
    protected function insSendedEmails($emailUser,$prvMessage,$err)
    {
        $dateUnix=strtotime($this->now);
        $this->emailData['temat']=htmlspecialchars($this->emailData['temat'],ENT_QUOTES);
        $this->emailData['wiadomosc']=htmlspecialchars($this->emailData['wiadomosc'].$prvMessage.$this->footer,ENT_QUOTES);
        $this->db->query('INSERT INTO emails 
                            (id_cat,temat,nadawca,nadawca_nazwa,odbiorca,odbiorca_nazwa,odbiorca_typ,tresc,data_odb,wsk_r,date,user_id,user_name,host,send_err) 
                            VALUES
                            ("2","'.$this->db->escape_str($this->emailData['temat']).'","'.$emailUser.'","Kancelaria GT","'.$this->db->escape_str($this->cliAddresses[0][1]).'","'.$this->db->escape_str($this->cliAddresses[0][2]).'","'.$this->db->escape_str(htmlentities($this->cliAddresses[0][0],ENT_QUOTES)).'","'.$this->db->escape_str($this->emailData['wiadomosc']).'","'.$dateUnix.'","y","'.$this->now.'",'.$this->session->userid.',"'.$this->session->login.'","'.$this->input->server('REMOTE_ADDR').'","'.$this->db->escape_str(htmlentities($err,ENT_QUOTES)).'")'); 
        // get last inserted id
        $lastId=$this->db->insert_id(); 
        foreach($this->cliAddresses as $addr)
        {
            $this->db->query('INSERT INTO emails_recipient 
                            (id_email,recipient,recipient_name,type,send_err) 
                            VALUES
                            ('.$lastId.',"'.$this->db->escape_str(htmlentities($addr[1],ENT_QUOTES)).'","'.$this->db->escape_str(htmlentities($addr[2])).'","'.$this->db->escape_str($addr[0]).'","'.$this->db->escape_str(htmlentities($err,ENT_QUOTES)).'")'); 
        
        }
    }
    protected function setAddresses()
    {
        // NUMBER OF ADDRESS
        $j=0;
        $tmp=array();
        $idAddr=null;
        $idName=null;
        // LIKE IN SENDED POST INPUT
        $found=array('mail_type'=>false,'address_id'=>false,'-address-'=>false);
        foreach($this->emailData as $id => $value)
        {
            log_message('debug', "[".__METHOD__."] INPUT => ".$id.", VALUE =>".$value);
            
            if(strpos($id,'mail_type') && $found['mail_type']==false)
            {
                log_message('debug', "[".__METHOD__."] FOUND mail_type");
                $tmp=explode('-',$id);
                $this->cliAddresses[$j][0]=$value;
                $found['mail_type']=true;
                UNSET($this->emailData[$id]);
            }
            // CHECK AND ASSIGN ADDRES ID (EMAIL ADDRESS)
            $idAddr=$this->findValueInLoop(end($tmp),$found,'address_id',$j,1);
            if($idAddr!=null) { log_message('debug', "[".__METHOD__."][$idAddr] ID TO UNSET ".$this->emailData[$idAddr]); UNSET($this->emailData[$idAddr]);}
            // CHECK AND ASSIGN ADDRES
            $idName=$this->findValueInLoop(end($tmp),$found,'-address-',$j,2);
            if($idName!=null) { log_message('debug', "[".__METHOD__."][$idName] ID TO UNSET ".$this->emailData[$idName]); UNSET($this->emailData[$idName]); }
            $this->sedDefAddressFound($found,$j);
        }
    }
    private function findValueInLoop($end,&$found,$type,&$j,$col)
    {
        log_message('debug', "[".__METHOD__."] END - ${end} TYPE - ${type} J - ${j} COL - ${col}");
        $tmp2='';
        foreach($this->emailData as $id2 => $value2)
        {
            //log_message('debug', "[".__METHOD__."] FOREACH $id2 $value2");
            $tmp2=explode('-',$id2);
            if($this->checkValue($id2,$tmp2,$value2,$end,$found,$type,$j,$col))
            {
                //log_message('debug', "[".__METHOD__."] RETURN - ".$id2);
                return ($id2); 
                //log_message('debug', "[".__METHOD__."] AFTER RETURN - ".$id2);
            }
        }
        return null;
    }
    private function checkValue($id2,$tmp2,$value2,$end,&$found,$type,&$j,$col)
    {
        if(strpos($id2,$type) && $end===end($tmp2) && $found['mail_type']==true)
        {
            log_message('debug', "[".__METHOD__."][J=${j}][END=${end}][END2=".end($tmp2)."] FOUND ".$type." VALUE ".$value2." ID2 ".$id2);
            $this->cliAddresses[$j][$col]=urldecode($value2);
            $found[$type]=true;
            return true;
        }
        return false;
    }
    private function setAddressName()
    {
        $tmp=array();
        
        foreach($this->cliAddresses as $id => $value)
        {
            // explode by space
            $tmp=explode(' <',$value[2]);
            // if index 1 exist get name
            if(array_key_exists(1,$tmp))
            {
                //$this->cliAddresses[$id][2]='empty';
                
                $this->cliAddresses[$id][2]=preg_replace('/\>/','',$tmp[1]);
                //log_message('debug', "[".__METHOD__."] ".$this->cliAddresses[$id][2]);
            }
            else
            {
                $tmp=explode('@',$value[2]);
                $this->cliAddresses[$id][2]=ucwords(preg_replace('/\./',' ',$tmp[0]));
            }
        }
    }
    protected function sedDefAddressFound(&$found,&$j)
    {
        if($found['mail_type'] && $found['address_id'] && $found['-address-'])
        {
            $j++; 
            log_message('debug', "[".__METHOD__."] SET DEFAULT, INCREASE J = ${j}");
            $found['mail_type']=false;
            $found['address_id']=false;
            $found['-address-']=false;
            $this->cliAddressesExists=true;
        }
    }
    private function checkEmailTask($task='')
    {
        log_message('debug', "[".__METHOD__."] TASK - ${task}");
        $data='';
        $sep="<p style=\"color:#9900cc; font-weight:bold;\">----</p>";
        if($task==='cEventEmail')
        {
            $data=$sep.$data;
        }
        else if($this->emailData['id']!=='' && $this->emailData['id']!=='null' && $task!=='teta')
        {   
            $result=$this->db->query('SELECT `tresc` FROM `emails` WHERE id="'.$this->db->escape_str(trim($this->emailData['id'])).'"');
            $prvData=$result->row();
            $prvData->tresc=html_entity_decode($prvData->tresc,ENT_QUOTES);
            $data=$sep.$prvData->tresc.$sep;
        }
        else if($task==='teta')
        {
            // NOTHING TO DO
        }
        else
        {
            // ADD TO FOOTER
            $data.='<br/>--<br/>';   
        }
        return $data;
    }
    public function downloadEmails()
    {
        if($this->session->login=='') { log_message('debug', "[".__METHOD__."] User not logged in");  return 'User not logged in!';}
        $emailUser= $this->db->query("SELECT `WARTOSC` AS 'data' FROM `parametry` WHERE `SKROT`='MAIL_USER'")->row()->data;
        $emailPass=$this->db->query("SELECT `WARTOSC` AS 'data' FROM `parametry` WHERE `SKROT`='MAIL_PASS'")->row()->data;
        $con_result = $this->emailrcv->connect('{mail.geofizyka.pl:993/imap/ssl}INBOX', $emailUser, $emailPass);
        if ($con_result !== true)
        {
           // log_message('debug', "[".__METHOD__."] CONNECTION ERROR - ${con_result} ");
            //exit;
        }
        else
        {
            
        }
        log_message('debug', "[".__METHOD__."] CONNECTION RESULT - ${con_result} ");
        $query = $this->db->query("SELECT `WARTOSC` AS 'data' FROM `parametry` WHERE `SKROT`='EMAIL_SYNCH'")->row();
        $unixDate=strtotime($query->data);
        log_message('debug', "[".__METHOD__."] PARAMETER TIME - ".$query->data);
        log_message('debug', "[".__METHOD__."] UNIX PARAMETER TIME - ".$unixDate);
        $messages = $this->emailrcv->getMessages($this->config['mailtype'],'asc',$unixDate);
        //$messages = $this->emailrcv->getMessages();
        //echo "<pre>";
        //print_r($messages);
        //echo "</pre>";
        foreach($messages as $v)
        {
            $this->downloadEmailsInsMessage($v,$emailUser);                          
        }
        //UPDATE LAST SYNCHRONIZATION - now() = unix , unix_to_human(time())
        log_message('debug', "[".__METHOD__."][MESSAGES] UPDATE SYNCHRO TIME : ".unix_to_human(time()));
        // 2019-06-27 09:29 AM
        log_message('debug', "[".__METHOD__."][MESSAGES] DATE AND TIME : ".date("Y-m-d h:i:s A"));    
        $this->db->query('UPDATE parametry SET WARTOSC="'.date("Y-m-d H:i:s").'" WHERE SKROT="EMAIL_SYNCH"');            
        //$this->debugArray($messages);
    } 
    protected function downloadEmailsInsMessage($v,$emailUser)
    {
        //echo "UID - ".$v['uid']."<br/>";
        //echo "SUBJECT - ".$v['subject']."<br/>";
        //die('STOP '.__LINE__);
        log_message('debug', "[".__METHOD__."][MESSAGES] INSERT, MESSAGE");
        //log_message('debug', "[".__METHOD__."][MESSAGES] MESSAGE - ".$v['message']);
        //'.$this->db->escape_str($v['message']).'
        // andd htmlentites
        $v['subject']=htmlentities($v['subject'], ENT_QUOTES);
        $v['message']=htmlentities($v['message'], ENT_QUOTES);
        $this->db->query("INSERT INTO `emails` 
                            (`id_cat`,`ext_uid`,`temat`,`nadawca`,`nadawca_nazwa`,`odbiorca`,`odbiorca_nazwa`,`tresc`,`data_odb`,`message_id`) 
                            VALUES
                            ('1','".$this->db->escape_str($v['uid'])."','".$this->db->escape_str($v['subject'])."','".$this->db->escape_str($v['from']['address'])."','".$this->db->escape_str($v['from']['name'])."','".$emailUser."@gtservices.pl','Kancelaria GT','".$this->db->escape_str($v['message'])."','".$this->db->escape_str($v['date'])."','".$this->db->escape_str($v['message_id'])."')"); 
        $lastId=$this->db->insert_id();
        // CHECK AND INSERT ATTACHMENT
        if(count($v['attachments'])>0)
        {
            $this->downloadEmailsInsAttach($v,$lastId);
        } 
    }
    protected function downloadEmailsInsAttach($v,$lastId)
    {
        foreach($v['attachments'] as $f)
        {
            /*
            echo "<pre>";     
            print_r($v['attachments']);
            echo "</pre>";
            */
            //echo "<br/>FILE - ".$f."<br/>";                 
            log_message('debug', "[".__METHOD__."][MESSAGES] ATTACHMENT FILE - ".$f);
            $fileExt=explode('.',$f);
            $newFileName=uniqid('e_attach_euid_'.$v['uid']."_fuid_").".".end($fileExt);     
            $dir=filter_input(INPUT_SERVER,'DOCUMENT_ROOT').'/attachments/';
            if(rename ( $dir.$f , $dir.$newFileName ))
            {
                log_message('debug', "[".__METHOD__."][MESSAGES] FILE RENAME SUCCESS: ".$f." - ".$newFileName);
            }
            else
            {
                log_message('debug', "[".__METHOD__."][MESSAGES] FILE RENAME FALSE: ".$f." - ".$newFileName);
            }
            // md5
            $md5file = md5_file($dir.$newFileName);
            log_message('debug', "[".__METHOD__."][MESSAGES] md5: ".$md5file);
            $this->db->query("INSERT INTO `emails_attach` (`id_email`,`name`,`local_name`,`md5`) VALUES ('".$lastId."','".$f."','".$newFileName."','".$md5file."')");  
        }
    }
    private function debugArray($array)
    {
        foreach($array as $key => $value)
        {
            log_message('debug', "[".__METHOD__."] -------------------------------- ");
            log_message('debug', "[".__METHOD__."] KEY: ${key} - VALUE: ${value} ");
            if(is_array($value))
            {
                log_message('debug', "[".__METHOD__."] IS ARRAY - NEXT LVL");
                $this->debugArray($value);
            }
        }  
    }
    public function editEmailCategory($data)
    {
        if($this->session->login=='') { log_message('debug', "[".__METHOD__."] User not logged in");  return 'User not logged in!';}
        $i=0;
        $newCat=array();
        $orgCat=array();
        $catNr='';
        log_message('debug', "[".__METHOD__."]");
        foreach($data as $k => $v)
        {
            log_message('debug', "[".__METHOD__."][${k}] ${v}");
            if(substr($k,0,9)==='emlNewCat')
            {
                $v=trim($v);
                log_message('debug', "[".__METHOD__."] FOUND emlNewCat");
                // get number
                $catNr=intval(substr($k,10));
                log_message('debug', "[".__METHOD__."] emlNewCat number => ${catNr}");
                // check name 
                $this->checkEmlCatName($v,$i);
                // check in db
                $this->checkEmlCatInDb($v,$i);
                $i++;
                array_push($newCat,array($v,$data['emlCatList-'.$catNr]));
            }
            else if(substr($k,0,6)==='orgCat')
            {
                // check removed org category
                log_message('debug', "[".__METHOD__."] FOUND orgCat");
                array_push($orgCat,$v);
            }
            else
            {
                log_message('debug', "[".__METHOD__."] NOT FOUND emlNewCat OR emlNewCat is empty"); 
            }
        }
        /* COMMENT BECAUSE WE CAN SEND CATEGORY TO REMOVE */
        if($i===0)
        {
            $this->errMessage.='Nie wprowadzono danych o nowej kategorii!';
        }
        
        if($this->errMessage!=''){return $this->errMessage;}
        // CHECK NOT SENDED CATEGORY
        $this->checkNotSendedEmlCat($orgCat);
        if($this->errMessage!=''){return $this->errMessage;}
        // ADD NEW CATEGORY
        $this->addNewEmlCatToDb($newCat);
        if($this->errMessage!=''){return $this->errMessage;}
        return '';
    }
    private function checkEmlCatInDb($cat,$i)
    {
        $query = $this->db->query("SELECT COUNT(*) AS 'count' FROM `emails_cat` WHERE `WSK_U`='0' AND UPPER(`NAME`)=UPPER('".$this->db->escape_str($cat)."')");
        $row = $query->row();
        $emlCatCounter=$row->count;
        log_message('debug', "[".__METHOD__."] EMAIL CATEGORY WITH NAME COUNTER - ".$emlCatCounter);
        if($emlCatCounter>0)
        {
            $this->errMessage.='[KATALOG-'.$i.'] Istnieje kategoria o podanej nazwie!<br/>';
        }
    }
    private function checkEmlCatName($cat,$i)
    {
        if($cat==='' || !preg_match('/^[a-zA-ZąĄćĆęĘłŁńŃśŚóÓżŻźŹ][\d\sa-zA-ZąĄćĆęĘłŁńŃśŚóÓżŻźŹ\-\_]{0,15}[\da-zA-ZąĄćĆęĘłŁńŃśŚóÓżŻźŹ]{1}$/',$cat))
        {            
            $this->errMessage.='[KATALOG-'.$i.'] Nazwa nowego katalogu nie może być pusta i musi pasować do wzorca!<br/>';
            log_message('debug', "[".__METHOD__."] new cat is empty or wrong name");
        }
    }
    private function addNewEmlCatToDb($catArray)
    {
        log_message('debug', "[".__METHOD__."]");
        
        foreach($catArray as $cat)
        {
            $shortcut=$this->getOrgCatShortcut($cat[1])."_".uniqid();
            // insert to db
            log_message('debug', "[".__METHOD__."] INSERT INTO DB => NAME => ".$cat[0]." CATEGORY => ".$cat[1]);
            $query = $this->db->query('INSERT INTO emails_cat (ID_CAT,NAME,SHORTCUT,MOD_DAT,MOD_HOST,MOD_USER,MOD_USER_ID) VALUES ("'.$this->db->escape_str($cat[1]).'","'.$this->db->escape_str($cat[0]).'","'.$shortcut.'","'.$this->now.'","'.$this->input->server('REMOTE_ADDR').'","'.$this->session->login.'","'.$this->session->userid.'");');
            if($query!=1) { $this->errMessage.='[DB] Contact with Administrator!';}
        }
    }
    private function getOrgCatShortcut($id)
    {
        log_message('debug', "[".__METHOD__."] GET ORIGINAL EMAIL CATEGORY SHORTCUT - ".$id);
        $query = $this->db->query("SELECT `SHORTCUT` AS 'shortcut' FROM `emails_cat` WHERE TRIM(`ID`)=".$this->db->escape_str(trim($id))."");
        $row = $query->row();
        $shortcut=$row->shortcut; 
        log_message('debug', "[".__METHOD__."] SHORTCUT NAME - ".$shortcut);
        return ($shortcut);
    }
    private function checkNotSendedEmlCat($catArray)
    {
        log_message('debug', "[".__METHOD__."]");
        $query = $this->db->query("SELECT  `ID` as id,UPPER(`NAME`) AS name,`MESSAGES` as msg FROM `v_all_eml_cat_m` WHERE `SHORTCUT` NOT IN ('EML_ANSWER','EML_SEND','EML_TETA','EML_BIN')");
        $found=false;
        foreach ($query->result() as $row)
        {
            $msgCount=intval($row->msg);
            foreach($catArray as $cat)
            {
                $catUpper=mb_strtoupper($cat);
                if($row->name===$catUpper)
                {
                    $found=true;
                    log_message('debug', "[".__METHOD__."] FOUND CATEGORY => ".$row->name." => ".$catUpper);
                    break;
                }
            }
            $this->removeEmlCat($found,$row->id,$msgCount,$cat);
            $found=false;
        }
        // 
        
    }
    private function removeEmlCat($found,$id,$msgCount,$cat)
    {
        if(!$found)
        {
            if($msgCount>0)
            {
                log_message('debug', "[".__METHOD__."] CATEGORY MESSAGES = ".$msgCount);
                $this->errMessage.='['.$cat.'] Kategoria nie może zostać usunięta. Do kategorii podpięte są wiadomości!<br/>';
            }
            else
            { 
                // set wsk_u=1;
                $this->db->query('UPDATE `emails_cat` SET `WSK_U`="1" WHERE `ID`='.$id); 
            }
        }
    }
    public function directRmEmlCat($id)
    {
        //check messages
        log_message('debug', "[".__METHOD__."] CATEGORY ID => ".$id);
        $query = $this->db->query("SELECT  `ID` as id FROM `v_all_eml_cat_m` WHERE `SHORTCUT` NOT IN ('EML_ANSWER','EML_SEND','EML_TETA','EML_BIN') AND `ID`=$id");
        $rows=$query->num_rows();
        log_message('debug', "[".__METHOD__."] CATEGORY ROWS IN DB => ".$rows);
        if($rows<1)
        {
            //return '';
            return 'Kategoria została już usunięta!';
        }
        $query = $this->db->query("SELECT  `MESSAGES` as msg FROM `v_all_eml_cat_m` WHERE `SHORTCUT` NOT IN ('EML_ANSWER','EML_SEND','EML_TETA','EML_BIN') AND `ID`=$id");
        $row = $query->row();
        if($row->msg>0)
        {
            log_message('debug', "[".__METHOD__."] CATEGORY CAN NOT BE REMOVED. MESSAGES EXISTS => ".$row->msg);
            return 'Kategoria nie może zostać usunięta. Do kategorii podpięte są wiadomości!';
        }
        $this->db->query('UPDATE `emails_cat` SET `WSK_U`="1" WHERE `ID`='.$id); 
        return '';
    }
}