<?php
$fieldList = array(
    array('zaznacz_wszsytkie','Zaznacz wszystkie'),
    array('temat','Nazwa wydarzenia'),
    array('data_koniec','Ostateczny termin zapisu'),
    array('autor','Autor'),
    array('odbiorca','Odbiorca'),
    array('status','Status'),
    array('opcj','Opcje')
);

//    1=>array('id','ID',50),
$fieldListLegth=count($fieldList);
?>
<body>   
<div class="w-100 mr-0 pr-0" style="border: 0px solid red; margin-top:100px; margin-bottom:25px;  z-index:996;">
    <div class="row">
        <div class=" col-4" >
        </div>
        <div class=" col-4">
            <h1 class="text-center mb-3 mt-1 gt-color-purple"><?=$tytul?></h1>
        </div>
        <div class=" col-4">
            <div class="row float-right mr-4">
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-12" id="dataTableDiv">
            <table class="table table-striped w-100 ml-0 mr-0 table-hover" id="dataTable">
            <thead><tr><th class="mr-1 pr-1">
            <!--<button class="btn btn-info" id="checkAllBtn"><i class="fa fa-check"></i>&nbspZaznacz wszystkie</button>-->
            <button class="btn btn-info " style="width:40px;height:40px;" id="checkAllBtn"><i class="fa fa-check"></i></button></th>
            <?php
		for ($id=1;$id<$fieldListLegth; $id++)
                { 
                    echo '<th id="th-data'.$id.'">'.$fieldList[$id][1].'</th>';
                }
            ?>
            </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                <tr class="tr-search"><th></th>
                <?php 
		//foreach ($fieldList as $id => $value)
                for ($id=1;$id<$fieldListLegth-1; $id++)
		{ 
                    echo "<th class=\"th-search\"><input type=\"text\" class=\"form-control w-100\" placeholder=\"Wyszukaj\" value=\"\"/></th>";
                }
                ?>   
                <th></th>
                </tr>
            </tfoot>
            </table>
        </div>
    </div>
</div>
<!-- ADAPTED MODAL -->
<div class="modal fade" id="adaptedModal" tabindex="-1" role="dialog" aria-labelledby="adaptedModalContent" aria-hidden="true"><div class="modal-dialog modal-lg" role="document"><div class="modal-content"><div class="modal-header" id="adaptedModalBgTitle"><h2 class="modal-title" id="fieldModalLabel"><span class="text-white" id="adaptedModalTitle"></span></h2><button type="button" class="close mr-0" data-dismiss="modal" aria-label="Close" onclick=""><i class="fa fa-times" aria-hidden="true"></i></button></div><div class="modal-body" id="ProjectAdaptedBodyContent"><div class="row"><div class="col-12" id="adaptedModalBodyTitle"></div></div><div class="row"><div class="col-12" id="adaptedDynamicData"></div></div><div class="row border-top mt-2 mb-2"><div class="col-12" id="adaptedButtonsBottom"></div></div><div class="row"><div class="alert alert-danger col-12 d-none" id="errDiv-Adapted-overall"></div></div><div class="form-group row d-none" id="loadGif"><div class="col-2 mb-0 pb-0 mt-0 pt-0"><center><img class="pt-0 pb-0" src="<?=$url?>gt_utilities/loading_60_60.gif" alt="NoImg" id="imageLoad"/></center></div><div class="col-9 mb-0 pb-0 pt-0 mt-0"><p class="pb-0 mb-0 mt-0 pb-0 pt-0 font-weight-light">Processing...</p></div></div><div class="row" id="adaptedModalBodyExtra"></div></div><div class="modal-footer pt-1 pb-1"><div class="row"><div class="col-12" id="adaptedModalInfo"></div></div></div></div></div></div>
<!-- END ADAPTED MODAL -->
<!-- LEGEND DIV FRAME -->
<div class="modal fade mb-0 pb-0 col-12" id="legendDivFrame"></div>    
<!-- END LEGEND DIV FRAME-->
<div class="modal fade container mb-0 pb-1 pt-1" id="formModalDetail" style=""><form class="form-horizontal"  autocomplete="off" method="POST"  ENCTYPE="multipart/form-data" action="javascript:void(0);" name="postData" ><div class="form-group row mt-2 mb-0 pl-0 pr-0" style="border:0px solid green;" id="formModalDetailFields"></div></form>
</div>
<!-- END FORM TEMPLATE -->
<!-- EMAIL FOOTER -->
<div id="emailFooter" class="modal fade ml-5 pl-5">--<br/><?=$email_footer?></div>
<!-- END EMAIL FOOTER -->
<!-- UPLOAD IMG -->
<div id="uploadImgDiv" style="display: none;"><center><img src="<?=$url?>gt_utilities/loader.gif" alt="NoImg" id="imageLoad"/></center><p style="color:black;font-size:18px;font-weight:normal;"><span id="processingLabel"></span><span id="uploadProgress"></span></p></div>
<!-- END UPLOAD IMG -->
<!-- PROGRESS BAR -->
<div id="progressBar" style="display: none; position: fixed; top: 230px; left: 50%; margin-top: -125px;  margin-left: -146px; ">
    <img src="<?=$url?>gt_utilities/loading-ttcredesign.gif" alt="NoImg" id="imageLoad"/>
</div>
<!-- END PROGRESS BAR -->
<!-- DYNAMIC DATA TABLE -->
<div id="dynamicDataTableDiv" class="w-100"><table class="table table-striped w-100 ml-0 mr-0 table-hover" style="width:100%" id="dynamicDataTable"><thead></thead><tbody></tbody><tfoot></tfoot></table></div>
<!-- END DYNAMIC DATA TABLE -->
<script>window.baseUrl = <?= json_encode($url)?>;</script>