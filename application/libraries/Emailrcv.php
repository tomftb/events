<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/*
 * This class can be used to retrieve messages from an IMAP, POP3 and NNTP server
 * @author Kiril Kirkov
 * GitHub: https://github.com/kirilkirkov
 * Usage example:
  1. $imap = new Imap();
  2. $imap->connect('{imap.gmail.com:993/imap/ssl}INBOX', 'user@gmail.com', 'secret_password');
  3. $messages = $imap->getMessages('text'); //Array of messages
 * in $attachments_dir property set directory for attachments
 * in the __destructor set errors log
 */
class Emailrcv
{
    private $imapStream;
    private $plaintextMessage;
    private $htmlMessage;
    private $emails;
    private $errors = array();
    private $attachments = array();
    private $attachments_dir = 'attachments/';
    private $limit = 100;
    public function __construct()
    {
	log_message('debug', "[".__METHOD__."]");
        if (!file_exists('attachments'))
        {
            log_message('debug', "[".__METHOD__."] MKDIR");
            if(mkdir('attachments', 0777, true))
            {
		log_message('debug', "[".__METHOD__."] TRUE");
            }
            else
            {
		log_message('debug', "[".__METHOD__."] FALSE");
            }
        }
        else
        {
            log_message('debug', "[".__METHOD__."] FILE EXISTS - attachments");
        }
    }
    public function connect($hostname, $username, $password)
    {
	log_message('debug', "[".__METHOD__."] ");
        $connection = imap_open($hostname, $username, $password) or die('Cannot connect to Mail: ' . imap_last_error());
        $this->imapStream = $connection;
        return true;
    }
    /*
     * modification FUNCTION ADD DATE TO VALID
     */
    public function getMessages($type = 'text', $sort = 'asc', $date='')
    {
	log_message('debug', "[".__METHOD__."] ");
        log_message('debug', "[".__METHOD__."] LAST SYCH DATE => ".$date);
        $stream = $this->imapStream;
        $emails = imap_search($stream, 'ALL');
        $tmp='';
        if (strtolower($sort) == 'desc') {
            krsort($emails);
        }
        $messages = array();
        if ($emails) {
            $this->emails = $emails;
            $i = 0;
            foreach ($emails as $email_number) {
                $this->attachments = array();
                $uid = imap_uid($stream, $email_number);
                $tmp=$this->loadMessage($uid, $type, $email_number,$date);
                log_message('debug', "[".__METHOD__."] EMAIL ARRAY COUNT => ".count($tmp));
                if(count($tmp)>0)
                {
                    $messages[$email_number] = $tmp;
                    $i++;
                }
                if ($i == $this->limit) {
                    break;
                }
            }
            log_message('debug', "[".__METHOD__."] TRUE PASS EMAIL COUNTER => ".$i);
        }
        return $messages;
    }
    /*
     * Give message_numer from 
     * returned array from - getMessages
     * if you want to delete message by UID, not Message number
     * set FT_UID to $uid. 
     * Example $imap->deleteMessage(221, FT_UID); - 221 is uid
     */
    public function deleteMessage($messageId, $uid = 0)
    {
	log_message('debug', "[".__METHOD__."] ");
        imap_delete($this->imapStream, $messageId, $uid);
    }
    private function loadMessage($uid, $type, $email_number,$date)
    {
	log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] UID - ${uid}, TYPE - ${type}, EMAIL NUMBER - ${email_number}");
        $overview = $this->getOverview($uid);
        $array = array();
        // CHECK DATE
        if(strtotime($overview->date)<$date)
        {
            log_message('debug', "[".__METHOD__."] EMAIL DATE LOWER THAN LAST SYNCH DATE [".strtotime($overview->date)." < ".$date."]");
            return $array;
        }
        
