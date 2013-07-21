<?php

  require('../libs/docdown/docdown.php');

  // generate Markdown
  $markdown = docdown(array(
    'path'  => '../lodash.join.js',
    'title' => 'Lo-Dash Join plugin <sup>v0.1</sup>',
    'toc'   => 'categories',
  ));

  // save to a .md file
  file_put_contents('reference.md', $markdown);

?>