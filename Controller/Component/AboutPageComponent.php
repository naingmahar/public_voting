<?php
App::uses('Component', 'Controller');

class AboutPageComponent extends Component {
/**
 * Get description for specific voting round
 * @param $event_id - ID of the event where voting round was created
 * @param $voting_round_id - ID of the voting round
 */    
	public function getAboutPage ($event_id = null, $voting_round_id = null){
        if (isset($event_id) && isset($voting_round_id)) {
            $votingRound = ClassRegistry::init('VotingRound');
            $data = $votingRound->find('first',
                        array(
                            'fields' => array('intro_header', 'intro_desc', 'about_text'),
                            'conditions' => array('event_id' => $event_id, 'id' => $voting_round_id)
                        )
                    );
            if (!empty($data)) {
                $data2send = array(
                            'intro_header' => $data['VotingRound']['intro_header'], 
                            'intro_desc' => $data['VotingRound']['intro_desc'], 
                            'about_text' => $data['VotingRound']['about_text']);
                return $data2send;
            }
            else {
                return "No Data Found";
            }
        }
        else {
            return "Pass the correct number of parameters to process this action";
        }   
    }
}
?>