        $array['subject'] = isset($overview->subject) ? $this->decode($overview->subject) : '';
        $array['date'] = strtotime($overview->date);
        $array['message_id'] = $overview->message_id;
        $array['message_number'] = $email_number;
        $array['uid'] = $overview->uid;
        $array['references'] = isset($overview->references) ? $overview->references : 0;
        log_message('debug', "[".__METHOD__."] EMAIL references => ".$array['references']);
        $headers = $this->getHeaders($uid);
        $array['from'] = isset($headers->from) ? $this->processAddressObject($headers->from) : array('');
        $structure = $this->getStructure($uid);
        log_message('debug', "[".__METHOD__."] EMAIL SUBJECT => ".$array['subject']);
        log_message('debug', "[".__METHOD__."] EMAIL DATE => ".$array['date']);
        log_message('debug', "[".__METHOD__."] EMAIL message_id => ".$array['message_id']);
        if (!isset($structure->parts)) { // not multipart
            log_message('debug', "[".__METHOD__."] not multipart");
            $this->processStructure($uid, $structure);
        } else { // multipart
            log_message('debug', "[".__METHOD__."] multipart");
            foreach ($structure->parts as $id => $part) {
                log_message('debug', "[".__METHOD__."] part: ID - ${id}");
                //echo "<pre>";
                //print_r($part);
                //echo "</pre>";
                $this->processStructure($uid, $part, $id + 1);
            }
        }
        
