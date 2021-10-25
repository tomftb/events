function setPermission()
{
    console.log('===setPermission()===');
    //console.log(acl); // GLOBAL
    //console.log(perm);// GLOBAL

    //console.log(perm.ADD_ROLE);
    //console.log(perm['ADD_ROLE']);
    //console.log(Object.keys(perm));
    if(acl!==null)
    {
        for (var i in perm)
        {
            //console.log(i);
            //console.log(acl.indexOf(i));
            if(acl.indexOf(i)!==-1)
            {
                perm[i]='no-disabled';
                //console.log('PERM EXIST - '+i);
            }
            else
            {
                //console.log('PERM NOT EXIST - '+i);
            }
            /* 
             if (perm.hasOwnProperty(i))
            {
                console.log(perm[i]);
            }

             */
        }
    }
    else
    {
        // NO PERM
        //console.log('NO PERMISSION');
        // REDIRECT TO LOGIN PAGE
        //window.location.replace("http://stackoverflow.com");
    }
    
}