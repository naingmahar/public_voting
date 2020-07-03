<?php

//$logo = ($logo ? $logo : '//judgify.me/img/logo.png');

$this->Html->meta("viewport", "width=device-width, initial-scale=1");
$this->Html->meta(array('charset' => 'utf-8'));

$this->Html->css(array('slick','slick-theme'), null,
    array('block' => 'css'));//,
?>


<div id="root"></div>


<?php
    echo $this->Html->script('PublicVoting2.index');
    echo $this->Html->script('PublicVoting2.vendor');
 ?>
