# Pimcore - Workflow GUI

## Requirements
 - Pimcore 10.0.x

Workflow GUI adds a User Interface for configuring Pimcore Workflows.

## Getting started
 * Install via composer ```composer require youwe/workflow-gui```
 * Enable via command-line (or inside the pimcore extension manager): ```bin/console pimcore:bundle:enable WorkflowGuiBundle```
 * Install via command-line (or inside the pimcore extension manager): ```bin/console pimcore:bundle:install WorkflowGuiBundle```
 * Make sure that the Bundles generated config is loaded (config/config.yaml): ```../var/bundles/workflow-gui/workflow.yml```

## Example workflow
Put the workflow below in the following location ``var/bundles/workflow-gui/workflow.yml`` and change the class ``Pimcore\Model\DataObject\Test`` to the dataobject you want to apply it to.
```yaml
pimcore:
    workflows:
        exampleWorkflow:
            enabled: true
            priority: 1
            label: 'Example workflow'
            initial_markings: placeA
            type: workflow
            audit_trail:
                enabled: true
            marking_store:
                type: state_table
            support_strategy:
                type: expression
                arguments:
                    - Pimcore\Model\DataObject\Test
                    - is_fully_authenticated()
            places:
                placeA:
                    visibleInHeader: true
                    title: 'Place A'
                    label: 'Place A'
                    color: '#eb0058'
                placeB:
                    title: 'Place B'
                    visibleInHeader: true
                    label: 'Place B'
                    color: '#00800f'
            transitions:
                placeAtoB:
                    from:
                        - placeA
                    to:
                        - placeB
                    options:
                        label: 'Place A to B'
                        changePublishedState: no_change
                        notes:
                            commentEnabled: false
                            additionalFields: {  }
            globalActions: {  }

```

## Configuration

 * Inside your project, go to settings -> Workflows
 * Click in Add Workflow and enter the name of the new Workflow
 * At the Settings tab, the Label property is a required field
 * At the Supports tab, the Class property is a required field
 * At the Places tab, the Places are a required field
 * At the Transitions tab, the Transitions are a required field
 
For more information about the available options and description of the fields, go to the following URL:
[Pimcore-Documentation/WorkflowManagement/ConfigurationDetails](https://pimcore.com/docs/5.x/Development_Documentation/Workflow_Management/Configuration_Details/index.html)

## Workflow History

In the "Notes & Events" tab, there is a list with every action used on the object via the Workflow module.

## Workflow Overview

If workflows are configured for a Pimcore element, an additional tab with workflow details like all configured workflows, their current places, and a workflow graph is added to Pimcore element detail page.

To render the graph, ```Graphviz``` is needed as an additional system requirement.
