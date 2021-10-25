<?php
class Email_model extends CI_Model
{
    private $config=array(
            'protocol' => 'smtp',
            'smtp_host' => '',
            'smtp_port' => 0,
            'smtp_user' => '',
            'smtp_pass' => '',
            'useragent' => 'KancelariaGT',
            'mailtype'  => 'html', 
            'charset'   => '',
            'smtp_timeout'=>0
        );
    private $footer='<br/>--<br/><table cellspacing="0" cellpadding="0" class="lato" border="0" width="640px" style="margin: 0;">
   <tbody><tr><td style="padding: 0;"><p style="font-size: 16px;color:#333333;line-height: 20px; font-weight: bold; font-family: Lato, Arial;" class="imie_nazwisko szary">Kancelaria GT
            </p></td></tr><tr><td style="padding: 0;"><p style="margin: 10px 0;font-size: 14px;font-weight:300;line-height:17px;text-align: justify;color:#333333;font-family: Lato, Arial;">tel.: +48 566692154 <br>mob.: +48 693990168</p>
         </td></tr><tr><td style="padding: 0;">
            <p style="margin: 0 0 13px 0;font-size: 14px;font-weight:300;line-height:17px;text-align: justify;color:#333333;font-family: Lato, Arial;" class="MsoNormal">
                  Geofizyka Toruń S.A.<br>Chrobrego 50<br>87–100 Toruń, Poland<br>
                  <a target="_blank" href="http://www.GTservices.pl" style="color: #000000; text-decoration: none;"><span style="margin: 10px 0;font-size: 14px;font-weight:300;line-height:17px;text-align: justify;color:#333333;font-family: Lato, Arial;">www.GTservices.pl</span></a>
            </p></td></tr><tr><td style="padding: 0;">
            <div style="width:640px;border:0px solid black;">
            <div style="display:block; float:left; width:416px; border:1px solid #68b42e; margin-left:0px; margin-top:0px; padding:0px 0px 0px 0px;"></div>
            <div style="display:block; float:left; width:220px; border:1px solid #f39200; margin-right:0px; margin-top:0px; padding:0px 0px 0px 0px;"></div>
            </div></td></tr><tr><td style="padding: 0;font-weight: 300;font-family: Lato, Arial; font-size: 11px;">
            <p style="margin: 10px 0;color: #666666;font-size: 11px;font-weight:300;line-height:15px;text-align: justify;">Spółka akcyjna zarejestrowana w Krajowym Rejestrze Sądowym prowadzonym przez Sąd Rejonowy w Toruniu, VII Wydział Gospodarczy pod nr KRS 0000425970, NIP: 879-20-46-601, Kapitał zakładowy: 75 240 000 PLN wpłacony w całości. <br>The joint-stock company entered into the National Court Register, maintained by the District Court for Toruń, VII Commercial Division, under entry No. KRS 0000425970, Tax Identification Number (NIP): PL 879-20-46-601, Paid-up Initial Capital: PLN 75 240 000. </p>
            <p style="margin: 10px 0;color: #666666;font-size: 11px;font-weight:300;line-height:15px;text-align: justify;">Przeczytaj dwa razy zanim wydrukujesz tę wiadomość – chroń Ziemię. Read twice before printing – save the Planet.</p>
            <p style="margin: 10px 0;color: #666666;font-size: 11px;font-weight:300;line-height:15px;text-align: justify;">Niniejsza wiadomość może zawierać informacje prawnie chronione. Wiadomość skierowana jest wyłącznie do adresata / adresatów określonych wyżej i stanowi własność nadawcy. Odbiorca, który otrzymał tę wiadomość przypadkowo, proszony jest o jej nie rozpowszechnianie, a następnie poinformowanie nadawcy i jej usunięcie. Rozpowszechnianie, kopiowanie, ujawnianie lub przekazywanie osobom trzecim w jakiejkolwiek formie informacji zawartych w niniejszej wiadomości w całości lub części jest zakazane.</p>
            <p style="margin: 10px 0;color: #666666;font-size: 11px;font-weight:300;line-height:15px;text-align: justify;">The information contained in this message may be privileged and confidential and protected from disclosure. Information included in that message is addressed only to the addressee/addressees determined above and is the property of the sender. If you have received this communication in error, please notify the sender immediately by replying to the message and deleting it from your computer. Any dissemination, distribution or copying of this  communication to the third parties is strictly prohibited.</p>
         </td></tr></tbody></table>';
    public function __construct()
    {
        parent::__construct();
        $this->setEmailParm();
        $this->load->library('email', $this->config);
        $this->load->library('emailrcv');
        $this->load->helper('url');
    }
    private function setEmailParm()
    {
        $tmp=array();
        $result=$this->db->query('SELECT Skrot,Wartosc FROM `v_parm` WHERE Skrot LIKE "MAIL_%"');
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
    public function sendEmail($data)
    {
        log_message('debug', "[".__METHOD__."]");
        $prvMessage='';
        $sep="<p style=\"color:#9900cc; font-weight:bold;\">----</p>";
        //$this->debugArray($data);  
        $this->email->from('rezerwacjegop@geofizyka.pl','Kancelaria GT');
        if(trim($data['address'])==='' || trim($data['temat'])==='' || trim($data['wiadomosc'])==='')
        {
            return 'Nie uzupełniono odbiorcy, tematu lub treści.';
        }
        if($data['id']!=='')
        {
            $result=$this->db->query('SELECT `tresc` FROM `emails` WHERE id="'.$this->db->escape_str(trim($data['id'])).'"');
            $prvData=$result->row();
            $prvMessage=$sep.$prvData->tresc.$sep;
        }
        $this->email->to($data['address']);
        //$this->email->cc('another@another-example.com');
        //$this->email->bcc('them@their-example.com');
        $this->email->subject($data['temat']);
        $this->email->message($data['wiadomosc'].$prvMessage.$this->footer);
        
        $this->email->send();
        $this->db->query('INSERT INTO emails 
                            (id_cat,temat,nadawca,nadawca_nazwa,odbiorca,odbiorca_nazwa,tresc,data_odb) 
                            VALUES
                            ("2","'.$this->db->escape_str($data['temat']).'","rezerwacjegop@geofizyka.pl","Kancelaria GT","'.$this->db->escape_str($data['address']).'","'.$this->db->escape_str($data['address']).'","'.$this->db->escape_str($data['wiadomosc'].$prvMessage.$this->footer).'","'.$this->db->escape_str('NOW()').'")'); 
        log_message('debug', "[".__METHOD__."]".$this->email->print_debugger(array('headers')));
        //$this->downloadEmails();
        return '';
    }
    public function downloadEmails()
    {
        log_message('debug', "[".__METHOD__."]");
        //$inbox = New 
        $con_result = $this->emailrcv->connect('{mail.geofizyka.pl:993/imap/ssl}INBOX', 'rezerwacjegop', '!@rez$%goP1');
        if ($con_result !== true)
        {
           // log_message('debug', "[".__METHOD__."] CONNECTION ERROR - ${con_result} ");
            //exit;
        }
        else
        {
            
        }
        log_message('debug', "[".__METHOD__."] CONNECTION RESULT - ${con_result} ");
        $query = $this->db->query("SELECT `WARTOSC` AS 'data' FROM `parametry` WHERE `SKROT`='EMAIL_SYNCH'");
        $row = $query->row();
        $unixDate=strtotime($row->data);
        $unixMessageDate='';
        log_message('debug', "[".__METHOD__."] PARAMETER TIME - ".$row->data);
        log_message('debug', "[".__METHOD__."] UNIX PARAMETER TIME - ".$unixDate);
        $messages = $this->emailrcv->getMessages('text');
        echo "<pre>";
        print_r($messages);
        echo "</pre>";
        //if($messages['status']==='success')
        //{
            //foreach($messages['data'] as $k => $v)
            foreach($messages as $k => $v)
            {
                echo "UID - ".$v['uid']."<br/>";
                echo "SUBJECT - ".$v['subject']."<br/>";
                //die('STOP '.__LINE__);
                $unixMessageDate= strtotime($v['date']);
                if($unixMessageDate<$unixDate)
                {
                    // OLD MESSAGES
                    log_message('debug', "[".__METHOD__."][MESSAGES] NO INSERT, MESSAGE DATE ".$unixMessageDate." LOWER THAN PARAMETER DATE");
                }
                else
                {
                    log_message('debug', "[".__METHOD__."][MESSAGES] INSERT, MESSAGE");
                    //log_message('debug', "[".__METHOD__."][MESSAGES] MESSAGE - ".$v['message']);
                    //'.$this->db->escape_str($v['message']).'
                    $this->db->query("INSERT INTO `emails` 
                            (`id_cat`,`ext_uid`,`temat`,`nadawca`,`nadawca_nazwa`,`tresc`,`data_odb`) 
                            VALUES
                            ('1','".$this->db->escape_str($v['uid'])."','".$this->db->escape_str($v['subject'])."','".$this->db->escape_str($v['from']['address'])."','".$this->db->escape_str($v['from']['name'])."','".$this->db->escape_str($v['message'])."','".$this->db->escape_str($v['date'])."')"); 
                    $lastId=$this->db->insert_id(); 
                    if(count($v['attachments'])>0)
                    {
                        foreach($v['attachments'] as $id => $f)
                        {
                            //echo "ID - $id<br/>";
                       
                            $v['attachments'][$id]['uid']=$v['uid'];
                            //$v['attachments'][$id]['file']=uniqid();
                            //$f['uid']=$v['uid'];
                            echo "<pre>";
                            print_r($v['attachments'][$id]);
                            echo "</pre>";
                            //$this->emailrcv->getFiles($v['attachments'][$id]);
                            log_message('debug', "[".__METHOD__."][MESSAGES] ATTACHMENT FILE - ".$f['file']);
                            log_message('debug', "[".__METHOD__."][MESSAGES] ATTACHMENT UID - ".$f['uid']);
                            $fileExt=explode('.',$f['file']);
                            $newFileName=uniqid('email_attach_').".".end($fileExt);
                            
                            $dir=filter_input(INPUT_SERVER,'DOCUMENT_ROOT').'/attachments/';
                            if(rename ( $dir.$f['file'] , $dir.$newFileName ))
                            {
                                log_message('debug', "[".__METHOD__."][MESSAGES] FILE RENAME SUCCESS: ".$f['file']." - ".$newFileName);
                            }
                            else
                            {
                                 log_message('debug', "[".__METHOD__."][MESSAGES] FILE RENAME FALSE: ".$f['file']." - ".$newFileName);
                            }
                            $this->db->query("INSERT INTO `emails_attach` 
                            (`id_email`,`name`,`location`) 
                            VALUES
                            ('".$lastId."','".$f['file']."','".base_url().'attachments/'.$newFileName."')"); 
                        }
                    }
                    
                }                            
            }
            // UPDATE LAST SYNCHRONIZATION - now() = unix , unix_to_human(time())
            //$this->db->query('UPDATE parametry SET WARTOSC="'.unix_to_human(time()).'" WHERE SKROT="EMAIL_SYNCH"');
        //}
        
        //$this->debugArray($messages);
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
}