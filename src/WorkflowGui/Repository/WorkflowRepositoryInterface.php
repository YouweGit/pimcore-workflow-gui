<?php

namespace Youwe\Pimcore\WorkflowGui\Repository;

interface WorkflowRepositoryInterface
{
    /**
     * @return array
     */
    public function findAll();

    /**
     * @param $id
     * @return array
     */
    public function find($id);
}
