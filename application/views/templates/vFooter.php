<script type="text/javascript" src="<?=$js_ajax?>"></script>
<script type="text/javascript" src="<?=$js_datatablesextend?>"></script>
<script type="text/javascript" src="<?=$js_parse?>"></script>
<script type="text/javascript" src="<?=$js?>"></script>
<footer class="sticky-footer fixed-bottom gt-bg-color-purple">
    <div class="row">
        <div class="col-sm-5">
            <div class="text-left ml-2">
                <small class="text-white font-weight-normal gt-font">Zalogowano - <?=$userlogin?> <span class="text-dark"><?php echo " (".$useremail.")"; ?></span></small>
            </div>
        </div>
    <div class="col-sm-2">
        <div class="text-center">
            <small class="text-white font-weight-normal gt-font"><?=$app_name?></small>
        </div>
    </div>
    <div class="col-sm-5">
        <div class="text-right  mr-2">
            <small class="text-white font-weight-normal gt-font">Autor: Tomasz Borczyński</small>
        </div>
    </div> 
    </div>
</footer>
</body>
</html>