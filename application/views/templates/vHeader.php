<!DOCTYPE html>
<?php
$uid=uniqid();
?>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
<meta http-equiv="cache-control" content="max-age=0" />
<meta http-equiv="cache-control" content="no-cache" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title><?=$app_name?></title>
<!-- IKONKA GT -->
<link rel="apple-touch-icon" sizes="57x57" href="<?=$url?>gt_utilities/ico/apple-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="<?=$url?>gt_utilities/ico/apple-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="<?=$url?>gt_utilities/ico/apple-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="<?=$url?>gt_utilities/ico/apple-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="<?=$url?>gt_utilities/ico/apple-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="<?=$url?>gt_utilities/ico/apple-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="<?=$url?>gt_utilities/ico/apple-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="<?=$url?>gt_utilities/ico/apple-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="<?=$url?>gt_utilities/ico/apple-icon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192" href="<?=$url?>gt_utilities/ico/android-icon-192x192.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?=$url?>gt_utilities/ico/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="96x96" href="<?=$url?>gt_utilities/ico/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?=$url?>gt_utilities/ico/favicon-16x16.png">
<link rel="manifest" href="<?=$url?>gt_utilities/ico/manifest.json">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-TileImage" content="<?=$url?>gt_utilities/ico/ms-icon-144x144.png">
<meta name="theme-color" content="#ffffff">
<!-- KONIEC IKONKA GT -->
<!-- CSS -->
<link rel="stylesheet" href="<?=$url?>css/gt-admin.css?<?=$uid?>" >
<link rel="stylesheet" href="<?=$url?>css/bootstrap.min.4.1.1.css" >
<link rel="stylesheet" href="<?=$url?>css/bootstrap-datepicker.min.css" >
<link rel="stylesheet" href="<?=$url?>css/font-awesome.min.4.7.0.css" >
<link rel="stylesheet" href="<?=$url?>css/bootstrap-datepicker3.css" >
<link rel="stylesheet" href="<?=$url?>css/header.css?<?=$uid?>" >
<link rel="stylesheet" type="text/css" href="<?=$url?>js/datatables.min.css"/>
<!-- END CSS -->
<!-- JS -->
<script src="<?=$url?>js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/popper-1.14.3.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/jquery-ui-1.10.1.custom/jquery-ui-1.10.1.custom.min.js"></script>
<script src="<?=$url?>js/bootstrap-4.1.3.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/bootstrap-datepicker.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/bootstrap-datepicker.en-GB.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/datepicker_pl.js"></script>
<script type="text/javascript" src="<?=$url?>js/datatables.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/dataTables.buttons.min.js"></script> 
<script type="text/javascript" src="<?=$url?>js/jszip.min.js"></script>
<script type="text/javascript" src="<?=$url?>js/buttons.html5.min.js"></script>
<!-- END JS -->
</head>
<header id="header">
        <div class="row">
            <div class="col pr-0">
                <div id="logo" class="pull-left pl-1">
                  <h1><img src="<?=$url?>gt_utilities/gt_logo_34.png" alt="" title="GT_LOGO"  />
                      <a href="<?=$link?>" class="scrollto"><?=$app_name?></a>
                  </h1>
                </div>
            </div>
            <div class="col-sm-8 ml-0">
                <nav id="nav-menu-container " style="border:0px solid red;">
                  <ul id="nav-header-menu" class="nav-menu pull-right" onclick="setMenuActive()">
                      <li id="main"><i class="fa fa-camera-retro" aria-hidden="true"></i><a href="<?=$link?>">WYDARZENIA</a></li>
                      <!-- <li id="li-2"><i class="fa fa-address-card-o" aria-hidden="true"></i><a href="<?php echo $link."2"; ?>">Projekty</a></li>-->
                      <!-- <li id="li-3"><i class="fa fa-user-circle-o" aria-hidden="true"></i><a href="<?php echo $link."3"; ?>">Pracownicy</a></li>-->
                      <li id="showAdmin"><i class="fa fa-cog" aria-hidden="true"></i><a href="<?php echo $link."showAdmin"; ?>"> Administrator</a>
                          <ul  class="mt-0 ml-0 nav-menu" onclick="setMenuActive()">
                            <li id="showUsers"><a href="<?php echo $link."showUsers"; ?>">Użytkownicy</a></li>
                            <li id="showPerms"><a href="<?php echo $link."showPerms"; ?>">Uprawnienia</a></li>
                            <li id="showRole"><a href="<?php echo $link."showRole"; ?>">Role</a></li>
                            <!-- <li id="li-8"><a href="<?php //echo $link."8"; ?>">Opcje</a></li> -->
                            <li id="showParms"><a href="<?php echo $link."showParms"; ?>">Parametry</a></li>
                          </ul>
                        </li>
                    <li><i class="fa fa-sign-out" aria-hidden="true"></i><a href="<?php echo $url."logout"; ?>"> Wyloguj</a></li>
                  </ul>
                </nav><!-- #nav-menu-container -->
            </div>
        </div>
</header><!-- #header -->
<SCRIPT type="text/javascript" src="<?php echo $url; ?>js/headerView.js?<?=$uid?>"></SCRIPT>
<script>window.acl = <?= json_encode($acl)?>;</script>
<SCRIPT type="text/javascript" src="<?php echo $js_setuserpermission; ?>"></SCRIPT>
<script type="text/javascript" src="<?=$js_createhtmlelement?>"></script>
