<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Workflow visualization</title>
</head>

<body>
<a href="<?php echo $this->path("workflow_gui.admin.visualizeImage") ?>?workflow=" target="_blank">Open image in a new tabs</a>
<?php
echo $this->image;
?>
<style>
    .node polygon {
        stroke: #191919 !important;
        stroke-width: 0.5;
        fill: rgb(236, 236, 236);

    }
    .node text {
        font-family: 'Open Sans', 'Helvetica Neue', helvetica, arial, verdana, sans-serif;
        font-size: .75em;
    }
    .edge path {
        stroke: #6428b4 !important;
    }
    .edge polygon {
        stroke: #6428b4 !important;
        fill: #6428b4 !important;
    }
    .edge text {
        font-family: 'Open Sans', 'Helvetica Neue', helvetica, arial, verdana, sans-serif;
        font-size: .55em;
        fill: #6428b4 !important;
    }
</style>
</body>

</html>
