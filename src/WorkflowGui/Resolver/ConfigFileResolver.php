<?php
/**
 * Workflow Pimcore Plugin
 *
 * LICENSE
 *
 * This source file is subject to the GNU General Public License version 3 (GPLv3)
 * For the full copyright and license information, please view the LICENSE.md and gpl-3.0.txt
 * files that are distributed with this source code.
 *
 * @copyright  Copyright (c) 2018-2019 Youwe (https://www.youwe.nl)
 * @license    https://github.com/YouweGit/pimcore-workflow-gui/blob/master/LICENSE.md     GNU General Public License version 3 (GPLv3)
 */

declare(strict_types=1);

namespace Youwe\Pimcore\WorkflowGui\Resolver;

use Symfony\Component\Filesystem\Filesystem;

class ConfigFileResolver implements ConfigFileResolverInterface
{
    protected $configFile;

    public function __construct(string $configFile)
    {
        $this->configFile = $configFile;
    }

    public function getConfigPath(): string
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
