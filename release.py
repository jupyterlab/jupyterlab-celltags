#!/usr/bin/env python

import argparse as argp
import json
import subprocess


def npmjs(dry=False):
    """release on npmjs
    """
    # get single source of truth
    with open('package.json') as f:
        info = json.load(f)

    version = info['version']

    tag(version, dry=dry)

    if dry:
        # dry run build and release
        print('doing a dry run: `npm publish --access public --dry-run`')
        subprocess.run(['npm', 'publish', '--access', 'public', '--dry-run'])
    else:
        # build and release
        print('publishing to npm: `npm publish --access public`')
        subprocess.run(['npm', 'publish', '--access', 'public'])


def tag(version, dry=False):
    """git tagging
    """
    tag = f"v{version}"

    if dry:
        print(f'would release with git tag: {tag}')
    else:
        subprocess.run(['git', 'tag', tag])
        subprocess.run(['git', 'push', 'origin', tag])


def main():
    parser = argp.ArgumentParser()

    parser.add_argument('-d', '--dry', action='store_true')

    parsed = vars(parser.parse_args())
    dry = 'dry' in parsed and parsed['dry']

    npmjs(dry=dry)


if __name__=='__main__':
    main()
