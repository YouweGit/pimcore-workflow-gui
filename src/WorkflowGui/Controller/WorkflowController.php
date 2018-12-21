<?php

namespace Youwe\Pimcore\WorkflowGui\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Youwe\Pimcore\WorkflowGui\Repository\WorkflowRepositoryInterface;

class WorkflowController extends AdminController
{
    /**
     * @var WorkflowRepositoryInterface
     */
    protected $repository;

    /**
     * @param WorkflowRepositoryInterface $repository
     */
    public function __construct(WorkflowRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function listAction(Request $request)
    {
        return $this->json(array_keys($this->repository->findAll()));
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function getAction(Request $request)
    {
        $id = $request->get('id');
        $workflow = $this->repository->find($id);

        if (!$workflow) {
            throw new NotFoundHttpException();
        }

        return $this->json([$id => $workflow]);
    }
}