        $array['message'] = $type == 'text' ? $this->plaintextMessage : $this->htmlMessage;
        // ADD CHECK IF HTML IS EMPTY, TAKE DATA FROM PLAINTEXT
        if(trim($this->htmlMessage)==='') $array['message']=$this->plaintextMessage;
        $array['message'] = $this->replaceInlineImagesSrcWithRealPath($array['message']);
        $array['attachments'] = $this->attachments;
        return $array;
    }
    private function processStructure($uid, $structure, $partIdentifier = null)
    {
	log_message('debug', "[".__METHOD__."] ");
        $parameters = $this->getParametersFromStructure($structure);
        if ((isset($parameters['name']) || isset($parameters['filename'])) || (isset($structure->subtype) && strtolower($structure->subtype) == 'rfc822')
        ) {
            if (isset($parameters['filename'])) {
                $this->setFileName($parameters['filename']);
            } elseif (isset($parameters['name'])) {
                $this->setFileName($parameters['name']);
            }
            $this->encoding = $structure->encoding;
            $result_save = $this->saveToDirectory($this->attachments_dir, $uid, $partIdentifier);
            log_message('debug', "[".__METHOD__."] AFTER SAVE TO DIRECTORY: RESULT SAVE - ${result_save}");
            if ($result_save === true) {
                $this->attachments[] = $this->filename;
            }
            /*
             * If have inline image in email body
             * set array with key of cid and value of filename
             * after that we replace it in html body
             */
            if ($parameters['disposition'] == 'INLINE') {
                $parameters['id'] = str_replace('<', '', $parameters['id']);
                $parameters['id'] = str_replace('>', '', $parameters['id']);
                $this->inlineAttachments[$parameters['id']] = $this->filename;
            }
        } elseif ($structure->type == 0 || $structure->type == 1) {
            $messageBody = isset($partIdentifier) ?
                    imap_fetchbody($this->imapStream, $uid, $partIdentifier, FT_UID | FT_PEEK) : imap_body($this->imapStream, $uid, FT_UID | FT_PEEK);
            $messageBody = $this->decodeMessage($messageBody, $structure->encoding);
            if (!empty($parameters['charset']) && $parameters['charset'] !== 'UTF-8') {
                if (function_exists('mb_convert_encoding')) {
                    if (!in_array($parameters['charset'], mb_list_encodings())) {
                        if ($structure->encoding === 0) {
                            $parameters['charset'] = 'US-ASCII';
                        } else {
                            $parameters['charset'] = 'UTF-8';
                        }
                    }
                    $messageBody = mb_convert_encoding($messageBody, 'UTF-8', $parameters['charset']);
                } else {
                    $messageBody = iconv($parameters['charset'], 'UTF-8//TRANSLIT', $messageBody);
                }
            }
            log_message('debug', "[".__METHOD__."] MESSAGE BODY - ${messageBody}");
            log_message('debug', "[".__METHOD__."] MESSAGE SUBTYPE - ".strtolower($structure->subtype));
            if (strtolower($structure->subtype) === 'plain' || ($structure->type == 1 && strtolower($structure->subtype) !== 'alternative')) {
                log_message('debug', "[".__METHOD__."] MESSAGE - PLAIN");
                $this->plaintextMessage = '';
                $this->plaintextMessage .= trim(htmlentities($messageBody));
                $this->plaintextMessage = nl2br($this->plaintextMessage);
            } elseif (strtolower($structure->subtype) === 'html') {
                log_message('debug', "[".__METHOD__."] MESSAGE - HTML");
                $this->htmlMessage = '';
                $this->htmlMessage .= $messageBody;
            }
            log_message('debug', "[".__METHOD__."][plaintextMessage] MESSAGE BODY - ".$this->plaintextMessage);
            log_message('debug', "[".__METHOD__."][html] MESSAGE BODY - ".$this->htmlMessage);
        }
        if (isset($structure->parts)) {
            foreach ($structure->parts as $partIndex => $part) {
                $partId = $partIndex + 1;
                if (isset($partIdentifier)) {
                    $partId = $partIdentifier . '.' . $partId;
                }
                $this->processStructure($uid, $part, $partId);
            }
        }
    }
    private function replaceInlineImagesSrcWithRealPath($message)
    {
        log_message('debug', "[".__METHOD__."] ".$message);
        /*
         * If have inline attachments saved
         * replace images src with real path of attachments if are same
         */
        if (isset($this->inlineAttachments) && !empty($this->inlineAttachments)) {
            preg_match('/"cid:(.*?)"/', $message, $cids);
            if (!empty($cids)) {
                $message = mb_ereg_replace('/"cid:(.*?)"/', '"' . $this->attachments_dir . $this->inlineAttachments[$cids[1]] . '"', $message);
            }
        }
        return $message;
    }
    private function setFileName($text)
    {
	log_message('debug', "[".__METHOD__."] ");
        $this->filename = $this->decode($text);
    }
    /*
     * save attachments to directory
     */
    private function saveToDirectory($path, $uid, $partIdentifier)
    {
	log_message('debug', "[".__METHOD__."]");
        log_message('debug', "[".__METHOD__."] PATH - ${path}, UID - ${uid}, PARTIDENTIFIER - ${partIdentifier}");
        $path = rtrim($path, '/') . '/';
        $full_file_place = $path . $this->filename;
        log_message('debug', "[".__METHOD__."] FULL FILE PLACE - ${full_file_place}");
        if (file_exists($path . $this->filename)) {
            $this->filename = time() . rand(1, 100) . $this->filename; // :)
        } elseif (!is_dir($path)) {
            $this->errors[] = 'Cant find directory for email attachments! Message ID:' . $uid;
            return false;
        } elseif (!is_writable($path)) {
            $this->errors[] = 'Attachments directory is not writable! Message ID:' . $uid;
            return false;
        }
        if (($filePointer = fopen($path . $this->filename, 'w')) == false) {
            $this->errors[] = 'Cant open file at imap class to save attachment file! Message ID:' . $uid;
            return false;
        }
        switch ($this->encoding) {
            case 3: //base64
                $streamFilter = stream_filter_append($filePointer, 'convert.base64-decode', STREAM_FILTER_WRITE);
                break;
            case 4: //quoted-printable
                $streamFilter = stream_filter_append($filePointer, 'convert.quoted-printable-decode', STREAM_FILTER_WRITE);
                break;
            default:
                $streamFilter = null;
        }
        log_message('debug', "[".__METHOD__."] BEFORE IMAP SAVEBODY");
        $fetch  = imap_fetchbody($this->imapStream, $uid, $partIdentifier ?: 1, FT_UID);
        $result = imap_savebody($this->imapStream, $filePointer, $uid, $partIdentifier ?: 1, FT_UID);
        log_message('debug', "[".__METHOD__."] AFTER IMAP SAVEBODY");
        if ($streamFilter) {
            stream_filter_remove($streamFilter);
        }
        fclose($filePointer);
        return $result;
    }
    private function decodeMessage($data, $encoding)
    {
	log_message('debug', "[".__METHOD__."] ");
        if (!is_numeric($encoding)) {
            $encoding = strtolower($encoding);
        }
        switch ($encoding) {
            # 7BIT
            case 0:
                return $data;
            # 8BIT
            case 1:
                return quoted_printable_decode(imap_8bit($data));
            # BINARY
            case 2:
                return imap_binary($data);
            # BASE64
            case 3:
                return imap_base64($data);
            # QUOTED-PRINTABLE
            case 4:
                return quoted_printable_decode($data);
            # OTHER
            case 5:
                return $data;
            # UNKNOWN
            default:
                return $data;
        }
    }
    private function getParametersFromStructure($structure)
    {
		log_message('debug', "[".__METHOD__."] ");
        $parameters = array();
        if (isset($structure->parameters)) {
            foreach ($structure->parameters as $parameter) {
                $parameters[strtolower($parameter->attribute)] = $parameter->value;
            }
        }
        if (isset($structure->dparameters)) {
            foreach ($structure->dparameters as $parameter) {
                $parameters[strtolower($parameter->attribute)] = $parameter->value;
            }
        }
        $parameters['disposition'] = $structure->disposition;
        $parameters['id'] = $structure->id;
        return $parameters;
    }
    private function getOverview($uid)
    {
	log_message('debug', "[".__METHOD__."] ");
        $results = imap_fetch_overview($this->imapStream, $uid, FT_UID);
        $messageOverview = array_shift($results);
        if (!isset($messageOverview->date)) {
            $messageOverview->date = null;
        }
        return $messageOverview;
    }
    private function decode($text)
    {
	log_message('debug', "[".__METHOD__."] ");
        if (null === $text) {
            return null;
        }
        $result = '';
        foreach (imap_mime_header_decode($text) as $word) {
            $ch = 'default' === $word->charset ? 'ascii' : $word->charset;
            $result .= iconv($ch, 'utf-8', $word->text);
        }
        return $result;
    }
    private function processAddressObject($addresses)
    {
		log_message('debug', "[".__METHOD__."] ");
        $outputAddresses = array();
        if (is_array($addresses))
            foreach ($addresses as $address) {
                if (property_exists($address, 'mailbox') && $address->mailbox != 'undisclosed-recipients') {
                    $currentAddress = array();
                    $currentAddress['address'] = $address->mailbox . '@' . $address->host;
                    if (isset($address->personal)) {
                        $currentAddress['name'] = $this->decode($address->personal);
                    }
                    $outputAddresses = $currentAddress;
                }
            }
        return $outputAddresses;
    }
    private function getHeaders($uid)
    {
		log_message('debug', "[".__METHOD__."] ");
        $rawHeaders = $this->getRawHeaders($uid);
        $headerObject = imap_rfc822_parse_headers($rawHeaders);
        if (isset($headerObject->date)) {
            $headerObject->udate = strtotime($headerObject->date);
        } else {
            $headerObject->date = null;
            $headerObject->udate = null;
        }
        $this->headers = $headerObject;
        return $this->headers;
    }
    private function getRawHeaders($uid)
    {
	log_message('debug', "[".__METHOD__."] ");
        $rawHeaders = imap_fetchheader($this->imapStream, $uid, FT_UID);
        return $rawHeaders;
    }
    private function getStructure($uid)
    {
	log_message('debug', "[".__METHOD__."] ");
        $structure = imap_fetchstructure($this->imapStream, $uid, FT_UID);
        return $structure;
    }
    public function __destruct()
    {
        log_message('debug', "[".__METHOD__."] ");
        if (!empty($this->errors)) {
            foreach ($this->errors as $error) {
                //SAVE YOUR LOG OF ERRORS
		log_message('debug', "[".__METHOD__."] ".$error);
                log_message('debug', "[".__METHOD__."] ".dirname(__FILE__));
                log_message('debug', "[".__METHOD__."] ATTACHMENT DIR - ".$this->attachments_dir);
            }
        }
    }
}