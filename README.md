# Pimcore - Workflow GUI

## Requirements
 - Pimcore 5.4

Workflow GUI adds a User Interface for configuring Pimcore Workflows.

## Getting started
 * Install via composer ```composer require youwe/workflow-gui dev-master```
 * Enable via command-line (or inside the pimcore extension manager): ```bin/console pimcore:bundle:enable WorkflowGuiBundle```
 * Install via command-line (or inside the pimcore extension manager): ```bin/console pimcore:bundle:install WorkflowGuiBundle```
 * Make sure that the Bundles generated config is loaded (app/config/config.yml): ```../../var/bundles/workflow-gui/workflow.yml```

## Configuration

 * Inside your project, go to settings -> Workflows
 * Click in Add Workflow and enter the name of the new Workflow
 * At the Settings tab, the Label property is a required field
 * At the Supports tab, the Class property is a required field
 * At the Places tab, the Places are a required field
 * At the Transitions tab, the Transitions are a required field
 
 For more information about the available options and description of the fields, go to the following URL:
 https://pimcore.com/docs/5.x/Development_Documentation/Workflow_Management/Configuration_Details.html

## Workflow History

In the "Notes & Events" tab, there is a list with every action used on the object via the Workflow module.

## Workflow Overview

If workflows are configured for a Pimcore element, an additional tab with workflow details like all configured workflows, their current places, and a workflow graph is added to Pimcore element detail page.

To render the graph, ```Graphviz``` is needed as an additional system requirement.
