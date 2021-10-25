<?php
$fieldList = array(
    array('ID','ID'),
    array('Nazwa','Nazwa'),
    array('opcj','Opcje')
);
$fieldListLegth=count($fieldList);
?>
<body>
<div class="w-100 " style="margin-top:100px; position:fixed; z-index:996;">
    <div class="row">
        <div class=" col-sm-12">
            <h1 class="text-center mb-3 mt-1 gt-color-orange"><?=$tytul?></h1>
        </div>
    </div>
    <div class="row">
        <div class=" col-12" >
            <table class="table table-striped w-100 ml-0 mr-0" id="dataTable">
                <thead class="bg-secondary text-white">
                <tr>  
                <?php
                    for ($id=0;$id<$fieldListLegth; $id++)
                    {
                        echo "<th id=\"th-data".$id."\" style=\"border:0px solid green;\">".$fieldList[$id][1]."</th>";
                    }
                   ?>
                </tr>
              </thead>
            <tfoot>
              <tr class="tr-search">
              <?php 
                  for ($id=0;$id<$fieldListLegth-1; $id++)
                  {	
                  echo "<th class=\"th-search\" id=\"th-data-sr\" style=\"border:0px solid black;\"><input class=\"form-control w-100\"type=\"text\" id=\"th-search-input".$id."\" placeholder=\"Wyszukaj\" value=\"\"/></th>";
                  }
              ?>
                  <th></th>
              </tr>
            </tfoot>
      <tbody>
      </tbody>
    </table>
        </div>
    </div>
</div>
<!-- ADAPTED MODAL PROJECT -->
<div class="modal fade " id="adaptedModal" tabindex="-1" role="dialog" aria-labelledby="sdaptedModalContent" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header" id="adaptedModalBgTitle">
            <h2 class="modal-title" id="fieldModalLabel">
                <span class="text-white" id="adaptedModalTitle"></span>
            </h2> 
            <button type="button" class="close mr-0" data-dismiss="modal" aria-label="Close" onclick="reloadData()">
                <i class="fa fa-times" aria-hidden="true"></i>
            </button>
            </div>
            <div class="modal-body mb-0 pb-0 pt-0 mt-0" id="ProjectAdaptedBodyContent">
                <div class="form-group row mb-1 pb-0  pt-0 mt-0" id="adaptedModalBodyTitle">
                    <div class=" col-sm-12 mt-4" >
                        <h5 class="modal-title text-center" id="fieldModalLabel"><span id="projectTitle"></span></h5> 
                    </div>
                </div>
                <div class="form-group row mb-0 pb-0">
                    <div class="col-sm-12"  id="adaptedDynamicData">
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <div class=" col-sm-12" id="adaptedButtonsBottom">
                    </div>
                </div>
                <div class=" row mt-1">
                    <div class="alert alert-danger col-sm-12" id="errDiv-Adapted-overall">
                    </div>
                </div>
                <div class="form-group row" id="loadGif" style="display: none; border:0px solid purple;">
                        <div class="col-2 mb-0 pb-0 mt-0 pt-0" style="display: inline-block; border:0px solid green;">
                            <center><img class=" pt-0 pb-0" src="<?=$url?>gt_utilities/loading_60_60.gif" alt="NoImg" id="imageLoad"/></center>
                        </div>
                        <div class="col-9 mb-0 pb-0 pt-0 mt-0"  style="display: inline-block; border:0px solid red;">
                        <p class="pb-0 mb-0 mt-0 pb-0 pt-0 font-weight-light">Processing...</p>
                        </div>
                    </div>
                <div class="form-group row" id="adaptedModalBodyExtra">
                </div>
            </div>
            <div class="modal-footer w-100 mt-1" >
                <div class="w-100 mr-0 ml-0 pr-0 pl-0">
                     <div class="row w-100" id="adaptedModalInfo">      
                     </div>
                </div>
            </div>
        </div>
    </div>
</div>   
<!-- END ADAPTED MODAL PROJECT -->
<!-- LEGEND -->
<div class="modal fade mb-0 pb-0 col-sm-12" id="legendDiv">
    <hr class="w-100"></hr>
        <small class="modal-title text-left text-secondary pl-1 pb-2" id="fieldModalLabel">Legenda:</small> 
            <ul class="text-secondary font-weight-normal small" style="list-style-type:square;">
                <li>A - litera alfabetu, C - cyfra</li>
                <li>Nazwa:</li>
                    <ul style="list-style-type:disc;">
                        <li>może się zacząć A|C</li>
                        <li>może zawierać A,C,/,_,- i spacje</li>
                        <li>może się zakończyć .</li>
                        <li>musi zawierać min 3 znaki</li>
                        <li>nie może być dłuższa niż 30 znaków</li>
                    </ul>
            </ul>
</div>    
<!-- END LEGEND -->
<!-- FORM TEMPLATE -->
<div class="modal fade mb-0" tabindex="-1" role="dialog" id="formModalDetail" aria-hidden="true">
    <div class="modal-body mb-0 pb-1 pt-1">
        <form class="form-horizontal"  autocomplete="off" method="POST"  ENCTYPE="multipart/form-data" action="javascript:void(0);" name="postData">
            <div class="form-group row mt-2 mb-0" id="formModalDetailFields">
            </div>
        </form>
    </div>
</div>
<!-- END FORM TEMPLATE -->
<!-- PROGRESS BAR -->
<div id="progressBar" style="display: none; position: fixed; top: 230px; left: 50%; margin-top: -125px;  margin-left: -146px; ">
    <img src="<?=$url?>gt_utilities/loading-ttcredesign.gif" alt="NoImg" id="imageLoad"/>
</div>
<script type="text/javascript" src="<?=$js3?>"></script>