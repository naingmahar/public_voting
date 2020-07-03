<?php

Router::connect('/public-voting/get-data/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getBasicData'));

Router::connect('/public-voting/voting-round/get-data/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getVotingRoundData'));

Router::connect('/public-voting/voting-round/get-category-list/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getCategoryList'));

Router::connect('/public-voting/voting-round/get-submission-list/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getSubmissionList'));

Router::connect('/public-voting/voting-round/get-submission-detail-information/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getSubmissionDetailInformation'));

Router::connect('/public-voting/voting-round/submission-detail/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'submissionDetailList'));

Router::connect('/public-voting/voting-round/is-already/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'isAlreadyVoted'));

Router::connect('/public-voting/voting-round/anonymous-voter', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getAnonymousVoterInfo'));

Router::connect('/public-voting/voting-round/save-voter', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'saveVoter'));

Router::connect('/public-voting/voting-round/save-voting-result', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'saveVotingResult'));

Router::connect('/public-voting/voting-round/get-about-page/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getAboutPage'));

Router::connect('/public-voting/voting/linkedin', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'getLinkedinInfo'));

Router::connect('/public-voting/*', array('plugin' => 'PublicVoting2', 'controller' => 'Votings', 'action' => 'index'));

?>