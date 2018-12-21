<?php

namespace Youwe\Pimcore\WorkflowGui\Repository;

use Pimcore\Bundle\CoreBundle\DependencyInjection\Configuration;
use Symfony\Component\Config\Definition\Processor;
use Symfony\Component\Yaml\Yaml;
use Youwe\Pimcore\WorkflowGui\Resolver\ConfigFileResolverInterface;

class WorkflowRepository implements WorkflowRepositoryInterface
{
    /**
     * @var ConfigFileResolverInterface
     */
    protected $configFileResolver;

    /**
     * @param ConfigFileResolverInterface $configFileResolver
     */
    public function __construct(ConfigFileResolverInterface $configFileResolver)
    {
        $this->configFileResolver = $configFileResolver;
    }

    /**
     * {@inheritdoc}
     */
    public function findAll()
    {
        return $this->processConfiguration();
    }

    /**
     * {@inheritdoc}
     */
    public function find($id)
    {
        $all = $this->findAll();
        $filtered = array_filter(
            $all,
            function ($key) use ($id) {
                return $id === $key;
            },
            ARRAY_FILTER_USE_KEY
        );

        return reset($filtered);
    }

    /**
     * @param string $configFile
     * @return array
     */
    protected function processConfiguration()
    {
        $config = Yaml::parse(
            file_get_contents($this->configFileResolver->getConfigPath())
        );

        $configuration = new Configuration();
        $processor = new Processor();

        $config = $processor->processConfiguration($configuration, $config ?? []);

        return $config['workflows'];
    }
}