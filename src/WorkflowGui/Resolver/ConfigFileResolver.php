<?php

namespace Youwe\Pimcore\WorkflowGui\Resolver;

use Symfony\Component\Filesystem\Filesystem;

class ConfigFileResolver implements ConfigFileResolverInterface
{
    protected $configFile;

    /**
     * @param $configFile
     */
    public function __construct($configFile)
    {
        $this->configFile = $configFile;
    }

    /**
     * {@inheritdoc}
     */
    public function getConfigPath()
    {
        $fs = new Filesystem();

        if (!$fs->exists(dirname($this->configFile))) {
            $fs->mkdir(dirname($this->configFile));
        }

        if (!$fs->exists($this->configFile)) {
            $fs->touch($this->configFile);
        }

        return $this->configFile;
    }
}
