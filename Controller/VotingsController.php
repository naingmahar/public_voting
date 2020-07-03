<?php
App::uses('PublicVoting2AppController', 'PublicVoting2.Controller');
App::uses('AppController', 'Controller', 'String', 'Utility');
App::uses('LinkedinApi','SSO');

class VotingsController extends PublicVoting2AppController {
    public $components = array('CustomData', 'PublicVoting2.PublicVoting', 'PublicVoting2.AboutPage', 'Auth');
    
    public function beforeFilter() {
        parent::beforeFilter();
        if (ENV_ALLOW_CROSS_ORIGIN == true) {
            $this->response->header('Access-Control-Allow-Origin', '*');
            $this->response->header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
            $this->response->header('Access-Control-Allow-Credentials', 'true');
            $this->response->header('Content-Type', 'application/json');
            $this->response->header('Access-Control-Allow-Headers', '*');
        };
        $this->Auth->allow('index', 'getBasicData', 'getVotingRoundData', 'getCategoryList', 'getSubmissionList', 'submissionDetailList', 'getSubmissionDetailInformation', 'getAnonymousVoterInfo', 'saveVoter', 'saveVotingResult', 'getAboutPage','getLinkedinInfo');
    }

/**
 * Use for showing public voting layout
 */
    public function index(){
        $this->layout = "public_voting";
    }

/**
 * Provides the basic information that will be useful in the whole process of public voting
 */
    public function getBasicData(){
        $PDO = $this->CustomData->getPDOConnectionObj();
        $link =  $this->request->here;
        $link_array = explode('/',$link);
        $path = (isset($link_array[3]) ? $link_array[3] : '');//Take Care! It depends on declared path in routes.php
        $query = "SELECT vr.id AS voting_round_id, vr.event_id, vr.active FROM `voting_rounds` AS `vr` WHERE vr.url = :url";
        $sth = $PDO->prepare($query);
        $sth->bindValue(":url", $path, PDO::PARAM_STR);
        $sth->execute();
        $data = $sth->fetch(PDO::FETCH_ASSOC);

        if ($data == false) {
            return $this->responseFail("There is no voting round for this URL");
        }
        else {
            $voting_round_status = $this->PublicVoting->isVotingRoundClosed($path);
            $data['isVotingRoundClosed'] = $voting_round_status;
            return $this->responseSend($data);
        }
    }

/**
 * Provides data relating with the specific voting round
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 */
    public function getVotingRoundData($event_id = null, $voting_round_id = null){
        if (isset($event_id) && isset($voting_round_id)) {
            $PDO = $this->CustomData->getPDOConnectionObj();
            $main_sql = "SELECT vr.title, vr.start_date, vr.end_date, vr.active, vr.event_id, vr.text_color, vr.time_bgcolor, vr.shareicon_color, vr.url, vr.allow_filter_type, vr.allow_login_type, vr.show_duration, vr.show_label, vr.show_sharethis, vr.show_time_left, vr.show_title, vr.show_voting_status, vt.voting_type, vt.voting_type_detail, e.banner  
            FROM `voting_rounds` AS `vr` 
            INNER JOIN `events` AS `e` ON e.id = vr.event_id AND e.id = :event_id 
            INNER JOIN `voting_types` AS `vt` ON vt.voting_round_id = vr.id
            WHERE vr.id = :voting_round_id";

            $sth = $PDO->prepare($main_sql);
            $sth->bindValue(":event_id", $event_id, PDO::PARAM_INT);
            $sth->bindValue(":voting_round_id", $voting_round_id, PDO::PARAM_INT);
            $sth->execute();
            $data = $sth->fetch(PDO::FETCH_ASSOC);
            
            /*Front end wants to get "show_voting_status" as integer data type*/
            if (isset($data['show_voting_status'])) {
                $data['show_voting_status'] = (int)$data['show_voting_status'];
            }
            return $this->responseSend($data);
        }
        else {
            return $this->responseFail('Pass the correct number of parameters to access this function');
        }
    }

/**
 * Retrieves the list of award categories which will be used in current voting round.
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 */
    public function getCategoryList($event_id = null, $voting_round_id = null) {
        if (isset($event_id) && isset($voting_round_id)) {
            $PDO = $this->CustomData->getPDOConnectionObj();
            $main_sql = "
                        SELECT `ec`.`id` AS `event_category_id`, `ec`.`value` AS `value` FROM `voting_shortlists` AS `vs`
                        INNER JOIN `submissions` AS `s` ON `s`.`id` = `vs`.`submission_id`
                        INNER JOIN `eventcategories` AS `ec` ON `ec`.`id` = `s`.`eventcategory_id`
                        WHERE `voting_round_id` = :voting_round_id AND `ec`.`event_id` = :event_id
                        GROUP BY `ec`.`id`;";
            $sth = $PDO->prepare($main_sql);
            $sth->bindValue(":voting_round_id", $voting_round_id, PDO::PARAM_INT);
            $sth->bindValue(":event_id", $event_id, PDO::PARAM_INT);
            $sth->execute();
            $datalist = $sth->fetchAll(PDO::FETCH_ASSOC);
            return $this->responseSend($datalist);
        }
        else {
            return $this->responseFail('Pass the correct number of parameters to access this action');
        }
    }

/**
 * Generate list of shortlisted submissions
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 */
    public function getSubmissionList($event_id = null, $voting_round_id = null){
        if (isset($event_id) && isset($voting_round_id)) {
            $data = $this->request->data;
            $current_voter_id = isset($data['voter_id']) ? $data['voter_id'] : "";
                
            /*Declaring the tables that will be used in queries*/
            $table_vs = "voting_shortlists";
            $table_r = "voting_results";
            $submission_master_table = "submission_master_".$event_id;
            $entrant_master_table = "entrant_master_".$event_id;
            if(!($this->__checkTemptableExistence($submission_master_table, $entrant_master_table))){
                return $this->responseFail("Data is not ready.Please rebuild the data.");
            }

            $voting_field_data_object_type = $this->__getVotingField($voting_round_id);

            $PDO = $this->CustomData->getPDOConnectionObj();
            $query_for_detail_field = $this->__getDetailField($voting_field_data_object_type);
            $video_image_field_count = $query_for_detail_field['video_image_field_count'];
            $query_combined_string = $query_for_detail_field['query_combined_string'];
            $text_field = $query_for_detail_field['text_field'];

            if (!empty($current_voter_id)) {
                $current_voter_id = $this->PublicVoting->decryptData($current_voter_id);
            }

            if (!empty($current_voter_id)) {
                $status = "mark, SUM(mark) AS `total_mark`, ";
                $sub_field = "IFNULL(v.mark, 0) AS `mark`,
                            IFNULL(total_mark, 0) AS `total_mark`,";
                $where_condition = " voter_id = ". $current_voter_id ."
                                AND voting_round_id = ".$voting_round_id;
            }
            else {
                $status = "SUM(mark) AS `total_mark`,";
                $sub_field = "0 AS `mark`,
                            v.total_mark,";            
                $where_condition = " voting_round_id = ".$voting_round_id;
            }

            $main_sql = "SELECT
                            vs.submission_id,
                            $sub_field
                            s.title,
                            s.category,
                            s.eventcategory_id,
                            $query_combined_string
                        FROM
                            $table_vs AS `vs` 
                            INNER JOIN
                                $submission_master_table AS `s` 
                                ON vs.submission_id = s.submission_id 
                                AND voting_round_id = $voting_round_id 
                            INNER JOIN
                                $entrant_master_table AS `e` 
                                ON s.entrantdetail_id = e.entrantdetail_id 
                            LEFT JOIN
                                (";
                                
                            if (!empty($current_voter_id)) {
                                $main_sql .= "
                                SELECT t.mark, m.total_mark, m.submission_id FROM (
                                    (
                                    SELECT mark, 0 AS total_mark, submission_id
                                    FROM voting_results  
                                    WHERE voter_id = ".$current_voter_id." AND voting_round_id = ".$voting_round_id."
                                        ) AS `t`
                                    RIGHT JOIN
                                    (
                                    SELECT 0 As mark, SUM(mark) AS total_mark, submission_id 
                                    FROM voting_results
                                    WHERE voting_round_id = ".$voting_round_id."
                                    GROUP BY submission_id 
                                        ) AS `m`
                                    ON (t.submission_id = m.submission_id)
                                )";
                            }
                            else {
                                $main_sql .= "
                                    SELECT
                                    $status
                                    submission_id 
                                FROM
                                    $table_r 
                                WHERE
                                    $where_condition
                                GROUP BY submission_id
                                ";
                            }

            $main_sql .= " )
                            AS `v` 
                            ON s.submission_id = v.submission_id";
            $no_filter_sth = $PDO->prepare($main_sql);
            $no_filter_sth -> execute();
            $shortlisted_submission = $no_filter_sth -> fetchAll(PDO::FETCH_ASSOC);
            $total_shortlisted_submission = count($shortlisted_submission);

            if (!empty($data['search'])) {
                $search_key = array('search_key' => $data['search'], 'text_field' => $text_field);
            }
            else {
                $search_key = '';
            }
            $filters = array(
                'category' => (!empty($data['category'])) ? $data['category'] : '',
                'search' => $search_key,
                'sort' => (!empty($data['sort'])) ? $data['sort'] : '',
                'start' => (!empty($data['start'])) ? $data['start'] : '',
                'limit' => (!empty($data['limit'])) ? $data['limit'] : ''
            );
            $main_sql = $this->PublicVoting->submissionListAdditionalFilter($main_sql, $filters);

            $sth = $PDO->prepare($main_sql);
            $sth -> execute();
            $data = $sth -> fetchAll(PDO::FETCH_ASSOC);
            
            /*Getting total number of shortlisted submissions*/
            $number_of_shortlisted_submissions = count($data);

            $type = $voting_field_data_object_type->type_field;
            $img_type_field = $voting_field_data_object_type->imgtype_field;
            $voting_object_type = array("type_field" => $type, "img_type_field" => $img_type_field);

            for ($i=0; $i < count($data); $i++) { 
                for ($j=0; $j < $video_image_field_count; $j++) { 
                    $data2convert[] = $data[$i]['video_image_field_'.$j];
                }
            }

            $data = $this->__getVideoImageProcessing($event_id, $data, $video_image_field_count, $voting_object_type);
            
            $output_array['success'] = true;
            $output_array['total_shortlisted_submission'] = $total_shortlisted_submission;
            $output_array['number_of_shortlisted_submissions'] = $number_of_shortlisted_submissions;
            $output_array['submissions'] = $data;

            $this->responseSend($output_array);
        }
        else {
            return $this->responseFail('Pass the correct number of parameters to access this action');
        }
    }

/**
 * Checks whether submission and entrant temp tables exist in database
 *
 * @param $submission_master_table - name of submission temp table.
 * @param $entrant_master_table - name of entrant temp table.
 */
    private function __checkTemptableExistence($submission_master_table, $entrant_master_table){
        $PDO = $this->CustomData->getPDOConnectionObj();
        $submission_table_status = null;
        $entrant_table_status = null;
        if (isset($submission_master_table)) {
            $main_sql = "SELECT 1 FROM ".$submission_master_table." LIMIT 1";
            $sth = $PDO->prepare($main_sql);
            $sth->execute();
            $data = $sth->fetch(PDO::FETCH_ASSOC);    
            $submission_table_status = ($data != FALSE) ? true : false;
        }
        if (isset($entrant_master_table)) {
            $main_sql = "SELECT 1 FROM ".$entrant_master_table." LIMIT 1";
            $sth = $PDO->prepare($main_sql);
            $sth->execute();
            $data = $sth->fetch(PDO::FETCH_ASSOC);    
            $entrant_table_status = ($data != FALSE) ? true : false;
        }
        return ($submission_table_status && $entrant_table_status) ? true : false;
    }

/**
 * Show the description of voting round
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 */
    public function getAboutPage($event_id = null, $voting_round_id = null){
        $this->autoRender = false;
        $aboutPageData = $this->AboutPage->getAboutPage($event_id, $voting_round_id);
        return $this->responseSend($aboutPageData);
    }

/**
 * Gives the voting fields for specific voting round
 *
 * @param $voting_round_id - ID of the voting round.
 */
    private function __getVotingField ($voting_round_id = null){
        if (isset($voting_round_id)) {
            $PDO = $this->CustomData->getPDOConnectionObj();
            $query = "SELECT * FROM voting_fields WHERE voting_round_id = ".$voting_round_id;
            $sth = $PDO->prepare($query);
            $sth->execute();
            $voting_field_data = $sth->fetch(PDO::FETCH_ASSOC);

            if (!$voting_field_data) {
                return $this->responseFail('There is no voting round for your request');
            }
            $voting_field_data_object_type = json_decode($voting_field_data['data'], false);
            return $voting_field_data_object_type;
        }
        else {
            return "Pass the correct number of parameters to process this action";
        }
    }

/**
 * Preparing query's column based on the voting fields
 *
 * @param $voting_field_data_object_type - Data relating with voting fields for specific voting round.
 */
    private function __childDetailField($voting_field_data_object_type){
        $video_image_field_count = 0;
        $entrant_array = [];
        $submission_array = [];
        $detail_field_container = [];
        foreach ($voting_field_data_object_type->video_image_field AS $key => $value) {
            if ($value->attribute_type == "1") {
                $submission_array[] = "s.fld".$value->id." AS `video_image_field_".$key."`";
            }
            else {
                $entrant_array[] = "e.flde".$value->id." AS `video_image_field_".$key."`";
            }
            $video_image_field_count++;
        }
        
        /*Getting Voting Text Field*/
        if ($voting_field_data_object_type->text_field->attribute_type == "0") {
            $entrant_array[] = "e.flde". $voting_field_data_object_type->text_field->id ." AS `text_field`";
            $text_field = "e.flde".$voting_field_data_object_type->text_field->id;//This will be used in "Search" Query Portion
        }
        else {
            $submission_array[] = "s.fld". $voting_field_data_object_type->text_field->id . " AS `text_field`";
            $text_field = "s.fld".$voting_field_data_object_type->text_field->id;
        }

        foreach ($voting_field_data_object_type->detail_field as $key => $value) {
            if ($value->attribute_type == '0') {
                $detail_field_container[] = "e.flde". $value->id . " AS '". $value->id . "'";
            }
            else {
                $detail_field_container[] = "s.fld". $value->id . " AS '". $value->id . "'";
            }
        }
        $entrant_submission_array = array("detail_field_container" => $detail_field_container, "entrant_array" => $entrant_array, "submission_array" => $submission_array, "video_image_field_count" => $video_image_field_count, "text_field" => $text_field);
        return $entrant_submission_array;
    }

/**
 * Returns the useful and formatted version of voting field data.
 *
 * @param $voting_field_data_object_type - Data relating with voting fields for specific voting round.
 */
    private function __getDetailField ($voting_field_data_object_type){
        /*  Declaration
            --------------------
            attribute_type = 1 (Submission => eventattributes)
            attribute_type = 0 (Entrant => entrantattributes)*/
        $childDetailField = $this->__childDetailField($voting_field_data_object_type);
        if (!empty($childDetailField)) {
            $detail_field_container = $childDetailField['detail_field_container'];
            $submission_array = $childDetailField['submission_array'];
            $entrant_array = $childDetailField['entrant_array'];
            $video_image_field_count = $childDetailField['video_image_field_count'];
            $text_field = $childDetailField['text_field'];
        }

        $query_combined = array();
        if (!empty($entrant_array)) {
            $query_combined = $entrant_array;
        }
        if (!empty($submission_array)) {
            $query_combined = array_merge($entrant_array, $submission_array);
        }
        /*Converting query array to string*/
        $query_combined_string = "";
        $query_combined_string = implode(", ", $query_combined);

        $query_return = array("query_combined_string" => $query_combined_string,
                            "detail_field_container" => $detail_field_container,
                            "video_image_field_count" => $video_image_field_count,
                            "text_field" => $text_field);
        return $query_return;
    }

/**
 * Accept raw URL format of user's uploaded image or video file and reformat it, so that it can be used to show thumbnail and transform file extension appropriately.
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $data - Data relating with each submission (especially from file upload section).
 * @param $video_image_field_count - Number of feature (file upload) fields for current voting round. 
 * @param $voting_object_type - whether "image" or "video", whether "thumbnail" or "original".
 */
    private function __getVideoImageProcessing($event_id = null, $data = null, $video_image_field_count = null, $voting_object_type = null){
        
        $type_field = $voting_object_type['type_field'];
        for ($i=0; $i < count($data); $i++) { 
            for ($j=0; $j < $video_image_field_count; $j++) { 
                if ($data[$i]['video_image_field_'.$j] == "") {
                    $data[$i]['video_image'][$j]['video_image_field_original'] = NO_IMAGE;
                    $data[$i]['video_image'][$j]['video_image_field_thumbnail'] = NO_IMAGE_THUMBNAIL;
                    $data[$i]['video_image'][$j]['is_no_image'] = true;
                }
                else {
                    $uploaded_file = $data[$i]['video_image_field_'.$j];
                    $start_parenthesis = strpos ($uploaded_file, '(');
                    $end_parenthesis = strpos ($uploaded_file, ')');
                    if ($start_parenthesis>0 && $end_parenthesis>0) {
                        $video_image_field = substr($uploaded_file, 0, $start_parenthesis);
                        $video_image_field_original = $video_image_field;  
                    }

                    $video_image_field_info = pathinfo($video_image_field);

                    /*If the user uploads a video file which is not "mp4" format, the extension of this video file will be changed to .mp4*/
                    if ($type_field == "video") {
                        if (isset($video_image_field_info['extension']) && $video_image_field_info['extension'] != "mp4" && $video_image_field_info['extension'] != "MP4") {
                            /*Video Files which are not .mp4 files are put in 'transcoder/video/' path for transcoding process*/
                            //$video_image_field_original = DIRNAME.$event_id."/".$video_image_field_info["filename"].".mp4";

                            $video_image_field_original = str_replace("uploads/", "uploads/transcoder/video/", $video_image_field);

                            $video_image_field_original = str_replace($video_image_field_info['extension'], "mp4", $video_image_field_original);
                        
                            $thumbnail_path = str_replace("uploads/", "uploads/transcoder/thumbnail/", $video_image_field);
                            
                        }else{
                            $thumbnail_path = str_replace("uploads/", "thumbnails/uploads/", $video_image_field); 
                        }
                    }else{
                        $thumbnail_path = str_replace("uploads/", "thumbnails/uploads/", $video_image_field);
                    }
                   
                    $thumbnail_path = $this->PublicVoting->getThumbnail($thumbnail_path, ".".$video_image_field_info['extension']);
                    
                    $data[$i]['video_image'][$j]['video_image_field_original'] = $video_image_field_original;
                    $data[$i]['video_image'][$j]['video_image_field_thumbnail'] = $thumbnail_path;
                }    
            }
            $data[$i]['type'] = $type_field;
            $data[$i]['imgtype'] = $voting_object_type['img_type_field'];
        }
        return $data;
    }

    /*****************************************************************************************/
/**
 * If the voter logs in as "anonymous", the facilities which can make this user as a legal one will be provided.
 */  
    public function getAnonymousVoterInfo(){
        $this->autoRender = false;
        if ($this->request->is('POST')) {
            $data4anonymous = array(
                'first_name' => '',
                'last_name' => '',
                'email' => String::uuid(),
                'referer' => 'anonymous'
            );
            return $this->responseSend($data4anonymous);
        }
    }

/**
 * Save the basic information of voter.
 */
    public function saveVoter(){
        $this->autoRender = false;
        if ($this->request->is('POST') || $this->request->is('OPTIONS')) {
            $data = $this->request->data;
            if (!empty($data['email'])) {
                $this->loadModel('Voter');
                $options = array('conditions' => array('email' => $data['email']));
                $result = $this->Voter->find('first', $options);
                if (count($result) == 0) {
                    $this->Voter->create();
                    $data2save = array(
                                    'first_name' => $data['first_name'],
                                    'last_name' => $data['last_name'],
                                    'email' => $data['email'],
                                    'referer' => $data['referer']
                                );
                    if ($this->Voter->save($data2save)) {
                        $voter_id = $this->PublicVoting->encryptData($this->Voter->getLastInsertID());
                        return $this->responseSend($voter_id);
                    }
                    else {
                        return $this->responseFail('Error occurred while saving voter information');
                    }
                }
                else {
                    $existed_voter_id = $this->PublicVoting->encryptData($result['Voter']['id']);
                    return $this->responseSend($existed_voter_id);
                }
            }
            else {
                return $this->responseFail("This voter cannot be saved!");
            }
        }
        else {
            return $this->responseFail("You are not allowed to vote");
        }
    }

/**
 * Retrieves the previous and next submission IDs based on current submission
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 * @param $submission_id - ID of the submission.
 */
    public function submissionDetailList($event_id = null, $voting_round_id = null, $submission_id = null){
        $this->autoRender = false;
        $PDO = $this->CustomData->getPDOConnectionObj();
        $sql = "SELECT v_s.submission_id
                FROM voting_shortlists AS v_s, submission_master_".$event_id." AS s
                WHERE v_s.submission_id = s.submission_id AND v_s.voting_round_id = ".$voting_round_id;
        $sth = $PDO->prepare($sql);
        $sth->execute();
        $retrieved_data = $sth->fetchAll(PDO::FETCH_ASSOC);
        $prev_submission_id = null;
        $next_submission_id = null;
        if (!empty($submission_id)) {
            foreach ($retrieved_data as $key => $value) {
                if ($submission_id == $value['submission_id']) {
                    if ($key != 0) {
                        $prev = $key-1;
                        $prev_submission_id = $retrieved_data[$prev]['submission_id'];
                    }
                    else{
                        $prev_submission_id = null;
                    }
                    if ($key != (count($retrieved_data)-1)) {
                        $next = $key+1;
                        $next_submission_id = $retrieved_data[$next]['submission_id'];
                    }
                    else {
                        $next_submission_id = null;
                    }
                    break;
                }
            }
            $prev_and_next = array("prev" => $prev_submission_id, "next" => $next_submission_id);
        }
        return json_encode($prev_and_next);
    }

/**
 * Run query to get the detail information (not complete list) of specific submission.
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 * @param $submission_id - ID of the submission.
 * @param $required_field - required columns to run the query
 */
    private function __runQuery ($event_id = null, $voting_round_id = null, $submission_id = null, $required_field = null){
        /*Declaring the tables that will be used in queries*/
        $submission_master_table = "submission_master_".$event_id;
        $entrant_master_table = "entrant_master_".$event_id;

        /*Converting required_field array to string*/
        $required_field_string = "";
        $required_field_string = implode(", ", $required_field);
        $PDO = $this->CustomData->getPDOConnectionObj();
        $main_sql = "SELECT
                        $required_field_string
                    FROM
                        voting_shortlists AS vs 
                        INNER JOIN
                            $submission_master_table AS s 
                            ON vs.submission_id = s.submission_id 
                            AND voting_round_id = $voting_round_id 
                        INNER JOIN
                            $entrant_master_table AS e 
                            ON s.entrantdetail_id = e.entrantdetail_id 
                    WHERE vs.submission_id = ".strip_tags($submission_id);
        $sth = $PDO->prepare($main_sql);
        $sth -> execute();
        $data = $sth -> fetch(PDO::FETCH_ASSOC);
        return $data;
    }

/**
 * Return the names of the detail field items based on the provided IDs of these detail fields.
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $detail_field - IDs which respect to the chosen detail fields while setting up Voting Fields at Voting Round setup.
 */
    private function __getFormField ($event_id = null, $detail_field = null){
        $this->loadModel('Eventattribute');
        $this->loadModel('Entrantattribute');
        for ($i=0; $i < count($detail_field); $i++) { 
            if ($detail_field[$i]->attribute_type == 1) {
                $useModel = "Eventattribute";
            }
            elseif ($detail_field[$i]->attribute_type == 0) {
                $useModel = "Entrantattribute";
            }
            $attributeModel = $this->$useModel->find('list',
                                array(
                                    'conditions' => array(
                                        $useModel.'.id' => $detail_field[$i]->id,
                                        $useModel.'.event_id' => $event_id
                                    )
                                )
                            );
            $formField[] = $attributeModel;
        }
        return $formField;
    }

/**
 * Return the detail information (complete list) of specific submission.
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $voting_round_id - ID of the voting round.
 * @param $submission_id - ID of the submission.
 */
    public function getSubmissionDetailInformation($event_id = null, $voting_round_id = null, $submission_id = null){
        if (isset($event_id) && isset($voting_round_id) && isset($submission_id)) {
            $data = $this->request->data;
            $current_voter_id = isset($data['voter_id']) ? $data['voter_id'] : "";
            $current_voter_id = $this->PublicVoting->decryptData($current_voter_id);
            $voting_field_data_object_type = $this->__getVotingField($voting_round_id);
            $query_for_detail_field = $this->__getDetailField($voting_field_data_object_type);//Calling Function for getting necessary detailed fields
            $video_image_field_count = $query_for_detail_field['video_image_field_count'];
            $query_combined_string = $query_for_detail_field['query_combined_string'];
            $text_field = $query_for_detail_field['text_field'];
            $detail_field_container = $query_for_detail_field['detail_field_container'];
            $normal_field_container = array('vs.submission_id', 's.title', 's.category', $query_combined_string);

            /*Call "runQuery" function for Database Retrieving*/
            $data = $this->__runQuery($event_id, $voting_round_id, $submission_id, $normal_field_container);
            for ($j=0; $j < $video_image_field_count; $j++) { 
                $image_array[] = $data['video_image_field_'.$j];   
            }
            $prev_and_next = json_decode($this->submissionDetailList($event_id, $voting_round_id, $submission_id), true);
            $type_field = $voting_field_data_object_type->type_field;

            $form_value = $this->__getFormField($event_id, $voting_field_data_object_type->detail_field);
            $data['video_image'] = $this->__imageProcessing($event_id, $image_array, $type_field);

            $detail_field_array = null;
            $detail_field_array = $this->__runQuery($event_id, $voting_round_id, $submission_id, $detail_field_container);
            $keys_array = array_keys($detail_field_array);
            for ($i=0; $i < count($keys_array); $i++) { 
                $form_key = $keys_array[$i];
                $result = $form_value[$i][$form_key];
                $form_field_result[$result] = $detail_field_array[$form_key];
            }
            $data['form_fields'] = $form_field_result;
            $data['prev'] = $prev_and_next['prev'];
            $data['next'] = $prev_and_next['next'];
            $data['current_given_mark'] = $this->__isAlreadyVoted($voting_round_id, $current_voter_id, $submission_id);
            $data['total_vote'] = $this->__getTotalVote($voting_round_id, $submission_id);
            $data['custom_setting'] = $this->__getCustomSetting($voting_round_id);
            $this->responseSend($data);
        }
        else {
            return $this->responseFail('Pass the correct number of parameters to access this action');
        }
    }

/**
 * For custom UI layout of public voting
 *
 * @param $voting_round_id - ID of the voting round.
 */
    private function __getCustomSetting ($voting_round_id = null){
        $this->loadModel('VotingSetting');
        $data = $this->VotingSetting->find('first', array(
                        'fields' => array('setting'),
                        'conditions' => array('voting_round_id' => $voting_round_id)
                    )
                );
        $return_result = (!empty($data)) ? $data['VotingSetting']['setting'] : "";
        return $return_result;
    }

/**
 * Check whether the voter has submitted vote for a speficic submission
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $voter_id - ID of current login voter.
 * @param $submission_id - ID of the submission.
 */
    private function __isAlreadyVoted($voting_round_id = null, $voter_id = null, $submission_id = null){
        $this->autoRender = false;
        $current_voter_id = $voter_id;
        if (empty($current_voter_id)) {
            return '';
        }
        $this->loadModel('VotingResult');
        $data = $this->VotingResult->find(
                    'first',
                    array(
                        'fields' => array('mark'),
                        'conditions' => array(
                            'voting_round_id' => $voting_round_id, 'voter_id' => $current_voter_id,
                            'submission_id' => $submission_id
                        )
                    )
                );
        $current_given_mark = (count($data)>0) ? (int)$data['VotingResult']['mark'] : '';
        return $current_given_mark;
    }

/**
 * Number of votes for specific submission at specific voting round
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $submission_id - ID of the submission.
 */
    private function __getTotalVote($voting_round_id = null, $submission_id = null){
        $this->autoRender = false;
        $this->loadModel('VotingResult');
        $zero_vote_count = 0;
        $total = $this->VotingResult->find('count',
                    array(
                        'conditions' => array(
                            'voting_round_id' => $voting_round_id,
                            'submission_id' => $submission_id
                        )
                    )
                );
        $total_vote = ($total > 0)? $total : $zero_vote_count;
        return $total_vote;
    }

/**
 * Generating thumbnails and changing of file extension.
 *
 * @param $event_id - ID of the event where voting round was created.
 * @param $image_array - Array of Image URL
 * @param $type_field - Whether "video" or "image" or others
 */
    private function __imageProcessing($event_id = null, $image_array = null, $type_field = null){
        
        if (count($image_array) > 0) {
            for ($i=0; $i < count($image_array); $i++) { 
                if($image_array[$i] == "" || empty($image_array[$i])){
                    $data[$i]['video_image_field_original'] = NO_IMAGE;
                    $data[$i]['video_image_field_thumbnail'] = NO_IMAGE_THUMBNAIL;
                    $data[$i]['is_no_image'] = true;
                }
                else {
                    $uploaded_file = $image_array[$i];
                    $start_parenthesis = strpos ($uploaded_file, '(');
                    $end_parenthesis = strpos ($uploaded_file, ')');
                    if ($start_parenthesis>0 && $end_parenthesis>0) {
                        $video_image_field = substr($uploaded_file, 0, $start_parenthesis);
                        $video_image_field_original = $video_image_field;  
                    }
                    $video_image_field_info = pathinfo($video_image_field);

                    /*If the user uploads a video file which is not "mp4" format, the extension of this video file will be changed to .mp4*/
                    if ($type_field == "video") {
                        if (isset($video_image_field_info['extension']) && $video_image_field_info['extension'] != "mp4" && $video_image_field_info['extension'] != "MP4") {
                            $video_image_field_original = str_replace("uploads/", "uploads/transcoder/video/", $video_image_field);

                            $video_image_field_original = str_replace($video_image_field_info['extension'], "mp4", $video_image_field_original);
                        
                            $thumbnail_path = str_replace("uploads/", "uploads/transcoder/thumbnail/", $video_image_field);
                        }else{
                            $thumbnail_path = str_replace("uploads/", "thumbnails/uploads/", $video_image_field); 
                        }
                    } else{
                         $thumbnail_path = str_replace("uploads/", "thumbnails/uploads/", $video_image_field); 
                    }                   
                  
                    $thumbnail_path = $this->PublicVoting->getThumbnail($thumbnail_path, ".".$video_image_field_info['extension']);
                    
                    $data[$i]['video_image_field_original'] = $video_image_field_original;
                    $data[$i]['video_image_field_thumbnail'] = $thumbnail_path;
                }    
            }
        }
        return $data;
    }

/**
 * Save the mark given by voter
 */
    public function saveVotingResult(){
        $this->autoRender = false;
        $data = $this->request->data;

        $voting_round_id = $data['voting_round_id'];
        $voter_id = $this->PublicVoting->decryptData($data['voter_id']);
        $submission_id = $data['submission_id'];
        $mark = $data['mark'];
        /* Checking whether the voter ID is authorized or not  */
        if ($this->PublicVoting->checkVoterExistence($voter_id) == false) {
            return $this->responseFail("Unauthorized Voter");
        }

        $voting_type = $this->PublicVoting->getVotingType($voting_round_id);//To get the voting type
        $voting_type_detail = $this->__checkMaximumVoteLimit($voting_round_id, $voting_type);

        if ($voting_type == "RATING") {
            $maximum_point = $voting_type_detail['maximum_point'];
            $minimum_point = $voting_type_detail['minimum_point'];
            if ($mark<$minimum_point || $mark>$maximum_point) {
                return $this->responseFail("Your vote cannot be saved !");
            }
        }

        $max_vote = $voting_type_detail['maximum_selection'];
        if (isset($voting_type_detail['max_select_per_category']) && $voting_type_detail['max_select_per_category']) {//Maximum Selection per Category
            $status = $this->__getCurrentVote($voting_round_id, $voter_id, $submission_id, $voting_type_detail['max_select_per_category']);
        }
        else {
            $status = $this->__getCurrentVote($voting_round_id, $voter_id, $submission_id);
        }
        
        $currentVoteCount = $status['currentVoteCount'];
        $checkNewOrExisted = $status['checkNewOrExisted'];
        if ($currentVoteCount < $max_vote || $checkNewOrExisted > 0) {
            $this->loadModel('VotingResult');
            $checkExistence = $this->VotingResult->find('first', array(
                                    'recursive' => -1,
                                    'conditions' => array(
                                        'voting_round_id' => $voting_round_id,
                                        'voter_id' => $voter_id,
                                        'submission_id' => $submission_id
                                    )
                                ));
            if (count($checkExistence) <= 0) {
                $data2save = array(
                    'voting_round_id' => $voting_round_id,
                    'submission_id' => $submission_id,
                    'voter_id' => $voter_id,
                    'mark' => $mark
                );
            }
            else {
                if ($voting_type == "SELECTION") {
                    $this->VotingResult->deleteAll(array(
                        'voting_round_id' => strip_tags($voting_round_id),
                        'submission_id' => strip_tags($submission_id),
                        'voter_id' => strip_tags($voter_id)), false);
                    $total_vote = $this->__getTotalVote($voting_round_id, $submission_id);
                    return $this->responseSend(array("success" => true, "total_vote" => $total_vote));
                }
                else {
                    $this->VotingResult->id = $checkExistence['VotingResult']['id'];
                    $this->VotingResult->voting_round_id = $checkExistence['VotingResult']['voting_round_id'];
                    $this->VotingResult->voter_id = $checkExistence['VotingResult']['voter_id'];
                    $this->VotingResult->submission_id = $checkExistence['VotingResult']['submission_id'];
                    if ($mark == 0) {//For Toggle Clicking of one button in Yes/No Vote
                        $this->VotingResult->deleteAll(array(
                            'voting_round_id' => strip_tags($voting_round_id),
                            'submission_id' => strip_tags($submission_id),
                            'voter_id' => strip_tags($voter_id)), false);
                        $total_vote = $this->__getTotalVote($voting_round_id, $submission_id);
                        return $this->responseSend(array("success" => true, "total_vote" => $total_vote));
                    }
                    $data2save = array('mark' => $mark);
                }
            }
            if ($this->VotingResult->save($data2save)) {
                $total_vote = $this->__getTotalVote($voting_round_id, $submission_id);
                return $this->responseSend(array("success" => true, "total_vote" => $total_vote));
            }
            else {
                return $this->responseFail("Your vote cannot be saved !");
            }
        }
        else {
            return $this->responseFail("You have reached maximum vote limit.");
        }
    }

/**
 * Check Maximum Vote Limit for specific voting round 
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $voting_type - Voting Type of voting round.
 * @return For rating vote, "maximum vote count, maximum point and minimum point". Others, "maximum vote count" will be returned.
 */
    private function __checkMaximumVoteLimit($voting_round_id = null, $voting_type = null){
        $this->loadModel('VotingType');
        $data = $this->VotingType->find('first', array(
            'fields' => array('voting_type_detail'),
            'conditions' => array('voting_round_id' => $voting_round_id),
            'recursive' => -1
            )
        );
        if (count($data)>0) {
            $array = json_decode($data['VotingType']['voting_type_detail']);
            $maximum_selection = $array->maximum_selection;

            if ($voting_type == "RATING") {
                $maximum_point = $array->max_points;
                $minimum_point = $array->min_points;
                $data2pass = array("maximum_selection" => $maximum_selection, "maximum_point" => $maximum_point, "minimum_point" => $minimum_point);
            }
            else {
                $data2pass = array("maximum_selection" => $maximum_selection);
            }
            if (isset($array->limit_by_category) && $array->limit_by_category == "1") {
                $data2pass['max_select_per_category'] = true;
            }
            return $data2pass;
        }
        else {
            return $this->responseFail("Voting Type Detail cannot be accessed");
        }
    }

/**
 * This function will handle two operations.
 * The first one is to get the number of vote counts per specific voter.
 * Another one is to check whether the current click of the vote button is just "toggle (vote/unvote)" or new one.
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $voter_id - ID of current login voter.
 * @param $submission_id - ID of the submission.
 * @param $max_select_per_category - Whether maximum selection is based on category
 */
    private function __getCurrentVote($voting_round_id = null, $voter_id = null, $submission_id = null, $max_select_per_category = null){
        /*maximum vote limit by category*/
        if (isset($max_select_per_category) && $max_select_per_category) {
            $event_category_id = $this->PublicVoting->getEventCategoryIdByVotingRoundId($voting_round_id, $submission_id)->id;
            $currentVoteCount = $this->__getMaxPerCategory($voting_round_id, $voter_id, $event_category_id);
            $checkNewOrExisted = $this->__getMaxPerCategory($voting_round_id, $voter_id, $event_category_id, $submission_id);
        }
        else {/*maximum vote limit by voting round*/
            $currentVoteCount = $this->__getMaxPerRound($voting_round_id, $voter_id);
            $checkNewOrExisted = $this->__getMaxPerRound($voting_round_id, $voter_id, $submission_id);   
        }
        $status = array("currentVoteCount" => $currentVoteCount, "checkNewOrExisted" => $checkNewOrExisted);
        return $status;
    }

/**
 * To get current vote count and to check whether toggle vote or new vote (Per Voting Round)
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $voter_id - ID of current login voter.
 * @param $submission_id - ID of the submission.
 */
    private function __getMaxPerRound($voting_round_id = null, $voter_id = null, $submission_id = null){
        $conditions = array('voting_round_id' => $voting_round_id,
                            'voter_id' => $voter_id);
        if (isset($submission_id)) {
            $conditions['submission_id'] = $submission_id;
        }
        $this->loadModel('VotingResult');
        $result = $this->VotingResult->find('count', array(
                                    'recursive' => -1,
                                    'conditions' => $conditions
                                ));
        return $result;
    }

/**
 * To get current vote count and to check whether toggle vote or new vote (Per Category)
 *
 * @param $voting_round_id - ID of the voting round.
 * @param $voter_id - ID of current login voter.
 * @param $event_category_id - category ID upon which the maximum selection will calculate.
 * @param $submission_id - ID of the submission.
 */
    private function __getMaxPerCategory($voting_round_id = null, $voter_id = null, $event_category_id = null, $submission_id = null){
        $conditions = array('VotingResult.voting_round_id' => $voting_round_id,
                        'VotingResult.voter_id' => $voter_id,
                        's.eventcategory_id' => $event_category_id);
        if (isset($submission_id)) {
            $conditions['VotingResult.submission_id'] = $submission_id;
        }
        $this->loadModel('VotingResult');
        $result = $this->VotingResult->find('count', array(
                        'joins' => array(
                            array(
                                'table' => 'submissions',
                                'alias' => 's',
                                'type' => 'INNER',
                                'conditions' => array(
                                    'VotingResult.submission_id=s.id'
                                )
                            )
                        ),
                        'conditions' => $conditions,
                        'fields' => array('VotingResult.id')
                    ));
        return $result;
    }

    public function getLinkedinInfo(){

         $this->autoRender = false;
        $data = $this->request->data;
               

        $linkedin_obj = new LinkedinApi();

        /*$token = "AQU2l04zcDoaVEvdr8xSUiubFBo7kfQcn9IoZPsu-PIjZaY4MgZtgLKgQUbcmI9XWFJ3jpLXiuQpSHnVKqcbEtgccngZrTVWOPinNQqUHBsWbusijcWdVMOQttnsbqBVJdpz6MWgJZ7hJESfh3H87R8cfGoEWk4fp2CK6JYLrLbX9pvKmovGKd7y2DATEmFmUlfsqreCXktBgF6KBwnKrl3BlsdFqbU_Ex8u66MpbmDpht5fyUI55rz3x5tbHwHltkUee5u4YIR__oRY-VCK1Dk6xi0J_aD9zDZaXri73JtpEtaSYyiGax-uO0F9gNATf0wXD5Di8OQakbIEcf_JQ9s3uxmfng";*/

        $me = json_decode($linkedin_obj->apiCall("GET","me", $data["token"]),true);
        $email = json_decode($linkedin_obj->apiCall("GET","email", $data["token"]),true);
        
        $user_info["id"] = $data["id"];
        $user_info["picture"] = "";
        $user_info["thumbnail"] = "" ;
        

        if(isset($me)){
            $user_info["first_name"] = isset($me["localizedFirstName"]) ? $me["localizedFirstName"] : "";
            $user_info["last_name"] = isset($me["localizedLastName"]) ? $me["localizedLastName"] : "";
            $user_info["name"] = $user_info["first_name"]." ". $user_info["last_name"];
        }
        if(isset($email["elements"])){
            $user_info["email"] = isset($email["elements"][0]["handle~"]["emailAddress"]) ? $email["elements"][0]["handle~"]["emailAddress"] : $data["id"];
        }

      
        $this->responseSend($user_info);
    }
}