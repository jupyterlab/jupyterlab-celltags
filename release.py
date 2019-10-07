#!/usr/bin/env python

import json
import subprocess

## get single source of truth
with open('package.json') as f:
    info = json.load(f)

version = info['version']


## git tagging
tag = f"v{version}"

subprocess.run(['git', 'tag', tag])
subprocess.run(['git', 'push', 'origin', tag])


## npmjs stuff
# dry run build and release
# subprocess.run(['npm', 'publish', '--access', 'public', '--dry-run'])

# build and release
subprocess.run(['npm', 'publish', '--access', 'public'])
