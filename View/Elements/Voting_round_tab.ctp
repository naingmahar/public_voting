<?php
$i=1;
foreach ($votingRoundData as $votingRound){
    if ($votingRound['Voting_round']['id']==$votingRoundID){
?>
        <li class="active">
            <a href="#">
                Round <?php echo $i; ?>
               
            </a>
        </li>
    <?php }else{?>
        <li>
            <?php $url=ENV_BASE_URL . "public-voting/voting-rounds/" .
                $eventID . "/" . $votingRound['Voting_round']['id'];
            ?>
            <a href="<?php echo $url; ?>">
                Round <?php echo $i; ?>
            </a>
        </li>
    <?php }  //end of "if" ?>
    <?php $i+=1; ?>
<?php }//end of "foreach" loop ?>