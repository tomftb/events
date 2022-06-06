<?php
$username = array(
    'name'        => 'username',
    'id'          => 'username',
    'type'        => 'text',
    'placeholder' => 'Login',
    'value'       => set_value('username'),
    'maxlength'   => 80,
    'size'        => 30,
    'class'   => 'fadeIn second'
);
$password = array(
    'name'        => 'password',
    'id'          => 'password',
    'type'        => 'password',
    'placeholder' => 'Password',
    'value'       => set_value('password'),
    'maxlength'   => $this->config->item('password_max_length', 'tank_auth'),
    'size'        => 30,
    'class'     => 'fadeIn third'
);
?>
<!------ Include the above in your HEAD tag ---------->

<div class="wrapper fadeInDown">
  <div id="formContent">
    <!-- Tabs Titles -->
    <div class="fadeIn zero"><p class="form_title "><?=$app_name?></p></div>
    <!-- Icon -->
    <div class="fadeIn first">
      <img src="<?=$url?>gt_utilities/gt_logo_280_175.png" class="" alt="Logo_Geofizyka_Torun">
    </div>
    <!-- Login Form -->
    <?php echo form_open('login'); ?>
    <?php echo form_input($username) ?>
    <?php echo form_input($password) ?>
      <input type="submit" class="fadeIn fourth" value="Zaloguj się" id="form_submit">
   <?php echo form_close(); ?>
      <?php
      if($err!="")
        {
            echo '<div id="formErrFooter" class="'.$err_bg.'">';
            echo '<div class="text-center text-white p-0 mb-0 gt-font">';
            echo $err;
            echo '</div>';
            echo '</div>';
        }
        ?>
      <!-- FOOTER -->
    <div id="formFooter">
        <p class="text-left text-secondary gt-font">* Logowanie przy użyciu konta MS Active Directory.<br/><span class="text-primary">(Konto wykorzystywane przy logowaniu się do komputera/laptopa)</span></p>
    </div>
  </div>
</div>