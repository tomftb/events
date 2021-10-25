<body>
<script>window.baseUrl = <?= json_encode($url)?>;</script>
<div class="w-100 " style="margin-top:100px;position:fixed; z-index:996;">
    <div class="row">
        <div class=" col-sm-4" >
        </div>
        <div class=" col-sm-4" >
            <h2 class="text-center mb-3 mt-1 text-dark"><?=$tytul?></h2>
        </div>
        <div class=" col-sm-4" >
            <div class="row float-right mr-4">
            </div>
        </div>
    </div>
    <div class="row">
        <div class=" col-sm-12" >
            <div class="text-center mt-3" > 
                <?php
                foreach ($f as $key => $value)
                {
                   echo '<a href="'.$url.'main/'.$key.'" class="btn btn-outline-dark btn-lg ml-1 " role="button" aria-pressed="true">'.$value.'</a>';
                }
                ?>
            </div> 
        </div>
    </div>
</div>