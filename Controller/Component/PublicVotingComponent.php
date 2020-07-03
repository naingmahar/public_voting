<?php
App::uses('Component', 'Controller');

class PublicVotingComponent extends Component {
    var $components = array('EventDateTime', 'CustomData');
/**
 * Change the extension of the file for generating thumbnail
 * @param $thumbnail_path - URL of the file
 * @param $type_field - original file extension of this file (eg: .png)
 */
	public function getThumbnail($thumbnail_path = null, $type_field = null){
	    $formats = array(".mpg",
                        ".mpeg",
                        ".mpeg2",
                        ".mp4",
                        ".MP4",
                        ".mov",
                        ".MOV",
                        ".avi",
                        ".gif",
                        ".jpeg",
                        ".png",
                        ".tif",
                        ".tiff",
                        ".wmf",
                        ".eps",
                        ".bmp");

	    if (in_array($type_field, $formats)) {
            
	    	$thumbnail_path = strpos($thumbnail_path, 'transcoder') !== false ? str_replace($formats, "-00001.jpg", $thumbnail_path) : str_replace($formats, ".jpg", $thumbnail_path);
	    }
	    return $thumbnail_path;
	}

/**
 * Filters for showing submissions according to User's Desirations
 * @param $main_sql - previous query not including filter information
 * @param $filter - array of filters that the user wants
 */
	public function submissionListAdditionalFilter($main_sql = null, $filter = null){
        /*Additional Filters for showing submission grids start here*/

        if (!empty($filter['category'])) {
            $category_filter = strip_tags($filter['category']);
            if ($category_filter != "all") {//"all" stands for Default Chosen "SHOW ALL"
                $main_sql .= " WHERE s.category = '".$category_filter."'";
            }
            $category_selected = true;   
        }
        else {
            $category_selected = false;
        }

        if (!empty($filter['search'])) {
            $search_key = $filter['search']['search_key'];
            $text_field = $filter['search']['text_field'];
            $search_keyword_filter = strip_tags($search_key);
            
            $filter_start = (($category_selected) ? " AND " : " WHERE ");
            
            $main_sql .= $filter_start." (".$text_field." LIKE '%".$search_keyword_filter."%' OR title LIKE '%".$search_keyword_filter."%' OR category LIKE '%".$search_keyword_filter."%')";
        }

        if (!empty($filter['sort'])) {
            switch (strip_tags($filter['sort'])) {
                case "title":
                    $main_sql .= " ORDER BY s.title ASC";
                    break;
                case "latest":
                    $main_sql .= " ORDER BY submission_id DESC";
                    break;
                case "popular":
                    $main_sql .= " ORDER BY total_mark DESC";
                    break;
                default:
                    $main_sql .= " ORDER BY submission_id ASC";
                    break;
            }
        }
        else {
            $main_sql .= " ORDER BY submission_id ASC, s.title ASC";
        }

        if (!empty($filter['start']) || !empty($filter['limit'])) {
            $start = (int)$filter['start'];
            $limit = (int)$filter['limit'];
            $main_sql .= " LIMIT ".$start.", ".$limit;
        }
        return $main_sql;
    }

/**
 * Get the voting type based on voting round ID
 * @param $voting_round_id - ID of the voting round
 */
    public function getVotingType ($voting_round_id = null){
        $votingType = ClassRegistry::init('VotingType');
        $voting_type = $votingType->find('first', array(
                'fields' => array('voting_type'),
                'conditions' => array('voting_round_id' => $voting_round_id),
                'recursive' => -1
            )
        );
        if (!empty($voting_type)) {
            return $voting_type['VotingType']['voting_type'];
        }    
    }

/**
 * Check whether the voter ID is already existed or not
 * @param $voter_id - ID of current voter 
 */
    public function checkVoterExistence ($voter_id = null){
        $voter = ClassRegistry::init('Voter');
        $checkVoterExistence = $voter->find('count', array(
            'conditions' => array('id' => $voter_id),
            'recursive' => -1
        ));
        if ($checkVoterExistence > 0) {
            return true;
        }
        else {
            return false;
        }
    }

/**
 * Check whether the voting round is closed or not
 * @param $path - the last component of the public voting URL
 */
    public function isVotingRoundClosed($path = null){
        $voting_round = ClassRegistry::init('VotingRound');
        $data = $voting_round->find('first',
                    array('conditions' => array('url' => $path),
                            'fields' => array('event_id', 'end_date'))
                );
        $event_id = $data['VotingRound']['event_id'];
        $end_date_timestamp = $data['VotingRound']['end_date'];

        $timezone = $this->EventDateTime->getEventGMTOffsetByEventID($event_id);
        $end_date_utc_timestamp = $end_date_timestamp + ($timezone*60*60);

        date_default_timezone_set("UTC");
        if ($end_date_utc_timestamp < time()) {
            return true;//Yes, voting round is closed now.
        }
        else {
            return false;//No, voting round is still open.
        }
    }

/**
 * Get Event Category ID by Voting Round ID
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $submission_id - ID of the submission.
 */
    public function getEventCategoryIdByVotingRoundId($voting_round_id = null, $submission_id = null){
        $PDO = $this->CustomData->getPDOConnectionObj();
        $query = "SELECT `ec`.id
                    FROM `eventcategories` AS `ec`
                    INNER JOIN `submissions` AS `s` ON `s`.eventcategory_id = `ec`.id
                    INNER JOIN `voting_shortlists` AS `vs` ON `s`.id = `vs`.submission_id AND `vs`.voting_round_id = ".$voting_round_id." AND `vs`.submission_id = ".$submission_id;
        $sth = $PDO->prepare($query);
        $sth->execute();
        $result = $sth->fetch(PDO::FETCH_OBJ);
        return $result;
    }

/**
 * Encrypt voter ID
 * @param $original_text - plain voter ID
 */
    public function encryptData ($original_text = null){
        $plaintext = $original_text;
        $ivlen = openssl_cipher_iv_length($cipher=ENV_PUBLIC_VOTING_ALGORITHM);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $ciphertext_raw = openssl_encrypt($plaintext, $cipher, ENV_PUBLIC_VOTING_KEY, $options=OPENSSL_RAW_DATA, $iv);
        $hmac = hash_hmac('sha256', $ciphertext_raw, ENV_PUBLIC_VOTING_KEY, $as_binary=true);
        $ciphertext = base64_encode( $iv.$hmac.$ciphertext_raw );
        return $ciphertext;
    }

/**
 * Decrypt voter ID
 * @param $encrypted_text - encrypted voter ID
 */
    public function decryptData ($encrypted_text = null){
        $c = base64_decode($encrypted_text);
        $ivlen = openssl_cipher_iv_length($cipher=ENV_PUBLIC_VOTING_ALGORITHM);
        $iv = substr($c, 0, $ivlen);
        $hmac = substr($c, $ivlen, $sha2len=32);
        $ciphertext_raw = substr($c, $ivlen+$sha2len);
        $original_plaintext = openssl_decrypt($ciphertext_raw, $cipher, ENV_PUBLIC_VOTING_KEY, $options=OPENSSL_RAW_DATA, $iv);
        return $original_plaintext;
    }
}
?>