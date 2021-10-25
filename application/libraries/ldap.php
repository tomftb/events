<?php
/*
 * LDAP LIBRARY
 * Author Tomasz Borczyński
 */
class Ldap {

	private $ADparm=array('AD_url'=>"",'AD_filter'=>"",'AD_tree'=>"",'AD_port'=>"",'AD_user'=>"",'AD_pass'=>"");
	private $ADuserData=array();
	protected $error="";
	private $functionLibrary=array('ldap'=>array('ldap_connect','ldap_bind','ldap_search','ldap_get_entries'),'curl'=>array('curl_init'));
	function __construct()
	{
            log_message('debug', "[".__METHOD__."] Start ldap authorization.");		
	}
        public function connect($AD_url="",$AD_filter="",$AD_tree="",$AD_port="",$AD_user="",$AD_pass="")
        {
            foreach(get_defined_vars() as $key =>$value)
            {
                if($this->clearData($value)!="")
		{			
                    $this->ADparm[$key]=$value;		
                }
		else
		{
                    log_message('error', "[ERROR][".__METHOD__."] Parameter is missed - ".$key.".");
		}
            }
            $this->checkLibraryExists($this->functionLibrary);
            $this->checkPort($this->ADparm["AD_url"],$this->ADparm["AD_port"],4);
        }
/*----------------------------------------------------- checkLibraryExists -------------------------------*/
	private function checkLibraryExists($library)
	{
            foreach($library as $lib => $function)
            {
                if(extension_loaded($lib))
                {
                    log_message('debug', "[".__METHOD__."] Library ${lib} exist.");
                    $this->checkAllFunctions($function);
                }
                else
                {
                    log_message('error', "[".__METHOD__."] Library ".mb_strtoupper($library)." does not exist.");
                    $this->setError("[AD CONNECT]","[ERROR] Something get wrong");
                }
            }
	}
        /*----------------------------------------------------- checkAllFunctions -------------------------------*/
	private function checkAllFunctions($function)
	{
            if(is_array($function))
            {
                foreach($function as $name)
                {
                    $this->checkFunctionExists($name);
                }
            }
            else
            {
                $this->checkFunctionExists($name);
            }
	}
        /*----------------------------------------------------- checkFunctionExists -------------------------------*/
        private function checkFunctionExists($name)
        {
            if (function_exists($name))
            {
                log_message('debug', "[".__METHOD__."] Function ".mb_strtoupper($name)." exist.");
                return 1;
            }
            log_message('error', "[".__METHOD__."] Function ".mb_strtoupper($name)." does not exist.");
            $this->setError("[AD CONNECT]","[ERROR] Something get wrong");
            return 0;
        }
	/*----------------------------------------------------- getUserAdData ------------------------------------*/
	public function getUserAdData($data1="",$data2=0) // ldpa -> array [][]
	{
            if($data1!="" && $data2>=0)
            {	
                if(in_array($data1,$this->ADuserData))
		{
                    return $this->ADuserData[$data1][$data2];
		}
		else
		{
                    $this->setError("[".__METHOD__."]","Nie odnaleziono szukanego rekordu.",2);
		}
            }
            else
            {
		return $this->ADuserData;
            }
	}
	/*-------------------------------------------------- END getUserAdData ------------------------------------*/
	private function checkPort($host,$port,$timeout=4) // check host 
	{
            $err=array('errno'=>'','errstr'=>'');
            $connection = fsockopen($host,$port,$err['errno'],$err['errstr'],$timeout);//
            if (is_resource($connection))
            {
                log_message('info', "[".__METHOD__."] ${host} port ${port} open.");
                fclose($connection);
            }
            else
            {
                log_message('error', "[".__METHOD__."] No response ".$host.":".$port." [".$err['errno']." - ".$err['errstr']."].");
                $this->setError("[AD CONNECT]","[ERROR] Something get wrong");
            }
	}
	public function loginAd($user="",$password="")
	{
            if($this->clearData($user)!=null && $this->clearData($password)!="")
            {
		foreach(get_defined_vars() as $key =>$value)
		{
                    $this->ADparm[$key]=$value;
                };
		$this->connectAD();
            }
            else
            {
		$this->setError("[ERROR]"," Nie wprowadzono danych autoryzacyjnych użytkownika.");
            };
	}
	private function setError($function,$data)
	{
            $this->error=$function.$data;        
	}
	public function getError()
	{
		return $this->error;
	}
	public function getLdapConf()
	{
		return $this->ADparm;
	}
	private function connectAD()
	{	
            try
            {
                $ADLDAP_CON = ldap_connect('ldap://'.$this->ADparm['AD_url'].":".$this->ADparm['AD_port']);
                ldap_set_option($ADLDAP_CON, LDAP_OPT_PROTOCOL_VERSION, 3);
                
                if(ldap_bind($ADLDAP_CON,$this->ADparm['AD_user'],$this->ADparm['AD_pass']))
                {
                    log_message('debug', "[".__METHOD__."] ldap_bind - OK.");
                    $filter = str_replace('%u',$this->ADparm['user'],$this->ADparm['AD_filter']);
                    $sr = ldap_search($ADLDAP_CON, $this->ADparm['AD_tree'], $filter);
                    $result = ldap_get_entries($ADLDAP_CON, $sr);
                    if($result['count'] == 1)
                    {
                        log_message('debug', "[".__METHOD__."] ldap_get_entries - OK.");
                        if(ldap_bind($ADLDAP_CON,$result[0]['dn'],$this->ADparm['password']))
                        {
                            $this->ADuserData=ldap_get_attributes($ADLDAP_CON,ldap_first_entry($ADLDAP_CON, $sr));
                            ldap_unbind($ADLDAP_CON);
                            log_message('debug', "[".__METHOD__."] ldap connect.");
                            return 1;
                        }
                        else
                        {
                            log_message('debug', "[".__METHOD__."]"," ldap_bin user not found.");
                            $this->setError("[ERROR][AD]"," Błędne dane autoryzacyjne.",0);
                        }
                    }
                    else
                    {
                        log_message('debug', "[".__METHOD__."] ldap_get_entries - NO.");
                        $this->setError("[ERROR][AD]"," Z danymi autoryzacyjnymi nie jest powiązany żaden użytkownik AD.",0);
                    }				
                    ldap_unbind($ADLDAP_CON);
                }
                else
                {
                   log_message('error', "[".__METHOD__."] ldap_bind = FALSE.");
                   $this->setError("[AD CONNECT]","[ERROR] Something get wrong");
                }	
            }
            catch (Exception $e)
            {
                log_message('error', "[".__METHOD__."] Exception ".$e->getMessage());
                $this->setError("[AD CONNECT]","[ERROR] Something get wrong");
            }
            
            
            return 0;
	}
	private function clearData($data)
	{     
	/* ltrim
	    " " (ASCII 32 (0x20)), an ordinary space.
	    "\t" (ASCII 9 (0x09)), a tab.
	    "\n" (ASCII 10 (0x0A)), a new line (line feed).
	    "\r" (ASCII 13 (0x0D)), a carriage return.
	    "\0" (ASCII 0 (0x00)), the NUL-byte.
	    "\x0B" (ASCII 11 (0x0B)), a vertical tab.
	*/
		$data=ltrim($data);
		if($data!='')
		{
			$patterns = array('/\//','/\*/','/\#/'); // nie moze byc backslash
			foreach($patterns as $value)
			{
                            //log_message('debug', "[".__METHOD__."] ${value} ${data}");
                            $data=preg_replace($value, '', $data);
			};
			$data=strip_tags($data);
			$data=htmlspecialchars($data, ENT_QUOTES);
		}
            return $data;
	}
	function __destruct()
	{	
            log_message('info', "[".__METHOD__."]");
	}
}